/* shared-tax.js — SP (Simulators Pro) tax engine
   Moteur fiscal commun : IR, succession, donation, plus-values, démembrement
   Toutes les constantes proviennent de SP.CONST (shared-constants.js requis)
   ────────────────────────────────────────────────────────────
   Usage : <script src="shared-constants.js"></script>
           <script src="shared-tax.js"></script>
           const ir = SP.tax.calcIR(50000, 2);
           const dr = SP.tax.calcSuccession(150000, 'enfant');
   ──────────────────────────────────────────────────────────── */
(function(win) {
  'use strict';
  var SP = win.SP = win.SP || {};
  var tax = SP.tax = SP.tax || {};

  function ensureConst() {
    if (!SP.CONST) throw new Error('shared-constants.js doit être chargé avant shared-tax.js');
  }

  /* Applique un barème progressif (tranches) à une assiette
     brackets : [{ from, to, rate }] OU [{ lim, rate }]
     Retourne { total, detail: [{ tranche, base, taxe, taux }] } */
  tax.applyBrackets = function(amount, brackets) {
    amount = +amount || 0;
    var total = 0, detail = [];
    var prev = 0;
    for (var i = 0; i < brackets.length; i++) {
      var b = brackets[i];
      var hi = (b.to !== undefined) ? b.to : b.lim;
      var lo = (b.from !== undefined) ? b.from : prev;
      var rate = b.rate !== undefined ? b.rate : b.t;
      if (amount <= lo) {
        detail.push({ from: lo, to: hi, rate: rate, base: 0, taxe: 0 });
        prev = hi;
        continue;
      }
      var taxable = Math.min(amount, hi) - lo;
      var taxe = taxable * rate;
      total += taxe;
      detail.push({ from: lo, to: hi, rate: rate, base: taxable, taxe: taxe });
      prev = hi;
      if (amount <= hi) break;
    }
    return { total: total, detail: detail };
  };

  /* ─────────────  IMPÔT SUR LE REVENU  ───────────── */

  /* Calcule l'impôt brut par parts fiscales (quotient familial)
     - rni : revenu net imposable global du foyer
     - parts : nombre de parts fiscales (1 / 1.5 / 2 / 2.5 ...)
     Retourne { impotBrut, impotParPart, tmi, detail } */
  tax.calcIR = function(rni, parts) {
    ensureConst();
    rni = +rni || 0;
    parts = +parts || 1;
    if (rni <= 0) return { impotBrut: 0, impotParPart: 0, tmi: 0, detail: [] };
    var rniParPart = rni / parts;
    var r = tax.applyBrackets(rniParPart, SP.CONST.IR.BRACKETS);
    var impot = r.total * parts;
    // TMI = taux de la dernière tranche atteinte
    var tmi = 0;
    for (var i = 0; i < r.detail.length; i++) {
      if (r.detail[i].base > 0) tmi = r.detail[i].rate;
    }
    return { impotBrut: impot, impotParPart: r.total, tmi: tmi, detail: r.detail };
  };

  /* Plafonnement du quotient familial (CGI 197 I 2)
     Compare l'IR au QF "réel" avec l'IR au QF plafonné à 2 parts
     Retourne { impotPlafonne, ecartPlafonne } */
  tax.plafondQF = function(rni, parts, partsBase) {
    ensureConst();
    partsBase = +partsBase || 1;
    var ecartParts = Math.max(0, parts - partsBase);
    var demiParts = ecartParts * 2; // nombre de demi-parts supplémentaires
    var irPlein = tax.calcIR(rni, parts).impotBrut;
    var irRef = tax.calcIR(rni, partsBase).impotBrut;
    var avantageReel = irRef - irPlein;
    var avantageMax = demiParts * SP.CONST.IR.PLAFOND_QF_DEMI_PART;
    if (avantageReel <= avantageMax) {
      return { impotPlafonne: irPlein, plafonne: false, avantageReel: avantageReel, avantageMax: avantageMax };
    }
    return { impotPlafonne: irRef - avantageMax, plafonne: true, avantageReel: avantageReel, avantageMax: avantageMax };
  };

  /* Décote IR (CGI 197 I 4) */
  tax.decoteIR = function(impotBrut, parts, couple) {
    ensureConst();
    var seuil = couple ? SP.CONST.IR.DECOTE_COUPLE : SP.CONST.IR.DECOTE_CELIB;
    var decote = Math.max(0, seuil - SP.CONST.IR.DECOTE_TAUX * impotBrut);
    return Math.min(decote, impotBrut);
  };

  /* CEHR (Contribution exceptionnelle sur les hauts revenus, CGI 223 sexies) */
  tax.calcCEHR = function(rfr, couple) {
    ensureConst();
    var seuil1 = couple ? 250000 : 250000;
    var seuil2 = couple ? 1000000 : 500000;
    if (rfr <= seuil1) return 0;
    var t1 = Math.min(rfr, seuil2) - seuil1;
    var t2 = Math.max(0, rfr - seuil2);
    return t1 * SP.CONST.IR.CEHR_TAUX_1 + t2 * SP.CONST.IR.CEHR_TAUX_2;
  };

  /* Abattement salaire 10 % borné min/max */
  tax.abattSalaire = function(salaireBrut) {
    ensureConst();
    var a = (+salaireBrut || 0) * SP.CONST.IR.ABATT_SAL_PCT;
    return Math.min(SP.CONST.IR.ABATT_SAL_MAX, Math.max(SP.CONST.IR.ABATT_SAL_MIN, a));
  };

  /* ─────────────  IFI  ───────────── */

  /* Calcule l'IFI brut avec décote
     - patrimoineNet : actif net taxable (après abattement RP, dettes)
     Retourne { impot, decote, detail } */
  tax.calcIFI = function(patrimoineNet) {
    ensureConst();
    if (patrimoineNet < SP.CONST.IFI.SEUIL) return { impot: 0, decote: 0, detail: [] };
    var r = tax.applyBrackets(patrimoineNet, SP.CONST.IFI.BRACKETS);
    var impot = r.total;
    var decote = 0;
    if (patrimoineNet <= SP.CONST.IFI.DECOTE_PLAFOND) {
      decote = Math.max(0, SP.CONST.IFI.DECOTE_BASE - SP.CONST.IFI.DECOTE_COEFF * patrimoineNet);
      impot -= decote;
    }
    return { impot: Math.max(0, impot), decote: decote, detail: r.detail };
  };

  /* ─────────────  DROITS DE SUCCESSION / DONATION  ───────────── */

  function bareme(lien, type) {
    ensureConst();
    type = type || 'don';
    var C = type === 'succ' ? SP.CONST.SUCC : SP.CONST.DON;
    if (lien === 'enfant' || lien === 'petit_enfant' || lien === 'arriere_pet_enf' || lien === 'ascendant') return C.BAREME_DIRECTE || SP.CONST.DON.BAREME_DIRECTE;
    if (lien === 'frere_soeur') return C.BAREME_FRERE || SP.CONST.DON.BAREME_FRERE;
    return null; // taux fixe géré séparément
  }

  function tauxFixe(lien) {
    if (lien === 'neveu_niece') return 0.55;
    if (lien === 'autre' || lien === 'tiers') return 0.60;
    return null;
  }

  function abatt(lien, type) {
    ensureConst();
    var C = type === 'succ' ? SP.CONST.SUCC : SP.CONST.DON;
    return (C.ABATT && C.ABATT[lien] != null) ? C.ABATT[lien] : 0;
  }

  /* Calcule les droits sur une base après abattement
     - montant : valeur brute reçue
     - lien : 'conjoint_pacs' | 'enfant' | 'petit_enfant' | 'frere_soeur' | 'neveu_niece' | 'autre' | 'handicape'
     - type : 'don' (donation) ou 'succ' (succession)
     Retourne { abattement, base, droits, tauxEffectif } */
  tax.calcDroits = function(montant, lien, type) {
    montant = +montant || 0;
    var ab = abatt(lien, type);
    if (ab === Infinity) return { abattement: Infinity, base: 0, droits: 0, tauxEffectif: 0 };
    var base = Math.max(0, montant - ab);
    if (base === 0) return { abattement: ab, base: 0, droits: 0, tauxEffectif: 0 };
    var b = bareme(lien, type);
    var droits = 0;
    if (b) {
      droits = tax.applyBrackets(base, b).total;
    } else {
      var t = tauxFixe(lien);
      if (t !== null) droits = base * t;
    }
    return { abattement: ab, base: base, droits: droits, tauxEffectif: montant > 0 ? droits / montant : 0 };
  };

  /* ─────────────  ASSURANCE-VIE TRANSMISSION  ───────────── */

  /* Calcule les droits 990 I sur un montant attribué à un bénéficiaire
     - montant : capital reçu par le bénéficiaire (avant 70 ans)
     - lien : 'conjoint_pacs' exonéré (art. 796-0 bis) */
  tax.calc990I = function(montant, lien) {
    ensureConst();
    if (lien === 'conjoint_pacs') return { abattement: Infinity, base: 0, droits: 0 };
    var abatt = SP.CONST.AV.ABATT_990I;
    var base = Math.max(0, (+montant || 0) - abatt);
    if (base === 0) return { abattement: abatt, base: 0, droits: 0 };
    var seuil = SP.CONST.AV.SEUIL_990I_1;
    var droits;
    if (base <= seuil) droits = base * SP.CONST.AV.TAUX_990I_1;
    else droits = seuil * SP.CONST.AV.TAUX_990I_1 + (base - seuil) * SP.CONST.AV.TAUX_990I_2;
    return { abattement: abatt, base: base, droits: droits };
  };

  /* ─────────────  PLUS-VALUES IMMOBILIÈRES  ───────────── */

  /* Abattement pour durée de détention sur la plus-value
     Retourne { abattementIR, abattementPS, pvNetteIR, pvNettePS } */
  tax.abattPVImmo = function(pvBrute, dureeDetentionAns) {
    ensureConst();
    var d = +dureeDetentionAns || 0;
    var aIR = 0, aPS = 0;
    if (d >= 22) aIR = 1;
    else if (d > 5) aIR = Math.min(1, (Math.min(d, 21) - 5) * SP.CONST.PV_IMMO.ABATT_IR_PCT_PAR_AN_6_21);

    if (d >= 30) aPS = 1;
    else if (d > 5) {
      var ans_6_21 = Math.min(d, 21) - 5;
      var ans_22 = d >= 22 ? 1 : 0;
      var ans_23_30 = Math.max(0, Math.min(d, 30) - 22);
      aPS = ans_6_21 * SP.CONST.PV_IMMO.ABATT_PS_PCT_AN_6_21
          + ans_22  * SP.CONST.PV_IMMO.ABATT_PS_PCT_AN_22
          + ans_23_30 * SP.CONST.PV_IMMO.ABATT_PS_PCT_AN_23_30;
      aPS = Math.min(1, aPS);
    }
    var pvBr = +pvBrute || 0;
    return {
      abattementIR: aIR,
      abattementPS: aPS,
      pvNetteIR: pvBr * (1 - aIR),
      pvNettePS: pvBr * (1 - aPS)
    };
  };

  /* Surtaxe plus-value > 50 000 € (CGI 1609 nonies G) */
  tax.surtaxePV = function(pvNetteIR) {
    ensureConst();
    pvNetteIR = +pvNetteIR || 0;
    if (pvNetteIR <= SP.CONST.PV_IMMO.SURTAXE_SEUIL) return 0;
    return tax.applyBrackets(pvNetteIR, SP.CONST.PV_IMMO.SURTAXE_TRANCHES).total;
  };

  /* ─────────────  DÉMEMBREMENT (CGI 669 / 670)  ───────────── */

  /* Coefficient nue-propriété viager selon l'âge de l'usufruitier */
  tax.coeffNPViager = function(ageUsufruitier) {
    ensureConst();
    var a = +ageUsufruitier || 0;
    var table = SP.CONST.DEMEMBREMENT.VIAGER;
    for (var i = 0; i < table.length; i++) {
      if (a <= table[i].age_max) return { np: table[i].np, us: table[i].us };
    }
    return { np: 0.90, us: 0.10 };
  };

  /* Coefficient nue-propriété temporaire (durée en années) */
  tax.coeffNPTemp = function(dureeAns) {
    ensureConst();
    var d = +dureeAns || 0;
    var tranches = Math.min(SP.CONST.DEMEMBREMENT.TEMP_TRANCHE_MAX, Math.ceil(d / 10));
    var us = tranches * SP.CONST.DEMEMBREMENT.TEMP_PAR_TRANCHE_10;
    return { np: 1 - us, us: us };
  };

  /* ─────────────  PER (Plan Épargne Retraite)  ───────────── */

  /* Plafond annuel de déduction PER (art. 163 quatervicies / 154 bis pour TNS)
     - revenuPro : revenu professionnel net (salaire net OU bénéfice TNS)
     - isTNS : true si travailleur non salarié
     Retourne plafond annuel hors reports antérieurs */
  tax.plafondPER = function(revenuPro, isTNS) {
    ensureConst();
    revenuPro = +revenuPro || 0;
    var P = SP.CONST.PER;
    var pass = SP.CONST.PASS.ANNUEL_2026 || P.PASS_REF;
    if (isTNS) {
      var base = Math.min(revenuPro, 8 * pass);
      var part1 = base * P.TNS_PCT_BAS;
      var part2 = Math.max(0, base - pass) * P.TNS_PCT_HAUT;
      return Math.min(P.TNS_PLAFOND_MAX, Math.max(P.PLAFOND_MIN, part1 + part2));
    }
    // Salarié / dirigeant : max(10 % PASS, min(10 % revenu, 8 PASS × 10 %))
    var calc = Math.min(revenuPro * P.PCT_REVENU, 8 * pass * P.PCT_REVENU);
    return Math.max(P.PLAFOND_MIN, calc);
  };

  /* Fraction imposable d'une rente viagère à titre onéreux (CGI 158-6)
     Selon l'âge d'entrée en jouissance de la rente */
  tax.fractionRenteViagere = function(ageEntreeJouissance) {
    ensureConst();
    var a = +ageEntreeJouissance || 0;
    var t = SP.CONST.PER.FRACTIONS_RENTE_VIAGERE;
    for (var i = 0; i < t.length; i++) if (a <= t[i].age_max) return t[i].fraction;
    return 0.30;
  };

  /* Fiscalité sortie PER en capital
     - capital : montant total disponible
     - versementsDeduits : montant cumulé des versements déduits à l'entrée
     - versementsNonDeduits : montant cumulé des versements non déduits
     - tmiSortie : taux marginal d'imposition à la sortie (0 à 0.45)
     Retourne IR et PS détaillés */
  tax.sortiePERCapital = function(capital, versementsDeduits, versementsNonDeduits, tmiSortie) {
    ensureConst();
    capital = +capital || 0;
    versementsDeduits = +versementsDeduits || 0;
    versementsNonDeduits = +versementsNonDeduits || 0;
    tmiSortie = +tmiSortie || 0;
    var versementsTotaux = versementsDeduits + versementsNonDeduits;
    var gainsTotaux = Math.max(0, capital - versementsTotaux);
    // Gains : PFU 30 % (12,8 IR + 17,2 PS) — pas d'option pour barème dans simulation simple
    var irGains = gainsTotaux * SP.CONST.PFU.IR;
    var psGains = gainsTotaux * SP.CONST.PFU.PS;
    // Versements déduits : barème IR (TMI), pas de PS
    var irVersementsDeduits = versementsDeduits * tmiSortie;
    // Versements non déduits : exonérés
    var totalImpot = irGains + psGains + irVersementsDeduits;
    return {
      capitalBrut: capital,
      versementsDeduits: versementsDeduits,
      versementsNonDeduits: versementsNonDeduits,
      gainsTotaux: gainsTotaux,
      irGains: irGains,
      psGains: psGains,
      irVersementsDeduits: irVersementsDeduits,
      totalImpot: totalImpot,
      capitalNet: capital - totalImpot
    };
  };

  /* Fiscalité sortie PER en rente viagère
     - capital : capital cédé pour constituer la rente
     - ageRetraite : âge d'entrée en jouissance
     - tmiSortie : TMI à la retraite
     - esperanceVie : optionnel (défaut SP.CONST.PER.ESPERANCE_VIE_RETRAITE) */
  tax.sortiePERRente = function(capital, ageRetraite, tmiSortie, esperanceVie) {
    ensureConst();
    capital = +capital || 0;
    esperanceVie = +esperanceVie || SP.CONST.PER.ESPERANCE_VIE_RETRAITE;
    var renteAnnuelle = esperanceVie > 0 ? capital / esperanceVie : 0;
    var fraction = tax.fractionRenteViagere(ageRetraite);
    var fractionImposable = renteAnnuelle * fraction;
    var irRente = fractionImposable * (+tmiSortie || 0);
    var psRente = fractionImposable * SP.CONST.PS.RATE;
    return {
      renteAnnuelle: renteAnnuelle,
      fraction: fraction,
      fractionImposable: fractionImposable,
      irRente: irRente,
      psRente: psRente,
      renteNetteAnnuelle: renteAnnuelle - irRente - psRente
    };
  };

})(window);
