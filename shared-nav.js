/* shared-nav.js — SP (Simulators Pro) navigation hub
   Menu déroulant catégorisé : favoris, récents, recherche, icônes, descriptions
   ────────────────────────────────────────────────────────────
   Usage HTML :
     <div class="nav-dropdown" id="mainDropdown">
       <button class="nav-dropdown-btn" aria-expanded="false" aria-haspopup="true">
         Simulateurs <svg class="nav-chevron" ...>...</svg>
       </button>
       <div class="nav-dropdown-menu" id="navMenu" role="menu"></div>
     </div>
     <script src="shared-nav.js"></script>
     <script>SP.nav.init();</script>
   ────────────────────────────────────────────────────────────
   AJOUT FUTUR : édition de SP.nav.SIMS / SP.nav.CATEGORIES suffit.
   ──────────────────────────────────────────────────────────── */
(function(win) {
  'use strict';
  var SP = win.SP = win.SP || {};
  var nav = SP.nav = SP.nav || {};

  /* ─── Icônes SVG inline — stroke 1.8 currentColor, viewBox 14×14 ─── */
  var ICONS = {
    fiscalite:    '<path d="M7 1.5v11M3.5 4h7M2 7.5l1.5-3.5 1.5 3.5M2 7.5a1.5 1.5 0 0 0 3 0M9 7.5l1.5-3.5 1.5 3.5M9 7.5a1.5 1.5 0 0 0 3 0"/>',
    immobilier:   '<path d="M2 12V6l5-3.5L12 6v6M5.5 12V8.5h3V12"/>',
    transmission: '<path d="M7 2v3M7 5L4 8M7 5l3 3M3 8h2v4H3zM6 8h2v4H6zM9 8h2v4H9z"/>',
    finance:      '<path d="M2 11.5h10M3 9l2.5-3 2 2L11 4M9.5 4H11v1.5"/>',
    entreprise:   '<path d="M5 6h4v6H5zM2 9h3v3H2zM9 9h3v3H9zM6 2h2v3H6zM3 6h8"/>',
    retraite:     '<path d="M7 1.5v6l3 2M7 1.5a5.5 5.5 0 1 0 5.5 5.5"/>',
    search:       '<path d="M6 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM9.5 9.5L12 12"/>',
    star:         '<path d="M7 1.5l1.7 3.4 3.8.5-2.75 2.65.65 3.75L7 9.95l-3.4 1.85.65-3.75L1.5 5.4l3.8-.5z"/>',
    clock:        '<path d="M7 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM7 4v3.5l2 1.5"/>'
  };

  /* ─── Catégories : ordre + libellé + icône ─── */
  nav.CATEGORIES = [
    { id: 'fiscalite',    label: 'Fiscalité',                  icon: ICONS.fiscalite },
    { id: 'immobilier',   label: 'Immobilier',                 icon: ICONS.immobilier },
    { id: 'retraite',     label: 'Retraite & Épargne',         icon: ICONS.retraite },
    { id: 'transmission', label: 'Transmission & Succession',  icon: ICONS.transmission },
    { id: 'finance',      label: 'Finance & Capitalisation',   icon: ICONS.finance },
    { id: 'entreprise',   label: 'Entreprise & Structuration', icon: ICONS.entreprise }
  ];

  /* ─── Simulateurs : config enrichie ─── */
  nav.SIMS = [
    { id: 'credit',       num:  1, label: 'Crédit immobilier',         href: 'simulator-1.html',
      cats: ['immobilier'],
      desc: 'Mensualité, TAEG et tableau d\'amortissement.',
      keywords: ['emprunt', 'pret', 'taux', 'mensualite', 'taeg', 'differe'] },
    { id: 'ir',           num:  2, label: 'Impôt sur le revenu',       href: 'simulator-2.html',
      cats: ['fiscalite'],
      desc: 'IR avec quotient familial, PER, PFU et décote.',
      keywords: ['ir', 'impot', 'tmi', 'pfu', 'foncier', 'per', 'rcm'] },
    { id: 'ifi',          num:  3, label: 'IFI',                       href: 'simulator-3.html',
      cats: ['fiscalite'],
      desc: 'Patrimoine taxable, abattement RP, décote 1,3 M€.',
      keywords: ['ifi', 'patrimoine', 'fortune', 'immobilier'] },
    { id: 'interets',     num:  4, label: 'Intérêts composés',         href: 'simulator-4.html',
      cats: ['finance'],
      desc: 'Capitalisation, versements programmés et inflation.',
      keywords: ['epargne', 'capitalisation', 'projection', 'rendement'] },
    { id: 'donation',     num:  5, label: 'Donation',                  href: 'simulator-5.html',
      cats: ['fiscalite', 'transmission'],
      desc: 'Droits, abattements et stratégies de transmission anticipée.',
      keywords: ['donation', 'don', 'abattement', 'demembrement', '790g'] },
    { id: 'succession',   num:  6, label: 'Succession',                href: 'simulator-6.html',
      cats: ['fiscalite', 'transmission'],
      desc: 'Droits de succession, conjoint, démembrement, assurance-vie.',
      keywords: ['heritage', 'succession', 'conjoint', 'usufruit'] },
    { id: 'endettement',  num:  7, label: 'Taux d\'endettement',       href: 'simulator-7.html',
      cats: ['immobilier'],
      desc: 'Règle HCSF 35 %, capacité d\'emprunt et reste à vivre.',
      keywords: ['endettement', 'hcsf', 'capacite', 'banque'] },
    { id: 'rentabilite',  num:  8, label: 'Rentabilité locative',      href: 'simulator-8.html',
      cats: ['immobilier'],
      desc: 'Rentabilité brute, nette, nette-nette et fiscalité.',
      keywords: ['locatif', 'rentabilite', 'cashflow', 'micro', 'reel'] },
    { id: 'pvimmo',       num:  9, label: 'Plus-values immobilières',  href: 'simulator-9.html',
      cats: ['fiscalite', 'immobilier'],
      desc: 'Abattements détention, exonération RP et surtaxe.',
      keywords: ['plus value', 'pv', 'revente', 'cession', 'surtaxe'] },
    { id: 'sci',          num: 10, label: 'SCI IR vs IS',              href: 'simulator-10.html',
      cats: ['fiscalite', 'immobilier', 'entreprise'],
      desc: 'Arbitrage entre détention en nom propre, SCI IR et SCI IS.',
      keywords: ['sci', 'is', 'societe', 'civile', 'amortissement'] },
    { id: 'lmnp',         num: 11, label: 'LMNP au réel',              href: 'simulator-11.html',
      cats: ['fiscalite', 'immobilier'],
      desc: 'Amortissements BIC, micro vs réel et plus-value à la cession.',
      keywords: ['lmnp', 'meuble', 'bic', 'amortissement', 'reel'] },
    { id: 'cashflow',     num: 12, label: 'Cash-flow immobilier',      href: 'simulator-12.html',
      cats: ['immobilier'],
      desc: 'Trésorerie, TRI, projection 25 ans et fiscalité comparée.',
      keywords: ['cashflow', 'tresorerie', 'tri', 'projection'] },
    { id: 'av',           num: 13, label: 'Assurance-vie',             href: 'simulator-13.html',
      cats: ['fiscalite', 'transmission', 'finance'],
      desc: 'Capitalisation, rachats fiscalisés et transmission 990 I.',
      keywords: ['av', 'assurance vie', 'rachat', 'beneficiaire', '990i', '757b'] },
    { id: 'per',          num: 14, label: 'PER — Plan Épargne Retraite', href: 'simulator-14.html',
      cats: ['retraite', 'fiscalite', 'finance'],
      desc: 'Économie fiscale, capitalisation et arbitrage capital / rente.',
      keywords: ['per', 'retraite', 'plan epargne', 'madelin', 'tns', 'deduction', '163 quatervicies'] },
    { id: 'pea',          num: 15, label: 'PEA — Plan d\'Épargne en Actions', href: 'simulator-15.html',
      cats: ['finance'],
      desc: 'Capitalisation long terme, fiscalité optimisée après 5 ans, comparatif CTO et allocation stratégique.',
      keywords: ['pea', 'actions', 'etf', 'bourse', 'cto', 'dividendes', 'portefeuille', 'capitalisation'] },
    { id: 'cto',          num: 16, label: 'CTO — Compte-Titres Ordinaire',   href: 'simulator-16.html',
      cats: ['finance'],
      desc: 'Capitalisation multi-actifs, fiscalité PFU vs Barème, dividendes passifs et comparaison PEA.',
      keywords: ['cto', 'compte titres', 'actions', 'pfu', 'bareme', 'dividendes', 'portefeuille', 'arbitrage', 'flat tax'] },
    { id: 'cc',           num: 17, label: 'Contrat de Capitalisation',        href: 'simulator-17.html',
      cats: ['finance', 'transmission', 'entreprise'],
      desc: 'Capitalisation institutionnelle, fiscalité PP et IS, transmission par donation et démembrement.',
      keywords: ['capitalisation', 'contrat', 'holding', 'is', 'donation', 'demembrement', 'anteriorite', 'wealth', 'trésorerie', 'structuration'] },
    { id: 'df',           num: 18, label: 'Déficit Foncier',                  href: 'simulator-18.html',
      cats: ['fiscalite', 'immobilier'],
      desc: 'Mécanique fiscale complète : travaux déductibles, imputation RG 10 700 €, report 10 ans, cash-flow réel et comparaison stratégies.',
      keywords: ['deficit', 'foncier', 'travaux', 'deductible', 'imputation', 'report', 'tmi', 'revenus fonciers', 'renovation', 'immobilier', 'optimisation'] },
    { id: 'mx',           num: 19, label: 'Loi Malraux',                      href: 'simulator-19.html',
      cats: ['fiscalite', 'immobilier'],
      desc: 'Réduction IR Malraux (SPR 30% / 22%), plafond 400 000 €, hors niches fiscales, restauration patrimoniale et valorisation long terme.',
      keywords: ['malraux', 'reduction', 'ir', 'spr', 'restauration', 'patrimoine', 'historique', 'travaux', 'secteur', 'engagement', 'niches', 'fiscal'] },
    { id: 'mh',           num: 20, label: 'Monument Historique',               href: 'simulator-20.html',
      cats: ['fiscalite', 'immobilier', 'transmission'],
      desc: 'Déficit imputable sans plafond sur le revenu global, conservation 15 ans, exonération succession — simulation complète du régime Monument Historique.',
      keywords: ['monument', 'historique', 'mh', 'ismh', 'classe', 'inscrit', 'drac', 'deficit', 'deduction', 'revenu global', 'conservation', 'succession', 'exoneration', 'travaux', 'tmi', 'acmh'],
      isNew: true }
  ];

  /* ─── Storage helpers (sécurisés contre quota / mode privé) ─── */
  var LS_FAVS = 'sp_nav_favs';
  var LS_RECENT = 'sp_nav_recent';
  var MAX_RECENT = 4;

  function lsGet(key, fallback) {
    try {
      var v = win.localStorage && win.localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  }
  function lsSet(key, val) {
    try { win.localStorage && win.localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  nav.getFavs   = function() { return lsGet(LS_FAVS, []); };
  nav.getRecent = function() { return lsGet(LS_RECENT, []); };

  nav.toggleFav = function(id) {
    var favs = nav.getFavs();
    var i = favs.indexOf(id);
    if (i === -1) favs.push(id); else favs.splice(i, 1);
    lsSet(LS_FAVS, favs);
    return favs.indexOf(id) !== -1;
  };

  nav.pushRecent = function(id) {
    if (!id) return;
    var recent = nav.getRecent().filter(function(x) { return x !== id; });
    recent.unshift(id);
    if (recent.length > MAX_RECENT) recent = recent.slice(0, MAX_RECENT);
    lsSet(LS_RECENT, recent);
  };

  /* ─── Helpers ─── */
  function currentHref() {
    var p = (win.location && win.location.pathname) ? win.location.pathname : '';
    var seg = p.split('/').filter(Boolean).pop() || '';
    return seg.toLowerCase();
  }

  function findSim(id) {
    for (var i = 0; i < nav.SIMS.length; i++) if (nav.SIMS[i].id === id) return nav.SIMS[i];
    return null;
  }

  function currentSim() {
    var href = currentHref();
    for (var i = 0; i < nav.SIMS.length; i++) {
      if (nav.SIMS[i].href.toLowerCase() === href) return nav.SIMS[i];
    }
    return null;
  }

  /* ─── Génération d'un item simulateur ─── */
  function renderItem(sim, opts) {
    opts = opts || {};
    var activeCls = opts.activeHref && sim.href.toLowerCase() === opts.activeHref ? ' menu-active' : '';
    var favs = opts.favs || [];
    var isFav = favs.indexOf(sim.id) !== -1;
    var favCls = isFav ? ' is-fav' : '';
    var newBadge = sim.isNew ? '<span class="nav-item-badge">Nouveau</span>' : '';
    /* Le numéro est conservé en data-sim-num pour le routing/analytics, mais n'est plus rendu visuellement. */
    return ''
      + '<a href="' + sim.href + '" role="menuitem" data-sim-id="' + sim.id + '" data-sim-num="' + sim.num + '" class="nav-item' + activeCls + favCls + '">'
      +   '<span class="nav-item-dot" aria-hidden="true"></span>'
      +   '<span class="nav-item-body">'
      +     '<span class="nav-item-row"><span class="menu-label">' + sim.label + '</span>' + newBadge + '</span>'
      +     '<span class="nav-item-desc">' + (sim.desc || '') + '</span>'
      +   '</span>'
      +   '<button type="button" class="nav-fav-btn" aria-label="' + (isFav ? 'Retirer des favoris' : 'Ajouter aux favoris') + '" data-fav-id="' + sim.id + '">'
      +     '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round">' + ICONS.star + '</svg>'
      +   '</button>'
      + '</a>';
  }

  function renderSection(title, iconSvg, items, opts, sectionCls) {
    if (!items.length) return '';
    var iconHtml = iconSvg
      ? '<svg class="nav-cat-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + iconSvg + '</svg>'
      : '';
    return ''
      + '<div class="nav-menu-section ' + (sectionCls || '') + '" role="group">'
      +   '<div class="nav-menu-section-title">' + iconHtml + '<span>' + title + '</span></div>'
      +   items.map(function(s) { return renderItem(s, opts); }).join('')
      + '</div>';
  }

  /* ─── Rendu complet du menu ─── */
  nav.renderMenu = function(activeHref) {
    activeHref = activeHref || currentHref();
    var favs = nav.getFavs();
    var recent = nav.getRecent();
    var opts = { activeHref: activeHref, favs: favs };

    // Barre de recherche
    var html = ''
      + '<div class="nav-search-wrap">'
      +   '<svg class="nav-search-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">' + ICONS.search + '</svg>'
      +   '<input type="text" class="nav-search" id="navSearch" placeholder="Rechercher un simulateur…" autocomplete="off" spellcheck="false">'
      + '</div>'
      + '<div class="nav-menu-scroll">';

    // Favoris
    var favItems = favs.map(findSim).filter(Boolean);
    html += renderSection('Favoris', ICONS.star, favItems, opts, 'nav-section-fav');

    // Catégories
    nav.CATEGORIES.forEach(function(cat) {
      var sims = nav.SIMS
        .filter(function(s) { return s.cats.indexOf(cat.id) !== -1; })
        .sort(function(a, b) { return (a.order || a.num) - (b.order || b.num); });
      html += renderSection(cat.label, cat.icon, sims, opts);
    });

    html += '</div>'; // .nav-menu-scroll

    // Bandeau vide pour résultats de recherche
    html += '<div class="nav-empty" hidden>Aucun simulateur ne correspond.</div>';

    return html;
  };

  /* ─── Recherche temps réel : filtrage côté DOM ─── */
  function normalize(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function bindSearch(menuEl) {
    var input = menuEl.querySelector('#navSearch');
    var scroll = menuEl.querySelector('.nav-menu-scroll');
    var empty = menuEl.querySelector('.nav-empty');
    if (!input || !scroll) return;

    input.addEventListener('input', function() {
      var q = normalize(input.value.trim());
      var items = scroll.querySelectorAll('.nav-item');
      var anyShown = false;

      items.forEach(function(a) {
        var id = a.getAttribute('data-sim-id');
        var sim = findSim(id);
        if (!sim) return;
        var hay = normalize(sim.label + ' ' + (sim.desc || '') + ' ' + (sim.keywords || []).join(' ') + ' ' + sim.cats.join(' '));
        var match = q === '' || hay.indexOf(q) !== -1;
        a.style.display = match ? '' : 'none';
        if (match) anyShown = true;
      });

      // Masquer les sections vides
      scroll.querySelectorAll('.nav-menu-section').forEach(function(sec) {
        var visible = sec.querySelectorAll('.nav-item:not([style*="display: none"])').length;
        sec.style.display = (q !== '' && visible === 0) ? 'none' : '';
      });

      if (empty) empty.hidden = anyShown || q === '';
    });

    // Echap dans le champ : reset
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && input.value) {
        e.stopPropagation();
        input.value = '';
        input.dispatchEvent(new Event('input'));
      }
    });
  }

  /* ─── Toggle favori : délégation click ─── */
  function bindFavToggle(menuEl) {
    menuEl.addEventListener('click', function(e) {
      var btn = e.target.closest && e.target.closest('.nav-fav-btn');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var id = btn.getAttribute('data-fav-id');
      var isFav = nav.toggleFav(id);
      // Re-render menu en gardant la valeur du champ recherche
      var input = menuEl.querySelector('#navSearch');
      var prevQuery = input ? input.value : '';
      menuEl.innerHTML = nav.renderMenu();
      bindSearch(menuEl);
      if (prevQuery) {
        var newInput = menuEl.querySelector('#navSearch');
        newInput.value = prevQuery;
        newInput.dispatchEvent(new Event('input'));
        newInput.focus();
      }
    });
  }

  /* ─── Dropdown : toggle robuste (corrige bug sim-13) ─── */
  nav.bindDropdown = function() {
    var dd = document.getElementById('mainDropdown');
    if (!dd || dd.dataset.bound === '1') return;
    var btn = dd.querySelector('.nav-dropdown-btn');
    var menu = dd.querySelector('.nav-dropdown-menu');
    if (!btn || !menu) return;
    dd.dataset.bound = '1';

    function setOpen(open) {
      if (open) {
        dd.classList.add('open');
        // focus champ recherche sans scroller la page
        setTimeout(function() {
          var inp = menu.querySelector('#navSearch');
          if (inp) inp.focus({ preventScroll: true });
        }, 60);
      } else {
        dd.classList.remove('open');
      }
      btn.setAttribute('aria-expanded', String(open));
    }

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      setOpen(!dd.classList.contains('open'));
    });

    menu.addEventListener('click', function(e) {
      // Laisse passer la navigation sur les <a>
      if (!e.target.closest('a[href]')) e.stopPropagation();
    });

    document.addEventListener('click', function() { setOpen(false); });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && dd.classList.contains('open')) {
        setOpen(false);
        btn.focus();
      }
    });
  };

  /* ─── Init complet ─── */
  nav.init = function(containerId) {
    function go() {
      var menu = document.getElementById(containerId || 'navMenu');
      if (menu) {
        menu.innerHTML = nav.renderMenu();
        bindSearch(menu);
        bindFavToggle(menu);
      }
      nav.bindDropdown();

      // Trace l'ouverture de cette page dans les récents
      var cur = currentSim();
      if (cur) nav.pushRecent(cur.id);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', go);
    } else {
      go();
    }
  };

})(window);
