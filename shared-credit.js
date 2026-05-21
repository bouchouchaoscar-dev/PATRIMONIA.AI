/* shared-credit.js — SP (Simulators Pro) credit engine
   Moteur de calcul crédit immobilier : mensualité, amortissement, TAEG
   ────────────────────────────────────────────────────────────
   Usage : <script src="shared-credit.js"></script>
           const m = SP.credit.mensualite(200000, 3.5, 25);
           const tbl = SP.credit.tableau(200000, 3.5, 25, 'amort', 0.0036);
   ──────────────────────────────────────────────────────────── */
(function(win) {
  'use strict';
  var SP = win.SP = win.SP || {};
  var credit = SP.credit = SP.credit || {};

  /* Mensualité d'un prêt amortissable classique
     - P : capital emprunté
     - tauxAnnuel : en % (3.5 = 3,5 %)
     - dureeAns : durée en années
     Retourne 0 si paramètres invalides. */
  credit.mensualite = function(P, tauxAnnuel, dureeAns) {
    P = +P || 0;
    dureeAns = +dureeAns || 0;
    if (P <= 0 || dureeAns <= 0) return 0;
    var n = dureeAns * 12;
    var r = (+tauxAnnuel || 0) / 100 / 12;
    if (r === 0) return P / n;
    return P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  };

  /* Mensualité d'assurance emprunteur (linéaire sur capital initial)
     - P : capital initial
     - tauxAssurAnnuel : en % (0.36 = 0,36 %) */
  credit.mensAssur = function(P, tauxAssurAnnuel) {
    return (+P || 0) * (+tauxAssurAnnuel || 0) / 100 / 12;
  };

  /* Capital empruntable depuis une mensualité cible
     Inverse de credit.mensualite */
  credit.capitalDepuisMens = function(mensCible, tauxAnnuel, dureeAns) {
    mensCible = +mensCible || 0;
    dureeAns = +dureeAns || 0;
    if (mensCible <= 0 || dureeAns <= 0) return 0;
    var n = dureeAns * 12;
    var r = (+tauxAnnuel || 0) / 100 / 12;
    if (r === 0) return mensCible * n;
    return mensCible * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  };

  /* Tableau d'amortissement mensuel
     Types supportés :
     - 'amort'      : amortissable classique
     - 'dif-partiel': différé partiel (paiement intérêts seuls pendant k mois, puis amort)
     - 'dif-total'  : différé total (intérêts capitalisés pendant k mois)
     - 'infine'     : in fine (intérêts seuls, capital remboursé à l'échéance)

     Retourne { schedule, coutCredit, mensualite, capitalAmorti }
     schedule[i] = { mois, mens, interets, capital, restant }
  */
  credit.tableau = function(P, tauxAnnuel, dureeAns, type, tauxAssur, dureeDiffereMois) {
    P = +P || 0;
    var r = (+tauxAnnuel || 0) / 100 / 12;
    var n = (+dureeAns || 0) * 12;
    var k = +dureeDiffereMois || 0;
    type = type || 'amort';
    var Massur = credit.mensAssur(P, tauxAssur);

    var schedule = [];
    var restant = P;
    var totalInteretsPayes = 0;

    if (type === 'amort' || (type === 'dif-partiel' && k <= 0)) {
      var M = credit.mensualite(P, tauxAnnuel, dureeAns);
      for (var i = 1; i <= n; i++) {
        var interetsM = restant * r;
        var capM = M - interetsM;
        restant -= capM;
        totalInteretsPayes += interetsM;
        schedule.push({ mois: i, mens: M + Massur, interets: interetsM, capital: capM, restant: Math.max(0, restant) });
      }
      return { schedule: schedule, mensualite: M, mensTC: M + Massur, coutCredit: totalInteretsPayes, capitalAmorti: P };
    }

    if (type === 'dif-partiel') {
      // Phase 1 : intérêts seuls pendant k mois (capital intact)
      var interetsMens1 = P * r;
      for (var j = 1; j <= k; j++) {
        schedule.push({ mois: j, mens: interetsMens1 + Massur, interets: interetsMens1, capital: 0, restant: P });
        totalInteretsPayes += interetsMens1;
      }
      // Phase 2 : amortissable sur durée restante
      var nRest = n - k;
      var M2 = credit.mensualite(P, tauxAnnuel, nRest / 12);
      restant = P;
      for (var p = 1; p <= nRest; p++) {
        var iM = restant * r;
        var cM = M2 - iM;
        restant -= cM;
        totalInteretsPayes += iM;
        schedule.push({ mois: k + p, mens: M2 + Massur, interets: iM, capital: cM, restant: Math.max(0, restant) });
      }
      return { schedule: schedule, mensualite: M2, mensTC: M2 + Massur, mensPhase1: interetsMens1 + Massur, coutCredit: totalInteretsPayes, capitalAmorti: P };
    }

    if (type === 'dif-total') {
      // Phase 1 : aucun paiement (sauf assurance), intérêts capitalisés
      var Pgrossi = P * Math.pow(1 + r, k);
      var interetsCapitalises = Pgrossi - P;
      for (var q = 1; q <= k; q++) {
        schedule.push({ mois: q, mens: Massur, interets: 0, capital: 0, restant: P * Math.pow(1 + r, q) });
      }
      // Phase 2 : amortissable sur capital grossi
      var nRest2 = n - k;
      var M3 = credit.mensualite(Pgrossi, tauxAnnuel, nRest2 / 12);
      restant = Pgrossi;
      for (var s = 1; s <= nRest2; s++) {
        var iM3 = restant * r;
        var cM3 = M3 - iM3;
        restant -= cM3;
        totalInteretsPayes += iM3;
        schedule.push({ mois: k + s, mens: M3 + Massur, interets: iM3, capital: cM3, restant: Math.max(0, restant) });
      }
      return { schedule: schedule, mensualite: M3, mensTC: M3 + Massur, mensPhase1: Massur, capitalGrossi: Pgrossi, interetsCapitalises: interetsCapitalises, coutCredit: totalInteretsPayes + interetsCapitalises, capitalAmorti: Pgrossi };
    }

    if (type === 'infine') {
      // Intérêts seuls pendant toute la durée, capital remboursé en bloc
      var Mint = P * r;
      for (var t = 1; t < n; t++) {
        schedule.push({ mois: t, mens: Mint + Massur, interets: Mint, capital: 0, restant: P });
        totalInteretsPayes += Mint;
      }
      // Dernier mois : intérêts + capital
      schedule.push({ mois: n, mens: Mint + P + Massur, interets: Mint, capital: P, restant: 0 });
      totalInteretsPayes += Mint;
      return { schedule: schedule, mensualite: Mint, mensTC: Mint + Massur, coutCredit: totalInteretsPayes, capitalAmorti: P };
    }

    return { schedule: [], mensualite: 0, coutCredit: 0, capitalAmorti: 0 };
  };

  /* Intérêts payés sur la N-ième année (utile pour les déclarations fonçières)
     - returnAnnee : 1-based, année d'exercice */
  credit.interetsAnnee = function(P, tauxAnnuel, dureeAns, anneeNumero) {
    var tbl = credit.tableau(P, tauxAnnuel, dureeAns, 'amort', 0, 0);
    var sched = tbl.schedule;
    var start = (anneeNumero - 1) * 12;
    var end = Math.min(start + 12, sched.length);
    var sum = 0;
    for (var i = start; i < end; i++) sum += sched[i].interets;
    return sum;
  };

  /* Capital restant dû à la fin de l'année N */
  credit.capitalRestantApresAnnee = function(P, tauxAnnuel, dureeAns, anneeNumero) {
    var tbl = credit.tableau(P, tauxAnnuel, dureeAns, 'amort', 0, 0);
    var sched = tbl.schedule;
    var idx = Math.min(anneeNumero * 12 - 1, sched.length - 1);
    return idx >= 0 ? sched[idx].restant : P;
  };

  /* TAEG actuariel par bissection (taux annuel équivalent à un flux donné)
     - capital : montant net reçu
     - flux : tableau des mensualités payées (positives)
     Retourne le taux annuel actuariel en %. */
  credit.taeg = function(capital, flux) {
    capital = +capital || 0;
    if (capital <= 0 || !flux || !flux.length) return 0;
    var n = flux.length;

    function npv(rMens) {
      var s = -capital;
      for (var i = 0; i < n; i++) s += flux[i] / Math.pow(1 + rMens, i + 1);
      return s;
    }

    var lo = -0.02, hi = 0.5, mid = 0;
    for (var iter = 0; iter < 80; iter++) {
      mid = (lo + hi) / 2;
      if (npv(mid) > 0) lo = mid; else hi = mid;
    }
    return (Math.pow(1 + mid, 12) - 1) * 100;
  };

})(window);
