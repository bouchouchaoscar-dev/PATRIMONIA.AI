/* shared-constants.js — SP (Simulators Pro) constants
   Single source of truth for fiscal/legal constants — Année 2026
   Sources : CGI · BOFiP · impots.gouv · service-public
   ────────────────────────────────────────────────────────────
   Usage : <script src="shared-constants.js"></script>
           const tmi = SP.CONST.IR.BRACKETS[3].rate;
   ──────────────────────────────────────────────────────────── */
(function(win) {
  'use strict';
  var SP = win.SP = win.SP || {};

  SP.CONST = {
    YEAR: 2026,

    /* ── IMPÔT SUR LE REVENU — CGI art. 197 ── */
    IR: {
      // Barème progressif (revenus 2025 imposés en 2026)
      BRACKETS: [
        { from: 0,      to: 11497,    rate: 0    },
        { from: 11497,  to: 29315,    rate: 0.11 },
        { from: 29315,  to: 83823,    rate: 0.30 },
        { from: 83823,  to: 180294,   rate: 0.41 },
        { from: 180294, to: Infinity, rate: 0.45 }
      ],
      // Décote (art. 197 I 4)
      DECOTE_CELIB:        889,    // seuil 1929 € / 0.4525 = appliqué via formule
      DECOTE_COUPLE:      1470,
      DECOTE_TAUX:        0.4525,  // décote = seuil - 0.4525 × IR brut
      // Plafonnement quotient familial (art. 197 I 2)
      PLAFOND_QF_DEMI_PART:  1791, // par demi-part additionnelle
      PLAFOND_QF_PARENT_ISO: 4224, // PAC unique en garde exclusive
      // Abattements
      ABATT_SAL_PCT:       0.10,
      ABATT_SAL_MIN:        495,
      ABATT_SAL_MAX:      14171,
      ABATT_PENSION_PCT:   0.10,
      ABATT_PENSION_MIN:    442,
      ABATT_PENSION_MAX:   4321,
      // Abattement RCM (CGI 158-3)
      ABATT_DIVIDENDES:    0.40,
      // CSG déductible (CGI 154 quinquies)
      CSG_DEDUCT_RCM:      0.068,
      // CEHR — Contribution exceptionnelle haut revenu (CGI 223 sexies)
      CEHR_SEUIL_CELIB:   250000,
      CEHR_SEUIL_COUPLE:  500000,
      CEHR_TAUX_1:         0.03,
      CEHR_TAUX_2:         0.04
    },

    /* ── PRÉLÈVEMENTS SOCIAUX ── */
    PS: {
      RATE:                0.172,  // global revenus du capital
      CSG:                 0.092,
      CRDS:                0.005,
      PSOL:                0.074,
      CSG_DEDUCT_RFRCM:    0.068
    },

    /* ── FLAT TAX / PFU — CGI art. 200 A ── */
    PFU: {
      GLOBAL:              0.30,   // 12,8 IR + 17,2 PS
      IR:                  0.128,
      PS:                  0.172
    },

    /* ── ASSURANCE-VIE — CGI art. 125-0 A / 990 I / 757 B ── */
    AV: {
      // Rachats — art. 125-0 A
      PFU_AVANT8:          0.128,  // taxé avant 8 ans
      PFU_APRES8_BAS:      0.075,  // après 8 ans, primes ≤ 150 000 €
      PFU_APRES8_HAUT:     0.128,  // après 8 ans, primes > 150 000 €
      SEUIL_150K:        150000,
      ABATT_RACHAT_CELIB:  4600,
      ABATT_RACHAT_COUPLE: 9200,
      // Transmission — art. 990 I (primes avant 70 ans)
      ABATT_990I:        152500,   // par bénéficiaire
      SEUIL_990I_1:      700000,   // bascule taux
      TAUX_990I_1:         0.20,
      TAUX_990I_2:         0.3125,
      // Transmission — art. 757 B (primes après 70 ans)
      ABATT_757B:         30500    // global, tous bénéficiaires
    },

    /* ── IFI — CGI art. 964 à 983 ── */
    IFI: {
      SEUIL:            1300000,
      ABATT_RP:            0.30,   // résidence principale
      DECOTE_SEUIL:     1300000,
      DECOTE_PLAFOND:   1400000,
      DECOTE_BASE:        17500,   // 17 500 € à 1,3 M€ → 0 € à 1,4 M€
      DECOTE_COEFF:      0.0125,
      BRACKETS: [
        { from: 0,        to: 800000,   rate: 0      },
        { from: 800000,   to: 1300000,  rate: 0.005  },
        { from: 1300000,  to: 2570000,  rate: 0.007  },
        { from: 2570000,  to: 5000000,  rate: 0.01   },
        { from: 5000000,  to: 10000000, rate: 0.0125 },
        { from: 10000000, to: Infinity, rate: 0.015  }
      ],
      // Plafonnement (CGI 979) : IFI + IR ≤ 75 % du revenu N-1
      PLAFONNEMENT_PCT:    0.75
    },

    /* ── DROITS DE DONATION — CGI art. 779 (abattements) / 777 (barèmes) ── */
    DON: {
      // Abattements par lien (art. 779)
      ABATT: {
        conjoint_pacs:    80724,
        enfant:          100000,
        petit_enfant:     31865,
        arriere_pet_enf:   5310,
        frere_soeur:      15932,
        neveu_niece:       7967,
        handicape:       159325,   // cumulable avec l'abattement personnel
        autre:                0
      },
      // Exonération don familial de sommes d'argent (art. 790 G)
      EXO_DON_FAMILIAL:    31865,
      AGE_MAX_DONATEUR:       80,
      // Délai de rappel fiscal (art. 784)
      DELAI_RAPPEL_ANS:       15,
      // Barème ligne directe (enfants, parents, petits-enfants) — art. 777
      BAREME_DIRECTE: [
        { lim:     8072, rate: 0.05 },
        { lim:    12109, rate: 0.10 },
        { lim:    15932, rate: 0.15 },
        { lim:   552324, rate: 0.20 },
        { lim:   902838, rate: 0.30 },
        { lim:  1805677, rate: 0.40 },
        { lim: Infinity, rate: 0.45 }
      ],
      // Barème entre frères et sœurs
      BAREME_FRERE: [
        { lim:    24430, rate: 0.35 },
        { lim: Infinity, rate: 0.45 }
      ],
      // Parents 4e degré et au-delà
      TAUX_PARENT_LOIN:    0.55,
      // Tiers non parents
      TAUX_TIERS:          0.60
    },

    /* ── DROITS DE SUCCESSION — mêmes barèmes art. 777 ── */
    SUCC: {
      // Conjoint / PACS exonérés (art. 796-0 bis)
      EXO_CONJOINT:        true,
      // Abattements (art. 779) — mêmes valeurs que donation sauf cas particuliers
      ABATT: {
        conjoint_pacs:   Infinity, // exonération
        enfant:           100000,
        petit_enfant:       1594,  // cas rare succession directe
        ascendant:        100000,
        frere_soeur:       15932,
        neveu_niece:        7967,
        handicape:        159325,
        autre:              1594
      },
      // Exonération frère/sœur cohabitant (art. 796-0 ter)
      FRERE_COHAB_AGE:        50,
      FRERE_COHAB_DUREE:       5  // années cohabitation requises
    },

    /* ── PLUS-VALUES IMMOBILIÈRES — CGI art. 150 U à 150 VH ── */
    PV_IMMO: {
      // Abattement IR (art. 150 VC)
      ABATT_IR_PCT_PAR_AN_6_21:   0.06,   // années 6 à 21
      ABATT_IR_PCT_AN_22:         0.04,   // année 22 = exonération
      // Abattement PS
      ABATT_PS_PCT_AN_6_21:       0.0165,
      ABATT_PS_PCT_AN_22:         0.016,
      ABATT_PS_PCT_AN_23_30:      0.09,
      // Taux d'imposition
      TAUX_IR:                    0.19,
      TAUX_PS:                    0.172,
      // Surtaxe CGI art. 1609 nonies G
      SURTAXE_SEUIL:             50000,
      SURTAXE_TRANCHES: [
        { from:  50000, to: 100000, rate: 0.02 },
        { from: 100000, to: 150000, rate: 0.03 },
        { from: 150000, to: 200000, rate: 0.04 },
        { from: 200000, to: 250000, rate: 0.05 },
        { from: 250000, to: Infinity, rate: 0.06 }
      ],
      // Frais
      FORFAIT_FRAIS_ACQUI:        0.075,  // 7,5 % du prix d'achat
      FORFAIT_TRAVAUX_5ANS:       0.15    // 15 % si détention > 5 ans
    },

    /* ── REVENUS FONCIERS — CGI art. 14 à 33 quinquies ── */
    FONCIER: {
      ABATT_MICRO:                0.30,
      SEUIL_MICRO:               15000,
      DEFICIT_IMPUTABLE_MAX:     10700,   // sur revenu global (art. 156 I 3°)
      DEFICIT_REPORT_ANS:           10
    },

    /* ── BIC / MEUBLÉ — CGI art. 50-0, 53 A ── */
    BIC: {
      ABATT_MICRO_STD:            0.50,   // meublé standard
      ABATT_MICRO_CLASSE:         0.71,   // meublé tourisme classé / chambre d'hôte
      SEUIL_MICRO_STD:           77700,
      SEUIL_MICRO_CLASSE:       188700,
      // LMNP : amortissements art. 39 C II
      AMORT_DUREE_BATI:             30,   // années (durée d'usage)
      AMORT_DUREE_MOBILIER:         10,
      AMORT_DUREE_TRAVAUX:          15,
      QUOTITE_TERRAIN:            0.15    // 15 % du foncier non amortissable
    },

    /* ── SOCIÉTÉ — IS / SCI ── */
    IS: {
      TAUX_REDUIT:                0.15,
      SEUIL_REDUIT:              42500,
      TAUX_NORMAL:                0.25,
      // PME conditions (CGI 219 I-b) : CA < 10 M€, capital libéré, ≥ 75 % détenu par PP
      PME_CA_MAX:             10000000
    },

    /* ── PER — Plafonnement art. 163 quatervicies / 154 bis ──
       ⚠️  PASS_REF doit être ACTUALISÉ chaque année (sources : BOSS / Urssaf / service-public).
           Lorsque le PASS change, recalculer PLAFOND_MIN / PLAFOND_MAX / TNS_PLAFOND_MAX. */
    PER: {
      PCT_REVENU:                 0.10,
      PASS_REF:                  48060,   // PASS 2026 officiel (BOSS / Urssaf)
      PLAFOND_MIN:                4806,   // 10 % PASS
      PLAFOND_MAX:               38448,   // 8 PASS × 10 %
      // TNS — Madelin/PER (art. 154 bis CGI) : assiette plus large
      TNS_PCT_BAS:                0.10,   // 10 % du bénéfice imposable
      TNS_PCT_HAUT:               0.15,   // 15 % de la part > 1 PASS, plafond 8 PASS
      TNS_PLAFOND_MAX:           88911,   // 8 PASS × 10 % + 7 PASS × 15 %
      // Délai de report (CGI 163 quatervicies)
      DELAI_REPORT_ANS:              3,
      // Fractions imposables des rentes viagères à titre onéreux (CGI 158-6)
      FRACTIONS_RENTE_VIAGERE: [
        { age_max: 49, fraction: 0.70 },
        { age_max: 59, fraction: 0.50 },
        { age_max: 69, fraction: 0.40 },
        { age_max: 999, fraction: 0.30 }
      ],
      // Sortie capital : versements déduits → barème IR, gains → PFU 30 %
      // Sortie capital : versements non déduits → exonération IR, gains → PFU 30 %
      // Espérance de vie moyenne entrée en retraite (simplifiée pour rente théorique)
      ESPERANCE_VIE_RETRAITE:       22   // ~ 22 ans à 62 ans (INSEE)
    },

    /* ── CRÉDIT IMMOBILIER ── */
    CREDIT: {
      // HCSF — taux d'endettement (CCSF / HCSF)
      TAUX_ENDETTEMENT_MAX:       0.35,
      // Pondération revenus locatifs HCSF
      POND_LOCATIF:               0.70,
      // Plafond durée crédit RP
      DUREE_MAX_ANS:                25,
      DUREE_MAX_VEFA:               27
    },

    /* ── DÉMEMBREMENT — CGI art. 669 (viager) / 670 (temporaire) ── */
    DEMEMBREMENT: {
      // Viager — art. 669 : NP croît avec l'âge de l'usufruitier
      VIAGER: [
        { age_max:  20, np: 0.10, us: 0.90 },
        { age_max:  30, np: 0.20, us: 0.80 },
        { age_max:  40, np: 0.30, us: 0.70 },
        { age_max:  50, np: 0.40, us: 0.60 },
        { age_max:  60, np: 0.50, us: 0.50 },
        { age_max:  70, np: 0.60, us: 0.40 },
        { age_max:  80, np: 0.70, us: 0.30 },
        { age_max:  90, np: 0.80, us: 0.20 },
        { age_max: 999, np: 0.90, us: 0.10 }
      ],
      // Temporaire — art. 670 : US = 23 % par tranche de 10 ans entamée
      TEMP_PAR_TRANCHE_10:        0.23,
      TEMP_TRANCHE_MAX:              4   // 4 tranches max (40 ans)
    },

    /* ── PASS / PMSS — Sécurité sociale ──
       ⚠️  À ACTUALISER chaque année (sources : BOSS / Urssaf / service-public).
           Référence pour PER, PER TNS, IJ Sécurité sociale, plafonds de cotisation. */
    PASS: {
      ANNUEL_2026:               48060,   // PASS 2026 officiel (BOSS / Urssaf)
      MENSUEL:                    4005,
      TRIMESTRIEL:               12015
    }
  };

  /* Helper : retourner un objet en lecture seule pour éviter mutations accidentelles */
  if (Object.freeze) {
    var deepFreeze = function(o) {
      Object.keys(o).forEach(function(k) {
        if (o[k] && typeof o[k] === 'object') deepFreeze(o[k]);
      });
      return Object.freeze(o);
    };
    deepFreeze(SP.CONST);
  }

})(window);
