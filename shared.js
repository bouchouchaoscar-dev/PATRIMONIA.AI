/* shared.js — SP (Simulators Pro) utilities
   Currency input formatting — shared across all simulators */
(function(win) {
  'use strict';

  var SP = win.SP = win.SP || {};

  /* Parse a French-formatted number string -> float (0 on empty/invalid) */
  SP.parseNum = function(s) {
    s = String(s == null ? '' : s)
      .replace(/\s/g, '')
      .replace(',', '.');
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };

  /* Format an integer with French thousand separators (regular space) */
  SP.fmtNum = function(n) {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
      .format(Math.round(+n || 0))
      .replace(/[\u202F\u00A0]/g, ' ');
  };

  /* Attach live thousand-separator formatting to a single input */
  SP.attachFmt = function(inp) {
    if (!inp || inp._spFmt) return;
    inp._spFmt = true;

    // Switch number inputs to text for visual control
    if (inp.type === 'number') {
      inp.type = 'text';
      inp.inputMode = 'decimal';
    }

    // Format initial value (skip 0 — leave placeholder or "0" as-is)
    var initN = parseInt(inp.value.replace(/[^\d]/g, ''), 10) || 0;
    if (initN > 0) inp.value = SP.fmtNum(initN);

    // Live format on every keystroke
    inp.addEventListener('input', function() {
      var raw = this.value;
      var caret = this.selectionStart;
      var digsBefore = (raw.slice(0, caret).match(/\d/g) || []).length;

      var digits = raw.replace(/[^\d]/g, '');
      if (!digits) { this.value = ''; return; }

      var formatted = SP.fmtNum(parseInt(digits, 10));
      if (formatted === raw) return;

      this.value = formatted;

      // Restore caret by counting digits
      var count = 0;
      var pos = digsBefore === 0 ? 0 : formatted.length;
      for (var i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          count++;
          if (count === digsBefore) { pos = i + 1; break; }
        }
      }
      try { this.setSelectionRange(pos, pos); } catch(e) {}
    });

    // Block non-numeric printable characters (control keys have length > 1)
    inp.addEventListener('keydown', function(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!e.key || e.key.length > 1) return;
      if (/^\d$/.test(e.key)) return;
      e.preventDefault();
    });

    // Normalize on blur (safety net for programmatically set values)
    inp.addEventListener('blur', function() {
      var digits = this.value.replace(/[^\d]/g, '');
      this.value = digits ? SP.fmtNum(parseInt(digits, 10)) : '';
    });
  };

  /* Set a currency input's value from a raw number (for slider -> input sync) */
  SP.setVal = function(inp, n) {
    if (!inp) return;
    n = Math.round(parseFloat(n) || 0);
    inp.value = inp._spFmt ? SP.fmtNum(n) : n;
  };

  /* Initialize all [data-fmt] inputs within a root element */
  SP.initFmt = function(root) {
    (root || document).querySelectorAll('[data-fmt]').forEach(SP.attachFmt);
  };

  /* ─────────── Formatage avancé ─────────── */

  /* Format number with N decimals (French notation) */
  SP.fmtNumD = function(n, d) {
    d = d == null ? 0 : d;
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })
      .format(+n || 0).replace(/[  ]/g, ' ');
  };

  /* Format euros : SP.fmtEur(1234.5) → "1 235 €" / SP.fmtEur(1234.5, 2) → "1 234,50 €" */
  SP.fmtEur = function(n, d) {
    return SP.fmtNumD(n, d == null ? 0 : d) + ' €';
  };

  /* Format pourcentage : SP.fmtPct(0.125, 1) → "12,5 %" */
  SP.fmtPct = function(n, d) {
    return SP.fmtNumD((+n || 0) * 100, d == null ? 1 : d) + ' %';
  };

  /* ─────────── Helpers DOM (raccourcis getter / setter) ─────────── */

  SP.v = function(id) {
    var el = document.getElementById(id);
    return el ? SP.parseNum(el.value) : 0;
  };

  SP.vi = function(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    return parseInt(String(el.value).replace(/[^\d-]/g, ''), 10) || 0;
  };

  SP.chk = function(id) {
    var el = document.getElementById(id);
    return !!(el && el.checked);
  };

  SP.radio = function(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  };

  SP.text = function(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  SP.html = function(id, val) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = val;
  };

  SP.show = function(id, visible) {
    var el = document.getElementById(id);
    if (el) el.style.display = visible ? '' : 'none';
  };

  SP.clamp = function(n, lo, hi) {
    n = +n;
    if (isNaN(n)) return lo;
    if (n < lo) return lo;
    if (n > hi) return hi;
    return n;
  };

  /* Auto-init [data-fmt] inputs added dynamically to the DOM */
  if (win.MutationObserver) {
    var obs = new MutationObserver(function(ms) {
      ms.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches('[data-fmt]')) SP.attachFmt(node);
          if (node.querySelectorAll) node.querySelectorAll('[data-fmt]').forEach(SP.attachFmt);
        });
      });
    });
    document.addEventListener('DOMContentLoaded', function() {
      obs.observe(document.body, { childList: true, subtree: true });
      SP.initFmt(document);
    });
  }

})(window);
