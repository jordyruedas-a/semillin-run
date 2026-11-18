/* =========================================================
   BROTE · Utilidades de interfaz compartidas por todas las páginas
   Barra de navegación, progreso (localStorage), sonidos, toast, KaTeX.
   ========================================================= */
(function () {
  "use strict";
  var B = (window.BROTE = window.BROTE || {});

  /* ---------- Barra superior ---------- */
  var PAGINAS = [
    { href: "index.html", txt: "Inicio" },
    { href: "estudio.html", txt: "Estudiar" },
    { href: "juego.html", txt: "Jugar" },
    { href: "herramientas.html", txt: "Herramientas" },
    { href: "examen.html", txt: "Examen" },
    { href: "formulario.html", txt: "Formulario" }
  ];
  function barra() {
    var actual = location.pathname.split("/").pop() || "index.html";
    if (actual === "historia.html") actual = "estudio.html";
    var el = document.createElement("header");
    el.className = "barra";
    el.innerHTML =
      '<a class="logo" href="index.html"><span class="peep rojo flota"></span> BROTE <small>Simulación de Sistemas Dinámicos</small></a>' +
      "<nav>" + PAGINAS.map(function (p) { return '<a href="' + p.href + '"' + (p.href === actual ? ' class="activo"' : "") + ">" + p.txt + "</a>"; }).join("") + "</nav>" +
      '<span class="espacio"></span><span class="sonido" title="Sonido">' + (sonidoActivo() ? "<svg viewBox='0 0 24 24' width='20' height='20' style='vertical-align:middle'><path d='M4 9h4l5-4v14l-5-4H4z' fill='#2b2b2b'/><path d='M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12' fill='none' stroke='#2b2b2b' stroke-width='2' stroke-linecap='round'/></svg>" : "<svg viewBox='0 0 24 24' width='20' height='20' style='vertical-align:middle'><path d='M4 9h4l5-4v14l-5-4H4z' fill='#9a9a9a'/><path d='m16 9 6 6m0-6-6 6' stroke='#9a9a9a' stroke-width='2' stroke-linecap='round'/></svg>") + "</span>";
    document.body.insertBefore(el, document.body.firstChild);
    el.querySelector(".sonido").onclick = function () {
      var v = !sonidoActivo(); localStorage.setItem("brote_sonido", v ? "1" : "0");
      this.innerHTML = v ? "<svg viewBox='0 0 24 24' width='20' height='20' style='vertical-align:middle'><path d='M4 9h4l5-4v14l-5-4H4z' fill='#2b2b2b'/><path d='M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12' fill='none' stroke='#2b2b2b' stroke-width='2' stroke-linecap='round'/></svg>" : "<svg viewBox='0 0 24 24' width='20' height='20' style='vertical-align:middle'><path d='M4 9h4l5-4v14l-5-4H4z' fill='#9a9a9a'/><path d='m16 9 6 6m0-6-6 6' stroke='#9a9a9a' stroke-width='2' stroke-linecap='round'/></svg>";
    };
    var t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t);
  }

  /* ---------- Sonidos (reutiliza el audio de Crowds) ---------- */
  function sonidoActivo() { return localStorage.getItem("brote_sonido") !== "0"; }
  var cache = {};
  function sonar(nombre, vol) {
    if (!sonidoActivo()) return;
    try {
      var a = cache[nombre] || (cache[nombre] = new Audio("audio/" + nombre + ".mp3"));
      a.volume = vol === undefined ? 0.6 : vol;
      a.currentTime = 0; a.play().catch(function () {});
    } catch (e) {}
  }

  /* ---------- Toast ---------- */
  var tt;
  function toast(msg, ms) {
    var t = document.getElementById("toast"); if (!t) return;
    t.innerHTML = msg; t.classList.add("visible");
    clearTimeout(tt); tt = setTimeout(function () { t.classList.remove("visible"); }, ms || 2600);
  }

  /* ---------- KaTeX ---------- */
  function mate(el) {
    if (window.renderMathInElement && el) {
      renderMathInElement(el, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\(", right: "\\)", display: false }],
        throwOnError: false
      });
    }
  }

  /* ---------- Progreso ---------- */
  var CLAVE = "brote_progreso_v1";
  function leer() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || { temas: {}, niveles: {}, examenes: [] }; }
    catch (e) { return { temas: {}, niveles: {}, examenes: [] }; }
  }
  function guardar(p) { localStorage.setItem(CLAVE, JSON.stringify(p)); }
  function marcarTema(id, campo, valor) {
    var p = leer(); p.temas[id] = p.temas[id] || {};
    if (campo === "libre") p.temas[id].libre = (p.temas[id].libre || 0) + 1;
    else if (campo === "quiz") p.temas[id].quiz = Math.max(p.temas[id].quiz || 0, valor);
    else p.temas[id][campo] = valor === undefined ? true : valor;
    guardar(p);
  }
  function estadoTema(id) {
    var t = leer().temas[id] || {};
    var dominado = (t.quiz || 0) >= 0.8 && (t.libre || 0) >= 1;
    var practicado = t.guiada || t.libre || t.quiz;
    return { datos: t, nivel: dominado ? 2 : (practicado || t.visto ? 1 : 0), icono: dominado ? "●" : (practicado ? "◑" : (t.visto ? "◔" : "○")) };
  }
  function marcarNivel(id) { var p = leer(); p.niveles[id] = true; guardar(p); }
  function nivelGanado(id) { return !!leer().niveles[id]; }

  /* ---------- Generador para ejercicios (¡el mismo método del curso!) ---------- */
  var genEj = null;
  function aleatorio() {
    if (!genEj) {
      var semilla = (Date.now() % 4294967296) | 1;
      genEj = new B.rng.Generador({ tipo: "mixto", a: 1664525, c: 1013904223, m: 4294967296, x0: Math.abs(semilla) });
    }
    return genEj.next();
  }
  function entero(a, b) { return a + Math.floor(aleatorio() * (b - a + 1)); }
  function elegir(arr) { return arr[Math.floor(aleatorio() * arr.length)]; }
  function rect5() { return Math.round(aleatorio() * 1e5) / 1e5 || 0.00001; }
  function barajar(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(aleatorio() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---------- Comparar respuestas ---------- */
  function normal(s) { return String(s).toLowerCase().replace(/[\s()]+/g, "").replace(/[áà]/g, "a").replace(/[éè]/g, "e").replace(/[íì]/g, "i").replace(/[óò]/g, "o").replace(/[úù]/g, "u").replace(/≤/g, "<=").replace(/≥/g, ">="); }
  function comparar(usuario, correcto, dec) {
    if (usuario === null || usuario === undefined || String(usuario).trim() === "") return false;
    if (typeof correcto === "number") {
      var u = Number(String(usuario).replace(",", "."));
      if (isNaN(u)) return false;
      if (Number.isInteger(correcto) && dec === undefined) return Math.abs(u - correcto) < 1e-9;
      var tol = Math.max(0.0006, Math.abs(correcto) * 0.002);
      return Math.abs(u - correcto) <= tol;
    }
    return normal(usuario) === normal(correcto);
  }

  B.ui = {
    barra: barra, sonar: sonar, toast: toast, mate: mate,
    progreso: { leer: leer, guardar: guardar, marcarTema: marcarTema, estadoTema: estadoTema, marcarNivel: marcarNivel, nivelGanado: nivelGanado },
    azar: { aleatorio: aleatorio, entero: entero, elegir: elegir, rect5: rect5, barajar: barajar },
    comparar: comparar
  };
})();
