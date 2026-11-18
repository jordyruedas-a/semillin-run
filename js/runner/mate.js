/* =========================================================
   SEMILLÍN RUN · Fórmulas
   Los textos de los niveles marcan las fórmulas con $…$ (LaTeX).
   html(s): texto con las fórmulas dibujadas por KaTeX (fracciones,
   exponentes, subíndices y raíces con su notación normal).
   plano(s): versión en una sola línea con caracteres Unicode (²,
   subíndices, √) para el lienzo, donde no se puede usar HTML.
   \$ es un signo de pesos, no una fórmula.
   ========================================================= */
(function () {
  "use strict";
  var B = window.BROTE = window.BROTE || {};

  function trozos(s) {
    var out = [], buf = "", math = false;
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (ch === "\\" && s[i + 1] === "$") { buf += math ? "\\$" : "$"; i++; continue; }
      if (ch === "$") { if (buf) out.push({ m: math, t: buf }); buf = ""; math = !math; continue; }
      buf += ch;
    }
    if (buf) out.push({ m: math, t: buf });
    return out;
  }

  var cache = {};
  function tex(t) {
    if (cache[t]) return cache[t];
    var h;
    try { h = window.katex.renderToString(t, { throwOnError: false, strict: "ignore", output: "html" }); }
    catch (e) { h = "<code>" + t.replace(/</g, "&lt;") + "</code>"; }
    cache[t] = h;
    return h;
  }
  function html(s) {
    if (s === undefined || s === null) return "";
    s = String(s);
    if (s.indexOf("$") < 0) return s;
    return trozos(s).map(function (p) { return p.m ? tex(p.t) : p.t; }).join("");
  }

  var SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "-": "⁻", "+": "⁺", n: "ⁿ", i: "ⁱ", x: "ˣ" };
  var SUB = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆", 7: "₇", 8: "₈", 9: "₉", "+": "₊", "-": "₋", n: "ₙ", i: "ᵢ", j: "ⱼ", x: "ₓ", a: "ₐ", e: "ₑ", o: "ₒ", r: "ᵣ", ",": ",", ".": "." };
  var CMD = { cdot: "·", times: "×", div: "÷", le: "≤", ge: "≥", ne: "≠", lambda: "λ", alpha: "α", nu: "ν", sum: "Σ", pm: "±", to: "→", Rightarrow: "⇒", approx: "≈", dots: "…", max: "máx", infty: "∞" };
  function conv(t, mapa, pref) {
    var cs = t.replace(/\s/g, "").split("");
    return cs.every(function (c) { return mapa[c]; }) ? cs.map(function (c) { return mapa[c]; }).join("") : pref + "(" + t + ")";
  }
  function planoMate(t) {
    t = t.replace(/\\(?:text|mathrm)\{([^{}]*)\}/g, "$1").replace(/\\(?:displaystyle|left|right|,|;|quad|!)/g, function (m) { return /,|;|quad/.test(m) ? " " : ""; });
    t = t.replace(/\\bmod/g, " mod ").replace(/\\%/g, "%").replace(/\\\$/g, "$");
    t = t.replace(/\\bar\{(\w)\}/g, "$1̄");
    for (var k = 0; k < 4; k++) {
      t = t.replace(/\^\{([^{}]*)\}|\^(\w)/g, function (_, a, b) { return conv(a !== undefined ? a : b, SUP, "^"); });
      t = t.replace(/_\{([^{}]*)\}|_(\w)/g, function (_, a, b) { return conv(a !== undefined ? a : b, SUB, "_"); });
      t = t.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, function (_, a, b) { return (/^[\w.⁰-⁹]+$/.test(a) ? a : "(" + a + ")") + "/" + (/^[\w.!]+$/.test(b) ? b : "(" + b + ")"); });
      t = t.replace(/\\sqrt\{([^{}]*)\}/g, "√($1)");
    }
    t = t.replace(/\\([A-Za-z]+)/g, function (_, c) { return CMD[c] !== undefined ? CMD[c] : c; });
    return t.replace(/[{}]/g, "").replace(/\s+/g, " ");
  }
  function plano(s) {
    if (s === undefined || s === null) return "";
    return trozos(String(s)).map(function (p) { return p.m ? planoMate(p.t) : p.t; }).join("").replace(/<[^>]+>/g, "");
  }

  B.mate = { html: html, plano: plano, trozos: trozos };
})();
