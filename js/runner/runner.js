/* =========================================================
   SEMILLÍN RUN · corre, junta tiempo extra y resuelve el problema
   El juego da los datos del problema (como en clase) y el jugador
   calcula cada celda de la tabla: escribe el resultado (números) o
   entra al tubo con la respuesta (palabras). Cada moneda da +5 s
   para resolver. 17 mundos (uno por tema del curso), demo interactiva
   en el mundo 1, puntaje con rachas, mundos de colores y render suave.
   Los problemas viven en niveles.js; aquí solo está el juego.
   ========================================================= */
(function () {
  "use strict";
  var B = window.BROTE, A = B.arcade, L = B.liga, NV = B.niveles.NIVELES, fx = B.niveles.fx, M = B.mate.html, plano = B.mate.plano;
  var W = 1000, H = 440, PISO = 340, PX = 170, G = 2300, SALTO = -800, PASO = 1 / 120;
  var ALTO_DE_PIE = 50, ALTO_AGACHADO = 28, SEG_MONEDA = 5, MONEDAS_VUELTA = 5;

  /* ---------- Paletas: un color de mundo por nivel ---------- */
  var TEMAS = [
    { n: "Pradera", cielo: ["#8fd3ff", "#fff3d6"], sol: "#ffd45c", tinte: null, bruma: "rgba(170,215,255,.45)", amb: "polen" },
    { n: "Atardecer", cielo: ["#ff9f6b", "#ffe2c2"], sol: "#fff1a8", tinte: "rgba(255,130,60,.20)", bruma: "rgba(255,190,150,.5)", amb: "polvo" },
    { n: "Bosque", cielo: ["#5fb3c4", "#dff5e6"], sol: "#fff7c2", tinte: "rgba(30,130,100,.25)", bruma: "rgba(150,210,190,.5)", amb: "hojas" },
    { n: "Lavanda", cielo: ["#a996ff", "#ffe3f5"], sol: "#fff4fb", tinte: "rgba(140,100,220,.24)", bruma: "rgba(210,190,255,.5)", amb: "petalos" },
    { n: "Nieve", cielo: ["#9dbff7", "#f4f8ff"], sol: "#ffffff", tinte: "rgba(200,220,255,.35)", bruma: "rgba(230,240,255,.55)", amb: "nieve" },
    { n: "Noche", cielo: ["#161a40", "#4f4287"], sol: "#f4f1d0", tinte: "rgba(25,25,90,.5)", bruma: "rgba(60,60,130,.55)", amb: "luciernagas", estrellas: true },
    { n: "Desierto", cielo: ["#ffc46b", "#fff2c9"], sol: "#fffbe0", tinte: "rgba(230,160,70,.26)", bruma: "rgba(255,220,160,.5)", amb: "polvo" },
    { n: "Lluvia", cielo: ["#64799a", "#c3d0e2"], sol: "#e8eef7", tinte: "rgba(60,80,120,.32)", bruma: "rgba(150,170,200,.55)", amb: "lluvia" },
    { n: "Neón", cielo: ["#24093d", "#9b3488"], sol: "#ff7ad9", tinte: "rgba(150,30,160,.38)", bruma: "rgba(120,40,140,.55)", amb: "chispas", estrellas: true },
    { n: "Otoño", cielo: ["#ef9d55", "#fde0b8"], sol: "#fff3c9", tinte: "rgba(200,90,30,.22)", bruma: "rgba(250,200,150,.5)", amb: "hojas" },
    { n: "Menta", cielo: ["#8fe8cf", "#f0fff8"], sol: "#ffffff", tinte: "rgba(50,190,150,.18)", bruma: "rgba(200,250,235,.5)", amb: "burbujas" },
    { n: "Cerezo", cielo: ["#ffaac2", "#fff0f4"], sol: "#fffafc", tinte: "rgba(255,110,150,.18)", bruma: "rgba(255,210,225,.5)", amb: "petalos" },
    { n: "Océano", cielo: ["#3f9fe2", "#d4efff"], sol: "#fffde6", tinte: "rgba(30,110,200,.26)", bruma: "rgba(170,215,250,.5)", amb: "burbujas" },
    { n: "Casino", cielo: ["#3a2810", "#c48627"], sol: "#ffe9a0", tinte: "rgba(190,140,30,.32)", bruma: "rgba(150,100,40,.55)", amb: "chispas", estrellas: true },
    { n: "Limón", cielo: ["#cfee6e", "#fbffe0"], sol: "#ffffff", tinte: "rgba(160,200,40,.18)", bruma: "rgba(235,250,190,.5)", amb: "polen" },
    { n: "Bodega", cielo: ["#857565", "#ddd0bf"], sol: "#fff0d8", tinte: "rgba(110,80,50,.32)", bruma: "rgba(190,170,150,.55)", amb: "polvo" },
    { n: "Aurora", cielo: ["#0c2433", "#2f8a86"], sol: "#d8fff6", tinte: "rgba(10,80,90,.42)", bruma: "rgba(40,110,120,.55)", amb: "luciernagas", estrellas: true, aurora: true }
  ];

  var IC = {
    corazon: function (on) { return "<svg viewBox='0 0 24 22' class='ic-run'><path d='M12 21 2.6 11.7A5.6 5.6 0 0 1 12 4.4a5.6 5.6 0 0 1 9.4 7.3Z' fill='" + (on ? "#f73c50" : "#d9d9d9") + "' stroke='#3f2631' stroke-width='1.8'/></svg>"; },
    estrella: function (on) { return "<svg viewBox='0 0 24 24' class='ic-run'><path d='m12 2 3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6Z' fill='" + (on === false ? "#e3d8d2" : "#ffcc00") + "' stroke='#3f2631' stroke-width='1.6'/></svg>"; },
    fuego: "<svg viewBox='0 0 24 24' class='ic-run'><path d='M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9Z' fill='#ff8a2a' stroke='#3f2631' stroke-width='1.6' stroke-linejoin='round'/><path d='M12 13c1 2 3 3 3 5a3 3 0 0 1-6 0c0-1 1-2 1-2 0 1 1 1 1 1 0-2 0-3 1-4Z' fill='#ffd84d'/></svg>",
    moneda: "<svg viewBox='0 0 24 24' class='ic-run'><circle cx='12' cy='12' r='10' fill='#ffcc00' stroke='#b58b00' stroke-width='2.4'/><circle cx='12' cy='12' r='5.5' fill='none' stroke='#b58b00' stroke-width='1.6'/></svg>",
    formula: "<svg viewBox='0 0 24 24' class='ic-run'><rect x='3' y='2' width='18' height='20' fill='#fff' stroke='#3f2631' stroke-width='2'/><path d='M7 8h4M9 6v4M13 8h4M7 15l3 3m0-3-3 3M13 16h4' stroke='#3f2631' stroke-width='2'/></svg>",
    pausa: "<svg viewBox='0 0 24 24' class='ic-run'><rect x='5' y='4' width='5' height='16' fill='#3f2631'/><rect x='14' y='4' width='5' height='16' fill='#3f2631'/></svg>",
    sonido: function (on) { return "<svg viewBox='0 0 24 24' class='ic-run'><path d='M4 9h4l5-4v14l-5-4H4z' fill='#3f2631'/>" + (on ? "<path d='M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12' fill='none' stroke='#3f2631' stroke-width='2' stroke-linecap='round'/>" : "<path d='m16 9 6 6m0-6-6 6' stroke='#c34b35' stroke-width='2.4' stroke-linecap='round'/>") + "</svg>"; },
    tabla: "<svg viewBox='0 0 24 24' class='ic-run'><rect x='2' y='4' width='20' height='16' fill='#fff' stroke='#3f2631' stroke-width='2'/><path d='M2 9h20M2 14h20M9 4v16M15.5 4v16' stroke='#3f2631' stroke-width='1.6'/><rect x='3' y='5' width='18' height='3' fill='#52607c'/></svg>",
    reloj: "<svg viewBox='0 0 24 24' class='ic-run'><circle cx='12' cy='13' r='9' fill='#fff' stroke='#3f2631' stroke-width='2'/><path d='M12 8v5l3 2' stroke='#3f2631' stroke-width='2' fill='none' stroke-linecap='round'/><rect x='9' y='1' width='6' height='3' fill='#3f2631'/></svg>",
    mapa: "<svg viewBox='0 0 24 24' class='ic-run'><path d='M2 5l6-2 8 3 6-2v15l-6 2-8-3-6 2z' fill='#84c669' stroke='#3f2631' stroke-width='1.8' stroke-linejoin='round'/><path d='M8 3v15M16 6v15' stroke='#3f2631' stroke-width='1.8'/></svg>",
    copa: "<svg viewBox='0 0 24 24' class='ic-run'><path d='M6 3h12v3h3v3a4 4 0 0 1-4 4h-1a5 5 0 0 1-3 3v2h3v3H8v-3h3v-2a5 5 0 0 1-3-3H7a4 4 0 0 1-4-4V6h3z' fill='#ffcc4d' stroke='#3f2631' stroke-width='1.6' stroke-linejoin='round'/></svg>",
    play: "<svg viewBox='0 0 24 24' width='1em' height='1em'><path d='M7 4v16l13-8z' fill='currentColor' stroke='#3f2631' stroke-width='2' stroke-linejoin='round'/></svg>"
  };

  /* ---------- Progreso personal (racha de días y estadísticas) ---------- */
  var PROG = "semillin_progreso_v2";
  function hoy() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function prog() {
    var J = L.actual(), id = J ? J.id : "anon", t;
    try { t = JSON.parse(localStorage.getItem(PROG)) || {}; } catch (e) { t = {}; }
    var p = t[id] || { diaUlt: "", racha: 0, rachaMax: 0, mejorRacha: 0, aciertos: 0, errores: 0, monedas: 0, partidas: 0, demo: false, ultimo: 0 };
    p.guardar = function () { var c = Object.assign({}, p); delete c.guardar; t[id] = c; localStorage.setItem(PROG, JSON.stringify(t)); };
    return p;
  }
  function marcarDia() {
    var p = prog(), h = hoy();
    if (p.diaUlt === h) return p;
    var ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
    var ay = ayer.getFullYear() + "-" + (ayer.getMonth() + 1) + "-" + ayer.getDate();
    p.racha = p.diaUlt === ay ? p.racha + 1 : 1; p.rachaMax = Math.max(p.rachaMax, p.racha); p.diaUlt = h; p.guardar();
    return p;
  }
  function siguienteNivel() { for (var i = 0; i < NV.length; i++) if (!(L.record(NV[i].id).puntos > 0)) return i; return 0; }
  function estrellasTotales() { return NV.reduce(function (s, n) { return s + (L.record(n.id).estrellas || 0); }, 0); }
  function completados() { return NV.filter(function (n) { return L.record(n.id).puntos > 0; }).length; }

  /* ---------- Sprites Tiny City (Kenney, CC0) ---------- */
  var TINTA = "#3f2631", TC = new Image(), pendientes = [];
  TC.onload = function () { pendientes.splice(0).forEach(function (f) { f(); }); };
  TC.src = "sprites/tinycity.png";
  function alCargar(f) { if (TC.complete && TC.naturalWidth) f(); else pendientes.push(f); }
  function hsh(k) { var v = Math.sin(k * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); }
  /* Los mosaicos se colocan en píxeles enteros del lienzo final (no en múltiplos del sprite): así el
     desplazamiento es continuo y no "brinca" a saltos, que era lo que hacía vibrar el escenario. */
  function tile(c, i, x, y, s) { if (!TC.naturalWidth) return; c.drawImage(TC, (i % 12) * 16, Math.floor(i / 12) * 16, 16, 16, x, y, 16 * s, 16 * s); }
  var TECHOS = [[0, 1, 2, 12, 13, 14, 24, 25, 26], [6, 7, 8, 18, 19, 20, 30, 31, 32]];
  var MUROS = [{ muro: [36, 37, 41], base: [48, 49, 53], ventana: 40, puerta: 52 }, { muro: [42, 43, 47], base: [54, 55, 59], ventana: 46, puerta: 58 }];
  function edificio(c, x, suelo, ancho, pisos, filasTecho, techo, muro, s) {
    var t = 16 * s, T = TECHOS[techo], M = MUROS[muro], y = suelo - t, k;
    for (k = 0; k < ancho; k++) tile(c, k === 0 ? M.base[0] : k === ancho - 1 ? M.base[2] : (k === 1 ? M.puerta : M.base[1]), x + k * t, y, s);
    for (var p = 0; p < pisos; p++) {
      y -= t;
      for (k = 0; k < ancho; k++) { tile(c, k === 0 ? M.muro[0] : k === ancho - 1 ? M.muro[2] : M.muro[1], x + k * t, y, s); if (k > 0 && k < ancho - 1 && (k + p) % 2) tile(c, M.ventana, x + k * t, y, s); }
    }
    for (var f = filasTecho - 1; f >= 0; f--) {
      y -= t; var fila = f === 0 ? 0 : (f === filasTecho - 1 ? 6 : 3);
      for (k = 0; k < ancho; k++) tile(c, T[fila + (k === 0 ? 0 : k === ancho - 1 ? 2 : 1)], x + k * t, y, s);
    }
    return ancho * t;
  }
  function arbol(c, x, suelo, s, naranja) { tile(c, naranja ? 67 : 68, x, suelo - 32 * s, s); tile(c, naranja ? 79 : 80, x, suelo - 16 * s, s); }
  function farol(c, x, suelo, s) { tile(c, 86, x, suelo - 32 * s, s); tile(c, 98, x, suelo - 16 * s, s); }
  function nubePix(c, x, y, s) { c.fillStyle = "#fff"; c.fillRect(x, y + 4 * s, 28 * s, 8 * s); c.fillRect(x + 6 * s, y, 12 * s, 6 * s); c.fillRect(x + 4 * s, y + 2 * s, 20 * s, 4 * s); c.fillStyle = "rgba(63,38,49,.12)"; c.fillRect(x, y + 10 * s, 28 * s, 2 * s); }

  /* Capas de edificios pre-dibujadas una sola vez por mundo (se recorren con drawImage). */
  var PERIODO = 2400, cacheCapas = {};
  function capas(ti) {
    if (cacheCapas[ti]) return cacheCapas[ti];
    if (!TC.naturalWidth) return null;
    var T = TEMAS[ti], res = {};
    [["lejos", 101, 1, 0.22], ["cerca", 7, 0, 0.5]].forEach(function (cfg) {
      var cv = document.createElement("canvas"), alto = 320, c;
      cv.width = PERIODO * 2; cv.height = alto * 2; c = cv.getContext("2d"); c.imageSmoothingEnabled = false;
      c.setTransform(2, 0, 0, 2, 0, 0);
      var suelo = alto, px = 0, sem = cfg[1], extra = cfg[2];
      for (var i = 0; px < PERIODO - 140; i++) {
        var h1 = hsh(sem * 3 + i * 11 + 1), an = 3 + Math.floor(h1 * 3);
        px += edificio(c, px, suelo, an, Math.floor(hsh(sem * 3 + i * 11 + 2) * 2) + extra + (i % 3 === 1 ? 1 : 0), 2 + (hsh(sem * 3 + i * 11 + 3) < 0.5 ? 1 : 0), Math.floor(hsh(sem * 3 + i * 11 + 4) * 2), Math.floor(hsh(sem * 3 + i * 11 + 5) * 2), 2);
        if (!extra && hsh(sem * 3 + i * 11 + 6) < 0.45 && px < PERIODO - 100) { arbol(c, px + 4, suelo, 2, hsh(sem * 3 + i * 11 + 7) < 0.4); px += 72; } else px += 24;
      }
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalCompositeOperation = "source-atop";
      if (T.tinte) { c.fillStyle = T.tinte; c.fillRect(0, 0, cv.width, cv.height); }
      if (cfg[0] === "lejos") { c.fillStyle = T.bruma; c.fillRect(0, 0, cv.width, cv.height); }
      c.globalCompositeOperation = "source-over";
      res[cfg[0]] = { cv: cv, alto: alto, vel: cfg[3] };
    });
    cacheCapas[ti] = res;
    return res;
  }

  /* ---------- Estado global ---------- */
  var raiz, cv, ctx, S = null, V = null, parts, ultimo = 0, acum = 0, teclas = {}, rafId = 0;
  function azar() { return Math.random(); }
  function miles(n) { return Number(n || 0).toLocaleString("es-MX"); }
  function sonar(n, v) { B.ui.sonar(n, v); }

  /* =========================================================
     PANTALLA DE INICIO: solo PLAY (y botones chicos)
     ========================================================= */
  function inicio() {
    S = null; cancelAnimationFrame(rafId);
    var J = L.actual(), p = prog(), sig = siguienteNivel(), son = localStorage.getItem("brote_sonido") !== "0";
    raiz.innerHTML = "<div class='home-run'><canvas id='hCv' width='" + W * 2 + "' height='" + H * 2 + "'></canvas>" +
      "<div class='home-capa'>" +
      "<div class='logo-run'><span>SEMILLÍN</span><em>RUN</em></div>" +
      "<p class='lema-run'>Simulación de Sistemas Dinámicos · 17 mundos</p>" +
      "<button class='btn-play' id='hPlay' title='Jugar (Enter)'>" + IC.play + "<span>PLAY</span></button>" +
      "<div class='home-sig'>" + (completados() ? "Continuar: Mundo " + (sig + 1) + " · " + NV[sig].nombre : "Empieza en el Mundo 1 con una demo rápida") + "</div>" +
      "<div class='home-stats px-panel'>" +
      (J ? "<button class='chip-jug' id='hJug' title='Cambiar jugador'>" + avatar(J.avatar) + "<b>" + J.nombre + "</b></button>" : "") +
      "<div class='cifra'>" + IC.estrella(true) + "<b>" + miles(L.total()) + "</b><small>puntos</small></div>" +
      "<div class='cifra'>" + IC.fuego + "<b>" + (p.racha || 0) + "</b><small>días seguidos</small></div>" +
      "<div class='cifra'>" + IC.estrella(true) + "<b>" + estrellasTotales() + "/" + NV.length * 3 + "</b><small>estrellas</small></div>" +
      "<div class='cifra'><b>" + completados() + "/" + NV.length + "</b><small>mundos</small></div>" +
      "<div class='cifra'><b>" + (p.mejorRacha || 0) + "</b><small>mejor racha</small></div></div>" +
      "<div class='home-mini'><button class='mini-btn' id='hMundos'>" + IC.mapa + "Mundos</button><button class='mini-btn' id='hForm'>" + IC.formula + "Formulario</button><button class='mini-btn' id='hLiga'>" + IC.copa + "Liga</button><button class='mini-btn' id='hSon'>" + IC.sonido(son) + "</button></div>" +
      "</div></div><p class='creditos-run'>Gráficos: Tiny City de Kenney (CC0) · Fuente: Jersey 10 (OFL) · Basado en Crowds de Nicky Case (CC0)</p>";
    raiz.querySelector("#hPlay").onclick = function () { sonar("party_short", .4); conPerfil(function () { abrirNivel(siguienteNivel()); }); };
    raiz.querySelector("#hMundos").onclick = function () { sonar("button1", .4); conPerfil(mundos); };
    raiz.querySelector("#hForm").onclick = function () { formulario(); };
    raiz.querySelector("#hLiga").onclick = function () { sonar("button1", .4); conPerfil(function () { liga(""); }); };
    raiz.querySelector("#hSon").onclick = function () { var v = localStorage.getItem("brote_sonido") === "0"; localStorage.setItem("brote_sonido", v ? "1" : "0"); this.innerHTML = IC.sonido(v); };
    if (J) raiz.querySelector("#hJug").onclick = function () { perfil(inicio, true); };
    /* Fondo animado: Semillín corre por la ciudad del mundo que sigue. */
    cv = raiz.querySelector("#hCv"); ctx = cv.getContext("2d");
    parts = new A.Particulas();
    V = { T: TEMAS[NV[sig].tema], ti: NV[sig].tema, dist: 0, t: 0, y: PISO, vy: 0, suelo: true, aplasta: 0, agachado: false, fase: "home", objs: [], amb: [], prev: { dist: 0, y: PISO } };
    ultimo = performance.now(); acum = 0;
    rafId = requestAnimationFrame(bucleHome);
  }
  function bucleHome(ahora) {
    if (S || !V || V.fase !== "home" || !document.body.contains(cv)) return;
    var dt = Math.min(0.1, (ahora - ultimo) / 1000); ultimo = ahora; acum += dt;
    while (acum >= PASO) {
      V.prev.dist = V.dist; V.prev.y = V.y; acum -= PASO; V.t += PASO; V.dist += 140 * PASO; V.aplasta *= 0.9;
      V.vy += G * PASO; V.y += V.vy * PASO;
      if (V.y >= PISO) { if (!V.suelo) V.aplasta = 0.3; V.y = PISO; V.vy = 0; V.suelo = true; if (hsh(Math.floor(V.t * 2)) < 0.012) { V.vy = SALTO * 0.8; V.suelo = false; } }
      ambiente(PASO);
    }
    dibujar(acum / PASO);
    rafId = requestAnimationFrame(bucleHome);
  }
  function conPerfil(f) { if (L.actual()) f(); else perfil(f); }

  /* ---------- Avatares de la liga ---------- */
  var SVG_SEMILLIN = "<svg viewBox='0 0 32 32' shape-rendering='crispEdges'><path d='M16 9V5' stroke='#3f2631' stroke-width='2'/><ellipse cx='11' cy='5' rx='5' ry='3' fill='#84c669' stroke='#3f2631' stroke-width='1.5'/><ellipse cx='21' cy='5' rx='5' ry='3' fill='#84c669' stroke='#3f2631' stroke-width='1.5'/><circle cx='16' cy='19' r='11' fill='#ffcc4d' stroke='#3f2631' stroke-width='2'/><rect x='10' y='15' width='4' height='5' fill='#fff'/><rect x='18' y='15' width='4' height='5' fill='#fff'/><rect x='12' y='17' width='2' height='3' fill='#3f2631'/><rect x='20' y='17' width='2' height='3' fill='#3f2631'/><path d='M12 24h8' stroke='#3f2631' stroke-width='2'/></svg>";
  function avatar(a, extra) {
    if (a === "semillin") return "<span class='av av-semillin " + (extra || "") + "'>" + SVG_SEMILLIN + "</span>";
    var c = a % 12, r = Math.floor(a / 12);
    return "<span class='av " + (extra || "") + "' style='background-size:1200% 1100%;background-position:" + (c / 11 * 100).toFixed(3) + "% " + (r / 10 * 100).toFixed(3) + "%'></span>";
  }

  /* ---------- Modal genérico ---------- */
  function modal(html, clase, alCerrar) {
    var m = document.createElement("div"); m.className = "modal-fondo";
    m.innerHTML = "<div class='modal-caja " + (clase || "") + "'><button class='cerrar-x' title='Cerrar (Esc)'>×</button>" + html + "</div>";
    document.body.appendChild(m);
    function cerrar() { m.remove(); if (alCerrar) alCerrar(); }
    m.querySelector(".cerrar-x").onclick = cerrar;
    m.addEventListener("click", function (e) { if (e.target === m) cerrar(); });
    m._cerrar = cerrar;
    return m;
  }
  /* Mientras resuelves, consultar el formulario, las tablas o el enunciado NO detiene el reloj (como en un examen). */
  function consulta(html, clase) {
    var enZona = S && S.fase === "calcular" && !S.jefe, pausado = enZona ? false : pausar(true);
    var m = modal(html, clase + (enZona ? " con-reloj" : ""), function () { if (pausado) pausar(false); });
    if (enZona) { var z = document.createElement("div"); z.className = "reloj-modal"; z.innerHTML = "El reloj sigue corriendo: <b id='rZm'>" + Math.ceil(S.zonaT) + "</b> s"; m.querySelector(".modal-caja").appendChild(z); }
    return m;
  }
  function formulario() { consulta("<h2>Formulario</h2>" + B.formulario.html(), "form-modal"); }
  function tablas(cual) { consulta("<h2>Tablas estadísticas</h2>" + B.formulario.tablasHtml(cual), "tablas-modal"); }
  function enunciado() {
    if (!S) return; var N = S.N;
    consulta("<h2>Mundo " + N.num + " · " + N.nombre + "</h2><p class='enun'>" + M(N.enunciado) + "</p>" + datosHtml(N) + "<p class='fuente'>Basado en: " + N.fuente + "</p>", "enun-modal");
  }
  function datosHtml(N) { return N.datos ? "<div class='datos-run'>" + N.datos.map(function (x, i) { return "<span><i>" + (i + 1) + "</i>" + x.toFixed(5) + "</span>"; }).join("") + "</div>" : ""; }

  /* ---------- Jugador ---------- */
  function perfil(despues, cambiar) {
    var J = L.actual(), elegido = J ? J.avatar : "semillin", otros = L.locales().filter(function (p) { return !J || p.id !== J.id; });
    var m = document.createElement("div"); m.className = "modal-fondo";
    m.innerHTML = "<div class='modal-caja perfil-modal'><h2>" + (cambiar ? "Cambiar jugador" : "¿Quién va a jugar?") + "</h2>" +
      (otros.length ? "<div>Seguir como:</div><div class='otros-perfiles'>" + otros.map(function (p) { return "<button data-id='" + p.id + "'>" + avatar(p.avatar) + p.nombre + "</button>"; }).join("") + "</div><div>O crea un jugador nuevo:</div>" : "<div>Tu nombre aparecerá en la liga y en tu progreso.</div>") +
      "<input id='pNom' maxlength='18' placeholder='Tu nombre o apodo' autocomplete='off'>" +
      "<div>Elige tu personaje:</div><div class='avatares'>" + L.AVATARES.map(function (a) { return "<button data-a='" + a + "' class='" + (a === elegido ? "activo" : "") + "'>" + avatar(a) + "</button>"; }).join("") + "</div>" +
      "<div class='fila-btn' style='justify-content:center'>" + (cambiar ? "<button class='btn blanco' id='pCancel'>Cancelar</button>" : "") + "<button class='btn verde' id='pOk'>¡Listo!</button></div></div>";
    document.body.appendChild(m);
    var inp = m.querySelector("#pNom"); inp.focus();
    m.querySelectorAll("[data-a]").forEach(function (b) { b.onclick = function () { m.querySelectorAll("[data-a]").forEach(function (x) { x.classList.remove("activo"); }); b.classList.add("activo"); var v = b.getAttribute("data-a"); elegido = v === "semillin" ? v : +v; }; });
    m.querySelectorAll("[data-id]").forEach(function (b) { b.onclick = function () { L.cambiar(b.getAttribute("data-id")); m.remove(); despues(); }; });
    function ok() { if (!inp.value.trim()) { inp.focus(); inp.style.background = "#ffe1dc"; return; } L.crear(inp.value, elegido); sonar("party_short", .4); m.remove(); despues(); }
    m.querySelector("#pOk").onclick = ok;
    inp.onkeydown = function (e) { e.stopPropagation(); if (e.key === "Enter") ok(); };
    if (cambiar) m.querySelector("#pCancel").onclick = function () { m.remove(); };
  }

  /* =========================================================
     MAPA DE MUNDOS (todos abiertos)
     ========================================================= */
  function mundos() {
    S = null; cancelAnimationFrame(rafId); V = null;
    var grupos = {};
    NV.forEach(function (N) { (grupos[N.unidad] = grupos[N.unidad] || []).push(N); });
    raiz.innerHTML = "<div class='menu-run'><div class='barra-sec px-panel'><button class='btn blanco chico' id='mVolver'>← Inicio</button><h2>Mundos</h2><span>Todos están abiertos. Cada mundo es un tema del curso.</span></div>" +
      Object.keys(grupos).map(function (u) {
        return "<h3 class='sec-run'>" + u + "</h3><div class='mundos-run'>" + grupos[u].map(function (N) {
          var r = L.record(N.id), e = r.estrellas || 0, T = TEMAS[N.tema];
          return "<button class='mundo-run' data-i='" + (N.num - 1) + "'><span class='cielo' style='background:linear-gradient(" + T.cielo[0] + "," + T.cielo[1] + ")'><canvas width='240' height='90' data-t='" + N.tema + "'></canvas><span class='num'>" + N.num + "</span></span><b>" + N.nombre + "</b><small>Mundo " + T.n + "</small><span class='pie'><span>" + [1, 2, 3].map(function (k) { return IC.estrella(k <= e); }).join("") + "</span><span>" + (r.puntos ? miles(r.puntos) + " pts" : "Nuevo") + "</span></span></button>";
        }).join("") + "</div>";
      }).join("") + "</div>";
    raiz.querySelector("#mVolver").onclick = inicio;
    raiz.querySelectorAll(".mundo-run").forEach(function (b) { b.onclick = function () { sonar("button1", .4); abrirNivel(+b.getAttribute("data-i")); }; });
    alCargar(function () {
      raiz.querySelectorAll(".mundo-run canvas").forEach(function (m) {
        var ti = +m.getAttribute("data-t"), c = m.getContext("2d"), K = capas(ti), T = TEMAS[ti];
        if (!K) return;
        c.imageSmoothingEnabled = false;
        c.fillStyle = T.sol; c.fillRect(196, 10, 16, 16);
        c.drawImage(K.lejos.cv, 0, 0, 1200, K.lejos.alto * 2, 0, 90 - 100, 240, 100);
        c.drawImage(K.cerca.cv, 600, 0, 1200, K.cerca.alto * 2, 0, 90 - 92, 240, 100);
        c.fillStyle = "#52607c"; c.fillRect(0, 84, 240, 6);
      });
    });
  }

  /* =========================================================
     LIGA
     ========================================================= */
  function liga(mundo) {
    S = null; cancelAnimationFrame(rafId); V = null;
    var local = L.ranking(mundo).filter(function (r) { return !mundo || r.puntos > 0 || r.yo; });
    L.enLinea(function (ok) {
      if (!ok) return pintarLiga(mundo, local, false);
      raiz.innerHTML = "<div class='liga-run'><div class='liga-cab px-panel'><h2>Liga de Semillín<small>Cargando la liga en línea…</small></h2></div></div>";
      L.subir(function () { L.rankingEnLinea(mundo, function (lista) { if (lista) pintarLiga(mundo, lista, true); else pintarLiga(mundo, local, false, "No se pudo conectar con la liga en línea; se muestra la liga de esta computadora."); }); });
    });
  }
  function pintarLiga(mundo, lista, enLinea, aviso) {
    function lugar(r, n) { return r ? "<div class='lugar l" + n + (r.yo ? " yo" : "") + "'>" + avatar(r.avatar) + "<div class='nom'>" + r.nombre + "</div><div class='pts'>" + miles(r.puntos) + " pts</div><div class='bloque'>" + n + "</div></div>" : "<div class='lugar l" + n + "'><div class='bloque' style='opacity:.35'>" + n + "</div></div>"; }
    raiz.innerHTML = "<div class='liga-run'><div class='liga-cab px-panel'>" + IC.copa.replace("class='ic-run'", "class='copa'") + "<h2>Liga de Semillín<small>" + (mundo ? "Mejor puntaje en este mundo" : "Suma de tus mejores puntajes en los " + NV.length + " mundos") + "</small></h2>" +
      "<select id='lSel'><option value=''>General</option>" + NV.map(function (N) { return "<option value='" + N.id + "'" + (N.id === mundo ? " selected" : "") + ">" + N.num + ". " + N.nombre + "</option>"; }).join("") + "</select>" +
      "<button class='btn blanco' id='lVolver'>← Inicio</button></div>" +
      "<div class='podio'>" + lugar(lista[1], 2) + lugar(lista[0], 1) + lugar(lista[2], 3) + "</div><div class='suelo-podio'></div>" +
      "<div class='lista-liga px-panel'>" + (lista.length ? lista.map(function (r, i) {
        return "<div class='fila-liga" + (r.yo ? " yo" : "") + "'><span class='pos'>" + (i + 1) + "</span>" + avatar(r.avatar) + "<span class='nom'>" + r.nombre + (r.yo ? " (tú)" : "") +
          "<small>" + (mundo ? r.estrellas + " de 3 estrellas" : r.mundos + " de " + NV.length + " mundos · " + r.estrellas + " estrellas") + (r.externo ? " · compañero agregado por código" : "") + "</small></span><span class='pts'>" + miles(r.puntos) + "</span>" +
          (r.externo ? "<button class='quitar' data-q='" + r.id + "' title='Quitar de mi tabla'>×</button>" : "") + "</div>";
      }).join("") : "<div class='vacio-liga'>Nadie ha superado este mundo todavía.</div>") + "</div>" +
      (enLinea ? "<div class='px-panel nota-liga'><h3>Liga en línea</h3><p>Aquí aparecen todos los compañeros que juegan en esta página. Tus mejores puntajes se suben solos al terminar cada mundo.</p></div></div>" :
      (aviso ? "<div class='px-panel nota-liga mal'>" + aviso + "</div>" : "") +
      "<div class='compartir-liga'><div class='px-panel'><h3>Tu código de liga</h3><p>Mándalo a tus compañeros. Cuando lo peguen en su juego, aparecerás en su tabla.</p><textarea readonly id='lMio'>" + L.codigo() + "</textarea><div class='fila-btn'><button class='btn oro chico' id='lCopiar'>Copiar código</button><span class='msg-liga' id='lMsg1'></span></div></div>" +
      "<div class='px-panel'><h3>Agregar a un compañero</h3><p>Pega el código que te mandó. Si lo pegas otra vez, sus puntos se actualizan.</p><textarea id='lCod' placeholder='SEMILLIN-…'></textarea><div class='fila-btn'><button class='btn verde chico' id='lAgregar'>Agregar a la liga</button><span class='msg-liga' id='lMsg2'></span></div></div></div></div>");
    raiz.querySelector("#lVolver").onclick = inicio;
    raiz.querySelector("#lSel").onchange = function () { liga(this.value); };
    raiz.querySelectorAll("[data-q]").forEach(function (b) { b.onclick = function () { L.quitar(b.getAttribute("data-q")); liga(mundo); }; });
    if (enLinea) return;
    raiz.querySelector("#lCopiar").onclick = function () {
      var t = raiz.querySelector("#lMio"), msg = raiz.querySelector("#lMsg1"); t.select();
      var listo = function () { msg.className = "msg-liga bien"; msg.textContent = "Copiado"; };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t.value).then(listo, function () { document.execCommand("copy"); listo(); });
      else { document.execCommand("copy"); listo(); }
    };
    raiz.querySelector("#lAgregar").onclick = function () {
      var r = L.importar(raiz.querySelector("#lCod").value), msg = raiz.querySelector("#lMsg2");
      if (!r.ok) { msg.className = "msg-liga mal"; msg.textContent = r.error; return; }
      sonar("party_short", .4); liga(mundo);
      var m2 = raiz.querySelector("#lMsg2"); m2.className = "msg-liga bien"; m2.textContent = r.nombre + (r.nuevo ? " se unió a tu liga" : ": puntos actualizados");
    };
  }

  /* =========================================================
     TARJETA DE INICIO DE MUNDO (enunciado del problema)
     ========================================================= */
  function abrirNivel(i) {
    var N = NV[i]; if (!N) return inicio();
    var p = prog(); p.ultimo = i; p.guardar();
    var demo = i === 0;
    var m = modal("<div class='tarjeta-mundo' style='--c1:" + TEMAS[N.tema].cielo[0] + ";--c2:" + TEMAS[N.tema].cielo[1] + "'><div class='tm-cab'><span class='tm-num'>" + N.num + "</span><div><small>" + N.unidad + " · Mundo " + TEMAS[N.tema].n + "</small><h2>" + N.nombre + "</h2></div></div>" +
      "<p class='enun'>" + M(N.enunciado) + "</p>" + datosHtml(N) +
      "<div class='tm-como'>Corre y junta monedas (cada una da <b>+" + SEG_MONEDA + " s</b>). En cada zona de cálculo resuelve la celda que se pide de la tabla y entra al tubo con el resultado correcto." + (N.tipo === "prueba" ? " El botón <b>Tablas</b> abre las tablas estadísticas del curso." : "") + "</div>" +
      "<div class='tm-pie'><span>" + N.pasos.length + " celdas + jefe final · Basado en: " + N.fuente + "</span><button class='btn verde' id='tmGo'>" + (demo ? "Ver demo y jugar" : "¡A correr!") + " <kbd>Enter</kbd></button></div></div>", "tm-modal", function () { inicio(); });
    var go = m.querySelector("#tmGo");
    go.focus();
    go.onclick = function () { m.remove(); jugar(i, demo); };
    m.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); go.onclick(); } });
  }

  /* =========================================================
     PARTIDA
     ========================================================= */
  function jugar(i, demo) {
    cancelAnimationFrame(rafId);
    var N = NV[i];
    marcarDia();
    parts = new A.Particulas();
    raiz.innerHTML = "<div class='juego-run'>" +
      "<div class='hud-run'><div class='hud-titulo'><b>" + N.num + ". " + N.nombre + "</b><small>" + N.unidad + "</small></div>" +
      "<div class='hud-pasos' id='rPasos'></div><div class='hud-pill' id='rCor'></div>" +
      "<div class='hud-pill racha' id='rRacha'></div><div class='hud-pill puntos' id='rP'></div>" +
      "<span class='hud-esp'></span>" +
      "<button class='mini-btn' id='rEnun' title='Ver enunciado'>Enunciado</button>" + (N.tipo === "prueba" ? "<button class='mini-btn tablas' id='rTablas' title='Tablas estadísticas del curso'>" + IC.tabla + "Tablas</button>" : "") +
      "<button class='mini-btn' id='rForm' title='Formulario'>" + IC.formula + "</button><button class='mini-btn' id='rPausa' title='Pausa (Esc)'>" + IC.pausa + "</button><button class='mini-btn' id='rSalir'>Salir</button></div>" +
      "<div class='formula-run' id='rF'></div>" +
      "<div class='cuerpo-run'><div class='lienzo-run'><canvas width='" + W * 2 + "' height='" + H * 2 + "'></canvas><div class='pregunta-run' id='rQ'></div><div class='aviso-run' id='rA'></div><div class='coach-run' id='rCoach'></div><div class='flash-run' id='rFlash'></div><div class='iris-run' id='rIris'></div></div>" +
      "<div class='lado-run'><div class='tabla-run' id='rT'></div><div class='calc-run' id='rCalc'></div></div></div>" +
      "<div class='ayuda-run'><kbd>Espacio</kbd>/<kbd>↑</kbd> brincar · <kbd>↓</kbd> agacharse o entrar al tubo · <kbd>Enter</kbd> ir a los tubos o continuar · <kbd>Esc</kbd> pausa · cada moneda = +" + SEG_MONEDA + " s para resolver</div></div>";
    cv = raiz.querySelector("canvas"); ctx = cv.getContext("2d");
    S = { N: N, i: i, T: TEMAS[N.tema], ti: N.tema, k: 0, vidas: 3, puntos: 0, vel: 240, velBase: 240, y: PISO, vy: 0, suelo: true, dist: 0, objs: [], amb: [],
      fase: "correr", extra: 0, filas: [], inv: 0, t: 0, tramo: null, jefe: 0, aplasta: 0, agachado: false, racha: 0, mejorRacha: 0, aciertos: 0, errores: 0, golpes: 0,
      agotados: 0, monedas: 0, monedasTot: 0, prev: { dist: 0, y: PISO }, listo: false, pausa: false, inicio: Date.now() };
    V = S;
    construirCalc();
    raiz.querySelector("#rSalir").onclick = function () { S = null; inicio(); };
    raiz.querySelector("#rForm").onclick = formulario;
    if (raiz.querySelector("#rTablas")) raiz.querySelector("#rTablas").onclick = function () { tablas(S.paso && S.paso.tabla); };
    raiz.querySelector("#rEnun").onclick = enunciado;
    raiz.querySelector("#rPausa").onclick = function () { menuPausa(); };
    cv.addEventListener("pointerdown", function () { brincar(); });
    pintarPasos(); pintar();
    iris(true);
    if (demo) iniciarDemo();
    else { nuevaVuelta(); A.cuentaRegresiva(raiz.querySelector(".lienzo-run"), function () { if (S) S.listo = true; }); }
    ultimo = performance.now(); acum = 0;
    rafId = requestAnimationFrame(bucle);
  }
  function pasoActual() { return S.N.pasos[S.k]; }
  /* Cada vuelta: virus que esquivar y monedas de tiempo (+5 s cada una para la siguiente zona de cálculo). */
  function nuevaVuelta() {
    S.fase = "correr"; S.dist = 0; S.prev.dist = 0; S.objs = []; S.tramo = null; S.extra = 0;
    S.paso = pasoActual(); S.largo = 1500 + Math.min(S.k, 8) * 50;
    S.vel = S.velBase = Math.min(360, 240 + S.k * 10 + S.i * 3);
    var x = 640, k = 0, nivel = S.i;
    while (x < S.largo - 220) {
      var r = azar(), tipo = r < 0.62 ? "virus" : (r < 0.86 || nivel < 3 ? "bajo" : "alto");
      S.objs.push({ tipo: tipo, x: x, r: tipo === "virus" ? (azar() < 0.3 ? 26 : 20) : 16, fase: azar() * 6 });
      var hueco = 400 + azar() * 260 + S.vel * 0.3;
      if (k < MONEDAS_VUELTA && azar() < 0.9) { S.objs.push({ tipo: "moneda", x: x + hueco / 2, y: PISO - (azar() < 0.5 ? 150 : 70) }); k++; }
      else S.objs.push({ tipo: "semilla", x: x + hueco / 2, y: PISO - 80 });
      x += hueco;
    }
    S.monedasTot += k;
    pintar(); pintarPasos();
  }

  /* ---------- Demo interactiva (mundo 1) ---------- */
  var DEMO = [
    { txt: "Presiona <kbd>Espacio</kbd> o <kbd>↑</kbd> para <b>brincar</b>", espera: "brinca" },
    { txt: "¡Brinca el virus antes de que te toque!", objeto: { tipo: "virus", r: 22 }, espera: "pasa" },
    { txt: "Mantén <kbd>↓</kbd> para <b>agacharte</b>", espera: "agacha" },
    { txt: "Agáchate (<kbd>↓</kbd>) para esquivar el virus volador", objeto: { tipo: "bajo", r: 16 }, espera: "pasa" },
    { txt: "Junta la moneda: cada moneda te da <b>+" + SEG_MONEDA + " s</b> para resolver el problema", objeto: { tipo: "moneda", y: PISO - 70 }, espera: "moneda" },
    { txt: "En la <b>zona de cálculo</b> resuelve con la calculadora de la derecha y presiona <kbd>Enter</kbd> para ir a los tubos", espera: "calcula" },
    { txt: "Párate sobre el <b>tubo</b> con tu resultado y presiona <kbd>↓</kbd>. Para llegar al tubo B, <b>brinca la lava</b>", espera: "tubo" }
  ];
  var DEMO_CALC = { t: "Demo", tipo: "num", pide: "$2 + 3$", ok: 5, okTxt: "5", malTxt: "6", fg: "Suma los dos números", f: "$2 + 3 = 5$", filas: [] };
  function iniciarDemo() {
    S.demo = { k: -1 }; S.listo = true; S.vel = 190; S.largo = 1e9; S.paso = null;
    var c = raiz.querySelector("#rCoach");
    c.innerHTML = "<div class='coach-txt' id='rCoachT'></div><button class='btn blanco chico' id='rSkip'>Saltar demo <kbd>Esc</kbd></button>";
    c.style.display = "flex";
    raiz.querySelector("#rSkip").onclick = finDemo;
    siguienteDemo();
  }
  function siguienteDemo() {
    var D = S.demo; D.k++; D.listo = false;
    if (D.k >= DEMO.length) return finDemo(true);
    var p = DEMO[D.k];
    raiz.querySelector("#rCoachT").innerHTML = "<span class='coach-n'>" + (D.k + 1) + "/" + DEMO.length + "</span>" + p.txt;
    if (p.objeto) { var o = Object.assign({ x: S.dist + W + 60, fase: 0 }, p.objeto); S.objs.push(o); D.obj = o; }
    if (p.espera === "calcula") { S.paso = DEMO_CALC; S.extra = SEG_MONEDA; zonaCalculo(); raiz.querySelector(".calc-run").classList.add("brilla"); }
  }
  function demoEvento(ev) {
    var D = S && S.demo; if (!D || D.listo) return;
    var p = DEMO[D.k];
    if (p.espera === ev) {
      D.listo = true; sonar("chimes", .3);
      parts.texto(PX, S.y - 90, "¡Bien!", "#2f8f3a", 26);
      setTimeout(function () { if (S && S.demo) siguienteDemo(); }, 650);
    }
  }
  function finDemo(completa) {
    if (!S || !S.demo) return;
    S.demo = null; raiz.querySelector("#rCoach").style.display = "none"; raiz.querySelector("#rQ").style.display = "none";
    raiz.querySelector(".calc-run").classList.remove("brilla");
    var p = prog(); p.demo = true; p.guardar();
    aviso(completa === true ? "¡Demo completa! Ahora el mundo de verdad" : "Demo saltada", "bien", 1600);
    S.objs = []; S.tramo = null; S.k = 0; S.listo = false; S.vidas = 3; S.puntos = 0; S.racha = 0; S.filas = []; S.errores = 0; S.aciertos = 0; S.golpes = 0;
    nuevaVuelta();
    A.cuentaRegresiva(raiz.querySelector(".lienzo-run"), function () { if (S) S.listo = true; });
  }

  /* ---------- Zona de cálculo ----------
     El jugador ve qué celda sigue, la fórmula de clase y los dos valores que tendrán los tubos.
     Calcula con la calculadora y, cuando está listo (Enter) o se acaba el tiempo, corre a los
     tubos y entra al del resultado correcto. El tiempo es la base del paso + 5 s por moneda;
     lo que sobra da puntos extra. */
  function zonaCalculo() {
    var p = S.paso;
    S.fase = "calcular"; S.tiempoIni = (p.tipo === "num" ? (p.seg || 40) : 25) + S.extra; S.zonaT = S.tiempoIni; S.zonaRest = 0;
    var izq = azar() < 0.5;
    S.ops = izq ? [p.okTxt, p.malTxt] : [p.malTxt, p.okTxt]; S.correcta = izq ? 0 : 1;
    var extra = S.extra ? "<span class='bono-t'>" + IC.moneda + "+" + S.extra + " s de tus monedas</span>" : "<span class='bono-t sin'>Sin monedas: solo tiempo base</span>";
    var reloj = "<div class='reloj-run'><div class='barra-t'><i id='rZb'></i></div><span>" + IC.reloj + "<b id='rZ'>" + Math.ceil(S.zonaT) + "</b> s</span>" + extra + "</div>";
    var titulo = S.demo ? "Zona de cálculo (demo)" : "Zona de cálculo · " + M(p.t);
    var cuerpo = p.tipo === "num"
      ? "<div class='pide-run'>Calcula " + M(p.pide) + "</div>" + (p.fg ? "<div class='fg-run'><small>Fórmula de clase</small>" + M(p.fg) + "</div>" : "") +
        "<div>Resuelve con la calculadora" + (p.tabla ? " y el botón <b>Tablas</b>" : "") + ". Los tubos dirán:</div>"
      : "<div class='frase-run'>" + M(p.f) + "</div><div>¿Qué completa la frase? Los tubos dirán:</div>";
    mostrarPregunta(titulo, cuerpo + opsHtml() + reloj, "<button class='btn verde' id='rListo'>Ir a los tubos <kbd>Enter</kbd></button>");
    raiz.querySelector("#rListo").onclick = tubos;
    pintar();
  }
  function opsHtml() { return "<div class='ops-run'><span><i>A</i>" + M(S.ops[0]) + "</span><span><i>B</i>" + M(S.ops[1]) + "</span></div>"; }
  function mostrarPregunta(titulo, cuerpo, pie) {
    var q = raiz.querySelector("#rQ");
    q.innerHTML = "<div class='q-tit'>" + titulo + "</div>" + cuerpo + (pie || "");
    q.style.display = "block"; q.className = "pregunta-run";
  }
  function llenarTabla(p) {
    p.filas.forEach(function (f) { S.filas.push({ v: f.slice(), nuevo: true }); });
    (p.pon || []).forEach(function (c) { if (S.filas[c[0]]) { S.filas[c[0]].v[c[1]] = c[2]; S.filas[c[0]].nuevo = true; } });
  }
  /* Panel con el procedimiento completo (después de acertar o cuando se acaba el tiempo). */
  function solucion(bien, bono) {
    var p = S.paso;
    S.fase = "solucion";
    var cab = bien ? "<div class='sol-cab bien'>¡Correcto! " + (S.intentos ? "(" + (S.intentos + 1) + " intentos)" : "") + (bono ? " <small>+" + bono * mult() + " pts por el tiempo que te sobró</small>" : "") + "</div>"
      : "<div class='sol-cab mal'>Se acabó el tiempo · pierdes una vida</div>";
    mostrarPregunta("Procedimiento · " + M(p.t), cab +
      "<div class='res-run'>" + M(p.pide) + " = <b>" + M(p.okTxt) + "</b></div>" +
      (p.fg ? "<div class='fg-run'><small>Fórmula</small>" + M(p.fg) + "</div>" : "") +
      "<div class='proc-run'><small>Sustitución</small>" + M(p.f) + "</div>" + (p.nota ? "<div class='mini-run'>" + M(p.nota) + "</div>" : ""),
      "<button class='btn verde' id='rSeguir'>" + (S.vidas > 0 ? "Continuar" : "Ver resultado") + " <kbd>Enter</kbd></button>");
    raiz.querySelector("#rQ").classList.add(bien ? "sol-bien" : "sol-mal");
    raiz.querySelector("#rSeguir").onclick = continuar;
    setTimeout(function () { var b = raiz.querySelector("#rSeguir"); if (b) b.focus(); }, 30);
    pintar(); pintarPasos();
  }
  function continuar() {
    if (!S || S.fase !== "solucion") return;
    raiz.querySelector("#rQ").style.display = "none";
    if (S.vidas <= 0) return fin(false);
    S.k++; pintarPasos();
    if (S.k >= S.N.pasos.length) return iniciarJefe();
    S.vel = S.velAnt || S.vel; nuevaVuelta();
  }
  function tiempoFuera() { tubos(); }
  function tubos() {
    if (!S || S.fase !== "calcular" || !S.paso) return;
    raiz.querySelector("#rQ").style.display = "none";
    S.zonaRest = S.jefe ? 0 : Math.max(0, S.zonaT);
    if (S.demo) { raiz.querySelector(".calc-run").classList.remove("brilla"); demoEvento("calcula"); }
    S.fase = "tubos";
    var x0 = S.dist + 620;
    S.tramo = { ini: x0, t1: [x0, x0 + 240], t2: [x0 + 340, x0 + 580], fin: x0 + 820 };
    S.velAnt = S.vel; S.vel = Math.min(S.vel, 210);
  }
  function entrar() {
    if (!S || S.fase !== "tubos" || !S.suelo || S.entrando) return false;
    var t = S.tramo, pos = S.dist + PX, cual = pos >= t.t1[0] && pos <= t.t1[1] ? 0 : (pos >= t.t2[0] && pos <= t.t2[1] ? 1 : -1);
    if (cual < 0) return false;
    S.entrando = 0.0001; sonar("squeak_down", .5);
    setTimeout(function () { if (S) resolver(cual === S.correcta); }, 650);
    return true;
  }
  function mult() { return Math.min(4, 1 + Math.floor(S.racha / 3)); }
  function sumar(n, x, y) { var v = n * mult(); S.puntos += v; if (x !== undefined) parts.texto(x, y, "+" + v + (mult() > 1 ? " ×" + mult() : ""), "#8a6400", 22); pintar(); return v; }
  function resolver(ok) {
    S.entrando = 0;
    if (S.demo) {
      if (!ok) { aviso("Ese no era: 2 + 3 = 5. ¡Inténtalo otra vez!", "mal", 1800); S.tramo = null; S.fase = "correr"; S.vel = 190; setTimeout(function () { if (S && S.demo) { S.demo.k = 4; siguienteDemo(); } }, 900); return; }
      parts.estallido(PX, PISO - 40, "#7de74e", 30, 5); demoEvento("tubo"); S.tramo = null; S.fase = "correr"; return;
    }
    if (!ok) return fallo();
    S.racha++; S.mejorRacha = Math.max(S.mejorRacha, S.racha); S.aciertos++;
    if (S.racha > 1 && S.racha % 3 === 0) { parts.texto(PX + 60, PISO - 150, "¡Racha ×" + mult() + "!", "#ff6a00", 34); sonar("chimes", .5); }
    sonar("party_short", .5); confeti(PX, PISO - 40, 36); flash("bien");
    var bono = S.jefe ? 0 : Math.round(S.zonaRest || 0) * 2;
    sumar(200 + bono, PX, PISO - 110);
    if (S.jefe) return siguienteJefe();
    if (S.racha % 4 === 0 && S.vidas < 3) { S.vidas++; aviso("¡Vida extra por tu racha!", "bien", 1400); }
    S.tramo = null; S.vel = S.velAnt || S.vel;
    llenarTabla(S.paso);
    solucion(true, bono);
  }
  function fallo() {
    S.errores++; S.racha = 0;
    var p = S.jefe ? S.preguntas[S.jefe - 1] : S.paso, okTxt = S.jefe ? p.ok : p.okTxt;
    lava("Tubo equivocado. La respuesta era «" + plano(okTxt) + "»");
  }
  function lava(motivo) {
    if (S.muerto) return;
    if (S.demo) {
      S.tramo = null; S.fase = "correr"; S.y = S.prev.y = PISO; S.vy = 0; S.suelo = true; S.vel = 190;
      aviso("¡Cuidado con la lava! Párate sobre un tubo y presiona ↓", "mal", 1800); S.demo.k = 4; siguienteDemo(); return;
    }
    S.muerto = 1; S.vidas--; S.racha = 0;
    parts.estallido(PX, PISO, "#ff6b3d", 50, 7); parts.estallido(PX, PISO, "#ffd45c", 30, 5); sonar("boom", .55); flash("mal");
    aviso(motivo + (S.vidas > 0 ? " · Te quedan " + S.vidas + " vidas" : ""), "mal", 2600);
    pintar();
    setTimeout(function () {
      if (!S) return;
      S.muerto = 0; S.y = PISO; S.vy = 0; S.suelo = true; S.prev.y = PISO;
      if (S.vidas <= 0) return fin(false);
      if (S.jefe) { S.fase = "calcular"; preguntaJefe(); return; }
      S.vel = S.velAnt || S.vel; if (S.tramo) { S.dist = S.tramo.ini - 620; S.prev.dist = S.dist; } S.tramo = null; zonaCalculo();
    }, 2200);
  }
  function iniciarJefe() {
    S.jefe = 1; S.fase = "jefeEntra"; S.preguntas = S.N.jefe; S.jefeX = W + 200;
    raiz.querySelector("#rT").classList.add("oculta");
    aviso("¡Llega el Dr. Período! · la tabla se ocultó: responde de memoria", "mal", 2600);
    sonar("boom", .5); pintar(); pintarPasos();
    setTimeout(function () { if (S) preguntaJefe(); }, 2400);
  }
  function preguntaJefe() {
    var q = S.preguntas[S.jefe - 1], izq = azar() < 0.5;
    S.ops = izq ? [q.ok, q.mal] : [q.mal, q.ok]; S.correcta = izq ? 0 : 1;
    S.fase = "calcular"; S.zonaT = 999; S.paso = { tipo: "opcion", t: "Jefe" };
    mostrarPregunta("Jefe final · pregunta " + S.jefe + " de " + S.preguntas.length, "<div class='frase-run'>" + M(q.q) + "</div>" + opsHtml(),
      "<button class='btn verde' id='rListo'>Ir a los tubos <kbd>Enter</kbd></button>");
    raiz.querySelector("#rListo").onclick = tubos;
  }
  function siguienteJefe() {
    S.jefeGolpe = 1;
    if (S.jefe < S.preguntas.length) { S.jefe++; S.fase = "calcular"; aviso("¡Golpe al Dr. Período!", "bien", 1200); setTimeout(function () { if (S) preguntaJefe(); }, 1200); return; }
    S.fase = "salida"; S.jefeVencido = 1; aviso("¡Venciste al Dr. Período! Entra al tubo dorado", "bien", 2200);
    var x0 = S.dist + 520; S.tramo = { ini: x0, dorado: [x0, x0 + 200], fin: x0 + 200 };
    S.vel = 200;
  }
  /* ---------- Fin de mundo ---------- */
  function fin(gano) {
    S.fase = "fin"; raiz.querySelector("#rT").classList.remove("oculta"); pintar();
    raiz.querySelector("#rQ").style.display = "none";
    var N = S.N, fallas = S.errores + S.golpes, est = gano ? (fallas === 0 ? 3 : fallas <= 2 ? 2 : 1) : 0;
    if (gano) { sumar(150 * S.vidas); if (fallas === 0) S.puntos += 500; }
    var reg = gano ? L.registrar(N.id, S.puntos, est) : null;
    var p = prog(); p.aciertos += S.aciertos; p.errores += S.errores; p.monedas += S.monedas; p.partidas++; p.mejorRacha = Math.max(p.mejorRacha || 0, S.mejorRacha); p.guardar();
    var precision = S.aciertos + S.errores ? Math.round(S.aciertos / (S.aciertos + S.errores) * 100) : 0, seg = Math.round((Date.now() - S.inicio) / 1000);
    var sig = S.i + 1 < NV.length ? S.i + 1 : null, yo = S.i;
    if (gano) sonar("party", .6);
    A.resultado({
      titulo: gano ? "¡Mundo " + N.num + " superado!" : "Se acabaron las vidas", estrellas: est, puntos: gano ? S.puntos : undefined, record: reg && reg.record,
      stats: [["Aciertos", S.aciertos + " de " + (S.aciertos + S.errores)], ["Precisión", precision + " %"], ["Mejor racha", S.mejorRacha], ["Monedas (+" + SEG_MONEDA + " s c/u)", S.monedas + "/" + S.monedasTot], ["Tiempo", Math.floor(seg / 60) + ":" + ("0" + seg % 60).slice(-2)]]
        .concat(reg ? [["Liga", "Lugar " + reg.despues + " de " + reg.de]] : []),
      aprende: "<b>" + N.nombre + ":</b> " + M(N.resumen),
      botones: (gano && sig !== null ? [{ txt: "Siguiente mundo →", clase: "verde", fn: function () { transicion(sig); } }] : [])
        .concat([{ txt: gano ? "Repetir" : "Reintentar", clase: "azul", fn: function () { jugar(yo, false); } }, { txt: "Mundos", clase: "blanco", fn: mundos }, { txt: "Inicio", clase: "blanco", fn: inicio }])
    });
  }
  function transicion(i) { iris(false); setTimeout(function () { S = null; abrirNivel(i); }, 650); }
  function iris(abrir) { var r = raiz.querySelector("#rIris"); if (!r) return; r.className = "iris-run " + (abrir ? "abre" : "cierra"); }
  function flash(tipo) { var f = raiz.querySelector("#rFlash"); if (!f) return; f.className = "flash-run"; void f.offsetWidth; f.className = "flash-run " + tipo; }
  function aviso(txt, tipo, ms) { var a = raiz.querySelector("#rA"); if (!a) return; a.className = "aviso-run visible " + (tipo || ""); a.innerHTML = txt; clearTimeout(a._t); a._t = setTimeout(function () { a.classList.remove("visible"); }, ms || 1800); }
  function confeti(x, y, n) { var cols = ["#ffcc4d", "#7de74e", "#3d9be0", "#f73c50", "#ff8a2a"]; for (var k = 0; k < 5; k++) parts.estallido(x, y, cols[k], Math.ceil(n / 5), 6); }

  /* ---------- Pausa ---------- */
  function pausar(on) {
    if (!S || S.fase === "fin") return false;
    if (on) { if (S.pausa) return false; S.pausa = true; return true; }
    S.pausa = false; ultimo = performance.now(); acum = 0; return true;
  }
  function menuPausa() {
    if (!S || S.fase === "fin" || document.querySelector(".modal-fondo")) return;
    pausar(true);
    var m = modal("<h2>Pausa</h2><div class='pausa-btns'><button class='btn verde' data-a='seguir'>Continuar</button><button class='btn blanco' data-a='enun'>Ver enunciado</button><button class='btn blanco' data-a='form'>Formulario</button><button class='btn azul' data-a='rep'>Reiniciar mundo</button><button class='btn rojo' data-a='salir'>Salir al inicio</button></div>", "pausa-modal", function () { pausar(false); });
    m.querySelectorAll("[data-a]").forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute("data-a"); m.remove();
        if (a === "seguir") pausar(false);
        else if (a === "enun") { S.pausa = false; enunciado(); }
        else if (a === "form") { S.pausa = false; formulario(); }
        else if (a === "rep") jugar(S.i, false);
        else { S = null; inicio(); }
      };
    });
  }

  /* =========================================================
     FÍSICA (paso fijo de 1/120 s con interpolación al dibujar)
     ========================================================= */
  /* Reloj de la zona de cálculo: también corre cuando hay una consulta abierta (formulario, tablas, enunciado). */
  function relojZona(dt) {
    if (S.jefe || S.demo) return;
    S.zonaT -= dt;
    var seg = Math.max(0, Math.ceil(S.zonaT)), z = raiz.querySelector("#rZ"), zm = document.querySelector("#rZm"), b = raiz.querySelector("#rZb");
    if (z && seg !== +z.textContent) { z.textContent = seg; if (seg <= 5) z.parentNode.classList.add("urge"); }
    if (zm && seg !== +zm.textContent) zm.textContent = seg;
    if (b) b.style.width = Math.max(0, S.zonaT / S.tiempoIni * 100).toFixed(1) + "%";
    if (S.zonaT <= 0) { var m = document.querySelector(".modal-caja.con-reloj"); if (m) m.parentNode.remove(); tiempoFuera(); }
  }
  function brincar() {
    if (!S || S.fase === "fin" || S.muerto || S.pausa || !S.listo || S.fase === "calcular" || S.fase === "solucion" || S.entrando) return;
    if (S.suelo) { S.vy = SALTO; S.suelo = false; S.aplasta = -0.25; sonar("pop", .2); parts.estallido(PX, PISO, "rgba(255,255,255,.85)", 6, 2); demoEvento("brinca"); }
  }
  function haySuelo(pos) {
    if (!S.tramo) return true; var t = S.tramo;
    if (S.fase === "salida") return true;
    if (S.fase !== "tubos") return true;
    return pos < t.t1[0] || (pos >= t.t1[0] && pos <= t.t1[1]) || (pos >= t.t2[0] && pos <= t.t2[1]);
  }
  function chocaCirculo(cx, cy, r) {
    var alto = S.agachado && S.suelo ? ALTO_AGACHADO : ALTO_DE_PIE, x0 = PX - 15, x1 = PX + 15, y0 = S.y - alto, y1 = S.y;
    var nx = Math.max(x0, Math.min(cx, x1)), ny = Math.max(y0, Math.min(cy, y1));
    return (cx - nx) * (cx - nx) + (cy - ny) * (cy - ny) < r * r * 0.8;
  }
  function paso(dt) {
    S.prev.dist = S.dist; S.prev.y = S.y;
    S.t += dt; if (S.inv > 0) S.inv -= dt; S.aplasta *= 0.9;
    S.agachado = !!teclas.abajo && S.suelo && S.fase !== "calcular" && S.fase !== "solucion";
    if (S.agachado) demoEvento("agacha");
    ambiente(dt);
    if (S.entrando) { S.entrando = Math.min(1, S.entrando + dt * 1.8); return; }
    if (S.fase === "calcular" || S.fase === "jefeEntra" || S.fase === "solucion") { S.dist += 40 * dt; if (S.fase === "calcular") relojZona(dt); return; }
    if (S.muerto) return;
    S.dist += S.vel * dt; S.vy += G * dt; S.y += S.vy * dt;
    var pos = S.dist + PX;
    if (S.y >= PISO) {
      if (haySuelo(pos)) { if (!S.suelo) { S.aplasta = 0.3; parts.estallido(PX, PISO, "rgba(255,255,255,.8)", 6, 2); } S.y = PISO; S.vy = 0; S.suelo = true; }
      else if (S.y > PISO + 40) return lava(S.fase === "tubos" ? "No entraste a ningún tubo" : "Caíste");
    }
    if (S.suelo && !S.agachado && Math.floor(S.t * 10) !== Math.floor((S.t - dt) * 10)) parts.estallido(PX - 18, PISO - 2, "rgba(255,255,255,.55)", 1, 1);
    if (S.fase === "tubos" && pos > S.tramo.fin) return lava("No entraste a ningún tubo");
    if (S.fase === "salida" && pos >= S.tramo.dorado[0] + 80 && !S.saliendo) { S.saliendo = 1; S.entrando = 0.0001; sonar("squeak_down", .5); setTimeout(function () { if (S) { S.entrando = 0; fin(true); } }, 900); }
    S.objs.forEach(function (o) {
      if (o.hecho) return;
      var ox = o.x - S.dist;
      if (ox < -100) { if (S.demo && o === S.demo.obj) { o.hecho = true; demoEvento(o.tipo === "moneda" ? "nada" : "pasa"); if (o.tipo === "moneda" && !S.demo.listo) { S.demo.k--; siguienteDemo(); } } return; }
      if (ox > W + 60) return;
      if (o.tipo === "virus" || o.tipo === "bajo" || o.tipo === "alto") {
        var oy = o.tipo === "bajo" ? PISO - 66 : (o.tipo === "alto" ? PISO - 118 : PISO - o.r);
        if (chocaCirculo(ox, oy, o.r + 2) && S.inv <= 0) {
          o.hecho = true; parts.estallido(ox, oy, "#f73c50", 24, 4); sonar("bonk", .5); flash("mal");
          if (S.demo) { aviso("¡Te tocó! Inténtalo otra vez", "mal", 1200); S.inv = 1; var D = S.demo; setTimeout(function () { if (S && S.demo === D) { D.k--; siguienteDemo(); } }, 700); return; }
          S.vidas--; S.golpes++; S.inv = 1.6; S.racha = 0;
          aviso(o.tipo === "bajo" ? "¡Un virus volador! Agáchate con ↓" : "¡Un virus te tocó!", "mal", 1200); pintar();
          if (S.vidas <= 0) fin(false);
        }
      } else if (Math.abs(ox - PX) < 34 && Math.abs(o.y - (S.y - 26)) < 46) {
        o.hecho = true;
        if (o.tipo === "moneda") {
          if (S.demo) { demoEvento("moneda"); parts.estallido(ox, o.y, "#ffcc00", 18, 3); sonar("chimes", .35); return; }
          S.extra += SEG_MONEDA; S.monedas++; parts.estallido(ox, o.y, "#ffcc00", 18, 3); parts.texto(ox, o.y - 40, "+" + SEG_MONEDA + " s", "#3f2631", 24); sonar("chimes", .35); sumar(25);
        } else { S.puntos += 10; parts.estallido(ox, o.y, "#ffe08a", 8, 2); sonar("pop", .2); pintar(); }
      }
    });
    if (S.fase === "correr" && !S.demo && S.dist > S.largo) zonaCalculo();
  }

  /* ---------- Partículas de ambiente por mundo ---------- */
  function ambiente(dt) {
    var T = V.T, a = V.amb; if (!T.amb) return;
    if (a.length < 40 && azar() < dt * 22) {
      var t = T.amb, p = { x: azar() * W, y: -10, vx: 0, vy: 0, r: 2 + azar() * 3, t: 0, k: t, f: azar() * 6 };
      if (t === "lluvia") { p.vy = 700; p.vx = -120; p.r = 1; }
      else if (t === "nieve") { p.vy = 40 + azar() * 40; p.vx = -20; }
      else if (t === "hojas" || t === "petalos") { p.vy = 50 + azar() * 30; p.vx = -60; }
      else if (t === "burbujas") { p.y = PISO; p.vy = -40 - azar() * 30; }
      else if (t === "luciernagas" || t === "chispas" || t === "polen" || t === "polvo") { p.y = 40 + azar() * (PISO - 60); p.vx = -30 - azar() * 30; p.vy = 0; p.x = W + 10; }
      a.push(p);
    }
    for (var i = a.length - 1; i >= 0; i--) {
      var q = a[i]; q.t += dt; q.f += dt * 3;
      q.x += (q.vx + Math.sin(q.f) * (q.k === "lluvia" ? 0 : 20)) * dt; q.y += (q.vy + (q.k === "luciernagas" ? Math.cos(q.f) * 20 : 0)) * dt;
      if (q.y > H || q.y < -20 || q.x < -20 || q.t > 14) a.splice(i, 1);
    }
  }

  /* =========================================================
     ARTE (todo en coordenadas del mundo; el lienzo es 2× para nitidez)
     ========================================================= */
  function fondo(cam) {
    var T = V.T, c = ctx, jefe = V.jefe && !V.jefeVencido, b;
    var g = c.createLinearGradient(0, 0, 0, PISO);
    g.addColorStop(0, jefe ? "#3a1838" : T.cielo[0]); g.addColorStop(1, jefe ? "#8a3a52" : T.cielo[1]);
    c.fillStyle = g; c.fillRect(0, 0, W, PISO + 4);
    if (T.estrellas || jefe) { c.fillStyle = "#fff"; for (b = 0; b < 40; b++) { var tw = 0.5 + 0.5 * Math.sin(V.t * 2 + b); c.globalAlpha = 0.4 + 0.6 * tw; c.fillRect(Math.floor(hsh(b) * W), Math.floor(hsh(b + 50) * 200), 2, 2); } c.globalAlpha = 1; }
    if (T.aurora) { for (b = 0; b < 3; b++) { c.fillStyle = ["rgba(90,255,190,.16)", "rgba(120,180,255,.14)", "rgba(200,120,255,.12)"][b]; c.beginPath(); c.moveTo(0, 60 + b * 20); for (var ax = 0; ax <= W; ax += 40) c.lineTo(ax, 60 + b * 22 + Math.sin(ax / 120 + V.t * 0.6 + b) * 26); c.lineTo(W, 160 + b * 20); c.lineTo(0, 160 + b * 20); c.fill(); } }
    var sx = 820, sy = 74; c.fillStyle = T.sol; c.globalAlpha = 0.25; c.beginPath(); c.arc(sx, sy, 46 + Math.sin(V.t * 1.5) * 3, 0, 6.29); c.fill(); c.globalAlpha = 1;
    c.fillRect(sx - 24, sy - 16, 48, 32); c.fillRect(sx - 16, sy - 24, 32, 48); c.fillRect(sx - 20, sy - 20, 40, 40);
    for (b = 0; b < 5; b++) nubePix(c, ((b * 300 - cam * 0.08 - V.t * 6) % 1500 + 1500) % 1500 - 200, 40 + (b % 3) * 34, 2);
    var K = capas(V.ti);
    if (K) [K.lejos, K.cerca].forEach(function (k, j) {
      var off = cam * k.vel, x0 = -(off % PERIODO), suelo = j === 0 ? PISO - 26 : PISO;
      for (var v = 0; v < 2; v++) { var x = Math.round((x0 + v * PERIODO) * 2) / 2; if (x < W && x + PERIODO > 0) c.drawImage(k.cv, x, suelo - k.alto, PERIODO, k.alto); }
    });
  }
  function calle(c, x0, x1, y, s, desp) {
    var t = 16 * s;
    for (var x = x0 - ((desp % t) + t) % t; x < x1; x += t) { var xr = Math.round(x * 2) / 2; tile(c, 88, xr, y, s); tile(c, 63, xr, y + t, s); tile(c, 75, xr, y + 2 * t, s); }
  }
  function suelo(cam) {
    var t = V.tramo, enTubos = t && V.fase === "tubos", fin = enTubos ? t.t1[0] - cam : W, c = ctx;
    fin = Math.max(0, Math.min(W, fin));
    if (fin > 0) {
      c.save(); c.beginPath(); c.rect(0, 0, fin, H); c.clip();
      calle(c, 0, fin + 32, PISO, 2, cam);
      c.fillStyle = "#52607c"; c.fillRect(0, PISO + 96, fin, H - PISO - 96);
      for (var f = 300 - ((cam % 420) + 420) % 420; f < fin + 40; f += 420) farol(c, Math.round(f * 2) / 2, PISO + 8, 2);
      c.restore();
      if (fin < W) { c.fillStyle = TINTA; c.fillRect(fin - 4, PISO, 4, H - PISO); }
    }
    if (fin < W) {
      c.fillStyle = "#c34b35"; c.fillRect(fin, PISO + 20, W - fin, H - PISO);
      for (var lx = Math.floor(fin / 8) * 8; lx < W; lx += 8) {
        var o = Math.sin((lx + cam) / 30 + V.t * 4) * 3;
        c.fillStyle = "#eaa56c"; c.fillRect(lx, PISO + 22 + o, 8, 26);
        c.fillStyle = "#ffcc4d"; c.fillRect(lx, PISO + 20 + o, 8, 4);
      }
      for (var b = 0; b < 6; b++) { var ph = (V.t * 30 + b * 13) % 50, bx = fin + ((b * 157 + V.t * 40) % Math.max(1, W - fin)); if (ph < 40) { c.fillStyle = b % 2 ? "#ffcc4d" : "#fff3b0"; c.fillRect(bx, PISO + 70 - ph, 6, 6); } }
    }
  }
  function tubo(x, w, dorado) {
    var c = ctx, xb = x + 14, wb = w - 28, c1 = dorado ? "#ffcc4d" : "#84c669", c2 = dorado ? "#c98a1c" : "#587b43", c3 = dorado ? "#fff3b0" : "#c8e9a8";
    c.fillStyle = TINTA; c.fillRect(xb - 4, PISO + 10, wb + 8, H - PISO);
    c.fillStyle = c1; c.fillRect(xb, PISO + 14, wb, H - PISO);
    c.fillStyle = c2; c.fillRect(xb + wb - 30, PISO + 14, 30, H - PISO);
    c.fillStyle = c3; c.fillRect(xb + 14, PISO + 22, 10, H - PISO);
    c.fillStyle = TINTA; c.fillRect(x - 4, PISO - 10, w + 8, 34);
    c.fillStyle = c1; c.fillRect(x, PISO - 6, w, 26);
    c.fillStyle = c2; c.fillRect(x + w - 34, PISO - 6, 34, 26);
    c.fillStyle = c3; c.fillRect(x + 10, PISO - 2, 14, 8);
    if (!dorado) { c.fillStyle = "#97695a"; c.fillRect(x + w / 2 - 4, PISO - 64, 8, 58); }
    else { c.globalAlpha = 0.5 + 0.3 * Math.sin(V.t * 6); c.fillStyle = "#fff3b0"; c.beginPath(); c.ellipse(x + w / 2, PISO - 8, w / 2, 14, 0, 0, 6.29); c.fill(); c.globalAlpha = 1; }
  }
  function letrero(x, w, etiqueta, letra) {
    var c = ctx, cx = x + w / 2, bob = Math.sin(V.t * 3 + x * 0.01) * 3, txt = String(etiqueta);
    c.font = "bold 17px Consolas, monospace";
    var tw = Math.max(120, Math.min(330, c.measureText(txt).width + 64));
    c.save(); c.translate(cx, PISO - 96 + bob);
    c.fillStyle = "rgba(63,38,49,.35)"; c.fillRect(-tw / 2 + 4, -14, tw, 44);
    c.fillStyle = TINTA; c.fillRect(-tw / 2 - 3, -21, tw + 6, 46);
    c.fillStyle = "#f3e9e4"; c.fillRect(-tw / 2, -18, tw, 40);
    c.fillStyle = TINTA; c.fillRect(-tw / 2 + 6, -12, 28, 28);
    c.fillStyle = "#ffcc4d"; c.font = "bold 20px Pixel, Segoe UI, sans-serif"; c.textAlign = "center"; c.fillText(letra, -tw / 2 + 20, 9);
    c.fillStyle = TINTA; c.font = "bold 17px Consolas, monospace"; c.textAlign = "center"; c.fillText(txt, 17, 8);
    c.fillStyle = "#c34b35"; c.fillRect(-8, 26, 16, 4); c.fillRect(-4, 30, 8, 4);
    c.restore();
  }
  function virus(x, y, r, vol, fase) {
    var c = ctx; c.save(); c.translate(x, y);
    if (!vol) { c.fillStyle = "rgba(0,0,0,.15)"; c.beginPath(); c.ellipse(0, r + 2, r, 5, 0, 0, 6.28); c.fill(); }
    if (vol) { var ala = Math.sin(V.t * 18 + fase) * 0.5; c.fillStyle = "rgba(255,255,255,.85)"; c.strokeStyle = "#7a2a4a"; c.lineWidth = 2; [-1, 1].forEach(function (s) { c.save(); c.rotate(s * (0.6 + ala)); c.beginPath(); c.ellipse(s * r * 0.9, -r * 0.6, r * 0.7, r * 0.35, 0, 0, 6.28); c.fill(); c.stroke(); c.restore(); }); }
    c.rotate(Math.sin(V.t * 2 + fase) * 0.15);
    c.strokeStyle = "#8d1630"; c.lineWidth = 3.5; c.fillStyle = "#c81d34";
    for (var k = 0; k < 9; k++) { var a = k * 0.698 + V.t * 0.6; c.beginPath(); c.moveTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8); c.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3); c.stroke(); c.beginPath(); c.arc(Math.cos(a) * r * 1.35, Math.sin(a) * r * 1.35, r * 0.14, 0, 6.28); c.fill(); }
    var g = c.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
    g.addColorStop(0, "#ff8a9a"); g.addColorStop(0.6, "#f0384f"); g.addColorStop(1, "#b5162d");
    c.fillStyle = g; c.strokeStyle = "#5a0e1c"; c.lineWidth = 2.5; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill(); c.stroke();
    c.fillStyle = "#fff"; c.beginPath(); c.ellipse(-r * 0.32, -r * 0.05, r * 0.2, r * 0.24, 0, 0, 6.28); c.ellipse(r * 0.32, -r * 0.05, r * 0.2, r * 0.24, 0, 0, 6.28); c.fill();
    c.fillStyle = "#2b2b2b"; c.beginPath(); c.arc(-r * 0.28, 0, r * 0.1, 0, 6.28); c.arc(r * 0.28, 0, r * 0.1, 0, 6.28); c.fill();
    c.strokeStyle = "#2b2b2b"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-r * 0.55, -r * 0.42); c.lineTo(-r * 0.12, -r * 0.25); c.moveTo(r * 0.55, -r * 0.42); c.lineTo(r * 0.12, -r * 0.25); c.stroke();
    c.beginPath(); c.arc(0, r * 0.5, r * 0.2, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    c.restore();
  }
  function moneda(x, y, txt) {
    var c = ctx, giro = Math.cos(V.t * 3 + x * 0.01), bob = Math.sin(V.t * 4 + x * 0.02) * 4;
    c.save(); c.translate(x, y + bob);
    var halo = c.createRadialGradient(0, 0, 10, 0, 0, 52); halo.addColorStop(0, "rgba(255,220,90,.5)"); halo.addColorStop(1, "rgba(255,220,90,0)");
    c.fillStyle = halo; c.beginPath(); c.arc(0, 0, 52, 0, 6.28); c.fill();
    c.save(); c.scale(0.8 + 0.2 * Math.abs(giro), 1);
    var g = c.createRadialGradient(-10, -10, 4, 0, 0, 34); g.addColorStop(0, "#fff3b0"); g.addColorStop(0.5, "#ffcc00"); g.addColorStop(1, "#c98f00");
    c.fillStyle = g; c.strokeStyle = "#8a6400"; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 33, 0, 6.28); c.fill(); c.stroke();
    c.strokeStyle = "rgba(138,100,0,.5)"; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, 27, 0, 6.28); c.stroke();
    c.fillStyle = "rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(-12, -15, 8, 4, -0.6, 0, 6.28); c.fill();
    c.restore();
    var dest = (Math.sin(V.t * 5 + x) + 1) / 2; c.fillStyle = "rgba(255,255,255," + (0.6 * dest) + ")"; c.fillRect(18, -26, 3, 9); c.fillRect(15, -23, 9, 3);
    c.fillStyle = TINTA; c.font = "bold 13px Consolas, monospace"; c.textAlign = "center";
    var w = c.measureText(txt).width; if (w > 58) { c.font = "bold " + Math.max(8, Math.floor(13 * 58 / w)) + "px Consolas, monospace"; }
    c.fillText(txt, 0, 5);
    c.restore();
  }
  function semilla(x, y) {
    var c = ctx, bob = Math.sin(V.t * 5 + x * 0.02) * 3; c.save(); c.translate(x, y + bob);
    var g = c.createRadialGradient(-3, -4, 1, 0, 0, 12); g.addColorStop(0, "#ffe9a8"); g.addColorStop(1, "#d99a3a");
    c.fillStyle = g; c.strokeStyle = "#8a5a1a"; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 9, 12, 0.3, 0, 6.28); c.fill(); c.stroke();
    c.restore();
  }
  function semillin(x, y, entrar) {
    var c = ctx, sq = V.aplasta, r = 26, ag = V.agachado;
    var sombra = Math.max(0.4, 1 - (PISO - y) / 220);
    c.fillStyle = "rgba(0,0,0,.18)"; c.beginPath(); c.ellipse(x, PISO + 4, 24 * sombra, 6 * sombra, 0, 0, 6.28); c.fill();
    c.save();
    if (entrar) { c.beginPath(); c.rect(x - 80, 0, 160, PISO - 6); c.clip(); y += entrar * 70; }
    var sx = ag ? 1.28 : 1 + sq * 0.35, sy = ag ? 0.6 : 1 - sq * 0.35;
    c.translate(x, y - r * sy); c.scale(sx, sy);
    if (!V.suelo) c.rotate(Math.max(-0.25, Math.min(0.25, V.vy / 3000)));
    c.fillStyle = "#3a2a1a";
    if (V.suelo && V.fase !== "calcular" && V.fase !== "solucion") { var p = Math.sin(V.t * 22) * 7; c.beginPath(); c.ellipse(-9 + p, r - 2, 7, 5, 0, 0, 6.28); c.ellipse(9 - p, r - 2, 7, 5, 0, 0, 6.28); c.fill(); }
    else { c.beginPath(); c.ellipse(-9, r - 4, 7, 5, -0.4, 0, 6.28); c.ellipse(9, r - 4, 7, 5, 0.4, 0, 6.28); c.fill(); }
    c.strokeStyle = "#2f7a2a"; c.lineWidth = 4; c.lineCap = "round"; c.beginPath(); c.moveTo(0, -r + 2); c.quadraticCurveTo(2, -r - 10, 0, -r - 16); c.stroke();
    var hoja = Math.sin(V.t * 6) * 0.15;
    [[-1, -0.5], [1, 0.5]].forEach(function (h) { c.save(); c.translate(0, -r - 14); c.rotate(h[1] + hoja * h[0]); var gh = c.createLinearGradient(0, 0, h[0] * 22, 0); gh.addColorStop(0, "#5ed36a"); gh.addColorStop(1, "#2f8f3a"); c.fillStyle = gh; c.strokeStyle = "#1d5a1f"; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(h[0] * 12, -12, h[0] * 22, -2); c.quadraticCurveTo(h[0] * 12, 6, 0, 0); c.fill(); c.stroke(); c.restore(); });
    var g = c.createRadialGradient(-9, -10, 4, 0, 0, r + 4); g.addColorStop(0, "#fff3a6"); g.addColorStop(0.55, "#ffd23f"); g.addColorStop(1, "#e3a400");
    c.fillStyle = g; c.strokeStyle = "#7a5200"; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill(); c.stroke();
    var parp = (V.t % 3.2) < 0.12 || ag;
    c.fillStyle = "#fff"; c.beginPath(); c.ellipse(-8, -3, 6.5, parp ? 1.8 : 8, 0, 0, 6.28); c.ellipse(10, -3, 6.5, parp ? 1.8 : 8, 0, 0, 6.28); c.fill();
    if (!parp) { c.fillStyle = "#2b2b2b"; c.beginPath(); c.arc(-6, -2, 3.6, 0, 6.28); c.arc(12, -2, 3.6, 0, 6.28); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(-5, -4, 1.3, 0, 6.28); c.arc(13, -4, 1.3, 0, 6.28); c.fill(); }
    c.fillStyle = "rgba(247,60,80,.35)"; c.beginPath(); c.ellipse(-15, 8, 5, 3, 0, 0, 6.28); c.ellipse(18, 8, 5, 3, 0, 0, 6.28); c.fill();
    c.strokeStyle = "#5a3a00"; c.lineWidth = 2.5; c.beginPath(); if (V.suelo) c.arc(2, 8, 6, 0.15 * Math.PI, 0.85 * Math.PI); else c.ellipse(2, 11, 4, 5, 0, 0, 6.28); c.stroke();
    c.fillStyle = "rgba(255,255,255,.45)"; c.beginPath(); c.ellipse(-12, -15, 7, 4, -0.5, 0, 6.28); c.fill();
    c.restore();
  }
  function jefe(x, y) {
    var c = ctx, r = 64; y += Math.sin(V.t * 2) * 10;
    if (V.jefeGolpe > 0) { x += Math.sin(V.t * 60) * 6 * V.jefeGolpe; }
    c.save(); c.translate(x, y);
    var g = c.createRadialGradient(-20, -20, 8, 0, 0, r); g.addColorStop(0, "#f7b8cf"); g.addColorStop(0.6, "#d9608a"); g.addColorStop(1, "#8c2a50");
    c.fillStyle = g; c.strokeStyle = "#3d0f22"; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill(); c.stroke();
    c.fillStyle = "#1c1c24"; c.fillRect(-46, -r - 4, 92, 10); c.fillRect(-30, -r - 64, 60, 62); c.fillStyle = "#f73c50"; c.fillRect(-30, -r - 18, 60, 10);
    c.fillStyle = "#fff"; c.beginPath(); c.ellipse(-20, -6, 11, 13, 0, 0, 6.28); c.ellipse(22, -6, 11, 13, 0, 0, 6.28); c.fill();
    c.fillStyle = "#2b2b2b"; c.beginPath(); c.arc(-24, -4, 5, 0, 6.28); c.arc(18, -4, 5, 0, 6.28); c.fill();
    c.strokeStyle = "#ffcc00"; c.lineWidth = 3; c.beginPath(); c.arc(22, -6, 15, 0, 6.28); c.stroke(); c.beginPath(); c.moveTo(36, 2); c.lineTo(44, 40); c.stroke();
    c.strokeStyle = "#2b2b2b"; c.lineWidth = 4; c.beginPath(); c.moveTo(-36, -24); c.lineTo(-8, -18); c.moveTo(36, -24); c.lineTo(8, -18); c.stroke();
    c.fillStyle = "#2b2b2b"; c.beginPath(); c.moveTo(0, 18); c.bezierCurveTo(-20, 12, -36, 26, -40, 18); c.bezierCurveTo(-30, 34, -10, 30, 0, 24); c.bezierCurveTo(10, 30, 30, 34, 40, 18); c.bezierCurveTo(36, 26, 20, 12, 0, 18); c.fill();
    c.restore();
    c.fillStyle = TINTA; c.fillRect(x - 62, y + 78, 124, 30); c.fillStyle = "#f3e9e4"; c.fillRect(x - 59, y + 81, 118, 24);
    c.fillStyle = TINTA; c.font = "bold 18px Pixel, Segoe UI, sans-serif"; c.textAlign = "center"; c.fillText("Dr. Período", x, y + 99);
    var vida = 1 - (V.jefe - 1 + (V.jefeVencido ? 1 : 0)) / V.preguntas.length;
    c.fillStyle = TINTA; c.fillRect(x - 62, y - 150, 124, 14); c.fillStyle = "#3a1838"; c.fillRect(x - 60, y - 148, 120, 10); c.fillStyle = "#f73c50"; c.fillRect(x - 60, y - 148, 120 * vida, 10);
  }
  function dibujarAmbiente() {
    var c = ctx; V.amb.forEach(function (q) {
      var k = q.k;
      if (k === "lluvia") { c.strokeStyle = "rgba(220,235,255,.6)"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x - 5, q.y + 16); c.stroke(); }
      else if (k === "nieve") { c.fillStyle = "rgba(255,255,255,.9)"; c.beginPath(); c.arc(q.x, q.y, q.r, 0, 6.29); c.fill(); }
      else if (k === "hojas") { c.save(); c.translate(q.x, q.y); c.rotate(q.f); c.fillStyle = V.ti === 9 ? "#e0702a" : "#5aa83a"; c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, 6.29); c.fill(); c.restore(); }
      else if (k === "petalos") { c.save(); c.translate(q.x, q.y); c.rotate(q.f); c.fillStyle = "#ffc2d6"; c.beginPath(); c.ellipse(0, 0, 5, 3, 0, 0, 6.29); c.fill(); c.restore(); }
      else if (k === "burbujas") { c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 1.5; c.beginPath(); c.arc(q.x, q.y, q.r + 2, 0, 6.29); c.stroke(); }
      else { var al = 0.4 + 0.6 * Math.abs(Math.sin(q.f * 2)); c.fillStyle = k === "luciernagas" ? "rgba(255,240,120," + al + ")" : k === "chispas" ? "rgba(255,200,255," + al + ")" : k === "polen" ? "rgba(255,250,200," + al * 0.8 + ")" : "rgba(255,255,255," + al * 0.4 + ")"; c.fillRect(q.x, q.y, q.r, q.r); }
    });
  }
  function dibujar(alfa) {
    var cam = V.prev.dist + (V.dist - V.prev.dist) * alfa, yy = V.prev.y + (V.y - V.prev.y) * alfa;
    ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.imageSmoothingEnabled = false;
    fondo(cam); suelo(cam);
    var t = V.tramo;
    if (t && V.fase === "tubos") { tubo(t.t1[0] - cam, 240); tubo(t.t2[0] - cam, 240); }
    if (t && V.fase === "salida") tubo(t.dorado[0] - cam, 200, true);
    V.objs.forEach(function (o) {
      if (o.hecho) return; var x = o.x - cam; if (x < -80 || x > W + 80) return;
      if (o.tipo === "virus") virus(x, PISO - o.r, o.r, false, o.fase);
      else if (o.tipo === "bajo") virus(x, PISO - 66 + Math.sin(V.t * 5 + o.fase) * 4, o.r, true, o.fase);
      else if (o.tipo === "alto") virus(x, PISO - 118 + Math.sin(V.t * 5 + o.fase) * 6, o.r, true, o.fase);
      else if (o.tipo === "moneda") moneda(x, o.y, "+" + SEG_MONEDA + "s");
      else semilla(x, o.y);
    });
    if (!(V.inv > 0 && Math.floor(V.t * 12) % 2) && !V.muerto) semillin(PX, yy, V.entrando);
    if (V.jefe && !V.jefeVencido) { jefe(W - 160, PISO - 130); if (V.jefeGolpe > 0) V.jefeGolpe = Math.max(0, V.jefeGolpe - 0.02); }
    dibujarAmbiente();
    ctx.imageSmoothingEnabled = true;
    if (t && V.fase === "tubos") { letrero(t.t1[0] - cam, 240, plano(V.ops[0]), "A"); letrero(t.t2[0] - cam, 240, plano(V.ops[1]), "B"); }
    if (V.fase === "correr" && !V.demo && V.largo) {
      var bw = W - 40, av = Math.max(8, bw * Math.min(1, cam / V.largo)), c = ctx;
      c.fillStyle = TINTA; c.fillRect(18, 12, bw + 4, 16); c.fillStyle = "#f3e9e4"; c.fillRect(20, 14, bw, 12);
      c.fillStyle = "#c34b35"; c.fillRect(20, 14, av, 12); c.fillStyle = "#eaa56c"; c.fillRect(20, 14, av, 4);
      c.font = "bold 16px Pixel, Segoe UI, sans-serif"; c.textAlign = "right"; c.fillStyle = "#fff"; c.fillText("zona de cálculo", W - 21, 47); c.fillStyle = TINTA; c.fillText("zona de cálculo", W - 22, 46);
    }
    if (V.pausa) { ctx.fillStyle = "rgba(30,20,40,.45)"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#fff"; ctx.font = "bold 48px Pixel, Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.fillText("PAUSA", W / 2, H / 2); }
    parts.dibujar(ctx);
  }

  /* =========================================================
     PANELES HTML (tamaños fijos: no mueven el lienzo)
     ========================================================= */
  function pintar() {
    if (!S) return;
    raiz.querySelector("#rCor").innerHTML = [0, 1, 2].map(function (i) { return IC.corazon(i < S.vidas); }).join("");
    raiz.querySelector("#rP").innerHTML = IC.estrella(true) + " " + miles(S.puntos);
    var rr = raiz.querySelector("#rRacha"), m = mult();
    rr.innerHTML = IC.fuego + " " + S.racha + (m > 1 ? " <span class='mult'>×" + m + "</span>" : "");
    rr.classList.toggle("activa", S.racha >= 3);
    var p = S.jefe ? null : S.paso, N = S.N;
    var bolsa = "<span class='chips-run'><span class='" + (S.extra ? "si" : "") + "'>" + IC.moneda + "+" + S.extra + " s</span></span>";
    raiz.querySelector("#rF").innerHTML = S.jefe ? "<span class='f-lbl'>Jefe final</span><span class='f-run'>Responde de memoria las preguntas del Dr. Período</span>" :
      !p ? "<span class='f-lbl'>Demo</span><span class='f-run'>Aprende los controles</span>" + bolsa :
      "<span class='f-lbl'>" + (S.demo ? "Demo" : "Paso " + (S.k + 1) + " de " + N.pasos.length) + "</span><span class='f-run'>" + (S.fase === "correr" ? "Siguiente: " : "") + (p.tipo === "num" ? "calcula " : "completa: ") + M(p.pide) + "</span>" + bolsa;
    /* Renglón pendiente: la celda que se pide aparece con «?» y las que todavía no se calculan, vacías. */
    var pend = null, celda = null;
    if (p && !S.jefe && !S.demo && (S.fase === "calcular" || S.fase === "tubos")) {
      if (p.filas.length === 1 && p.col !== undefined) { var ver = p.ver || [0]; pend = p.filas[0].map(function (v, c) { return c === p.col ? "?" : (ver.indexOf(c) >= 0 ? v : ""); }); }
      else if (p.pon && p.pon.length === 1) celda = p.pon[0];
    }
    S.pend = pend; S.celda = celda;
    raiz.querySelector("#rT").innerHTML = "<div class='t-cab'><div class='t-tit'>Tabla del apunte</div><button class='t-btn' id='rAmp' title='Ver la tabla en grande'>⤢ Ampliar</button></div>" + datosHtml(N) +
      "<div class='t-scroll'>" + tablaHtml(true) + "</div><div class='tapa-run'><b>Tabla oculta</b><span>Responde de memoria</span></div>";
    raiz.querySelector("#rAmp").onclick = function () { if (S.jefe) return; consulta("<h2>Tabla del apunte · " + N.nombre + "</h2>" + datosHtml(N) + "<div class='tabla-grande'>" + tablaHtml(false) + "</div>", "tabla-grande-modal"); };
    var sc = raiz.querySelector(".t-scroll"); if (sc) { var marca = sc.querySelector(".pide-celda"); if (marca && celda) sc.scrollTop = Math.max(0, marca.parentNode.offsetTop - 40); else sc.scrollTop = sc.scrollHeight; }
  }
  function tablaHtml(marcarNuevas) {
    var N = S.N, pend = S.pend, celda = S.celda;
    function td(v, marca) { return "<td" + (marca ? " class='pide-celda'" : "") + ">" + (marca ? "?" : M(v)) + "</td>"; }
    return "<table class='sol'><thead><tr>" + N.cols.map(function (c) { return "<th>" + M(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      S.filas.map(function (f, r) { var h = "<tr" + (f.nuevo && marcarNuevas ? " class='nueva'" : "") + ">" + f.v.map(function (v, c) { return td(v, celda && celda[0] === r && celda[1] === c); }).join("") + "</tr>"; if (marcarNuevas) f.nuevo = false; return h; }).join("") +
      (pend ? "<tr class='pendiente'>" + pend.map(function (v) { return td(v, v === "?"); }).join("") + "</tr>" : "") + "</tbody></table>";
  }
  function pintarPasos() {
    if (!S) return;
    var n = S.N.pasos.length;
    raiz.querySelector("#rPasos").innerHTML = S.N.pasos.map(function (p, i) { return "<i class='" + (i < S.k ? "ok" : i === S.k && !S.jefe ? "act" : "") + "'></i>"; }).join("") + "<i class='jefe " + (S.jefe ? "act" : "") + "'></i><small>" + (S.jefe ? "Jefe" : "Paso " + Math.min(S.k + 1, n) + "/" + n) + "</small>";
  }
  /* Evalúa una operación escrita con las teclas de la calculadora (o en el cuadro de respuesta). */
  function factorial(n) { n = Math.round(n); var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
  function evaluar(expr) {
    var js = String(expr).replace(/×|·/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/mod/g, "%").replace(/√/g, "S").replace(/Ln|ln/g, "L").replace(/e\^/g, "E").replace(/\^/g, "**").replace(/(\d+)!/g, "F($1)").replace(/,/g, ".");
    if (!/^[0-9+\-*/%(). SLEF]+$/.test(js)) return NaN;
    try { var r = Function("S", "L", "E", "F", "return (" + js + ")")(Math.sqrt, Math.log, Math.exp, factorial); return typeof r === "number" && isFinite(r) ? r : NaN; }
    catch (er) { return NaN; }
  }
  function construirCalc() {
    var c = raiz.querySelector("#rCalc");
    c.innerHTML = "<div class='t-cab'><div class='t-tit'>Calculadora</div><button class='t-btn' id='cMin' title='Mostrar u ocultar la calculadora'>" + (localStorage.getItem("semillin_calc_mini") === "1" ? "+ Mostrar" : "− Ocultar") + "</button></div><div class='pantalla-calc' id='cP'>0</div><div class='teclas-calc'>" +
      ["7", "8", "9", "÷", "(", ")", "C", "4", "5", "6", "×", "√", "x²", "←", "1", "2", "3", "−", "Ln", "e^", "ans", "0", ".", "mod", "+", "^", "!", "="].map(function (k) { return "<button data-c='" + k + "' class='" + (k === "=" ? "igual" : (/^[0-9.]$/.test(k) ? "" : "op")) + "'>" + k + "</button>"; }).join("") +
      "</div>";
    var expr = "", ans = "0", p = c.querySelector("#cP");
    c.classList.toggle("mini", localStorage.getItem("semillin_calc_mini") === "1");
    c.querySelector("#cMin").onclick = function (e) { e.stopPropagation(); var mini = !c.classList.contains("mini"); c.classList.toggle("mini", mini); localStorage.setItem("semillin_calc_mini", mini ? "1" : "0"); this.textContent = mini ? "+ Mostrar" : "− Ocultar"; this.blur(); };
    c.querySelectorAll("[data-c]").forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation(); var k = b.getAttribute("data-c");
        if (k === "C") expr = ""; else if (k === "←") expr = expr.slice(0, -1); else if (k === "ans") expr += ans; else if (k === "√") expr += "√("; else if (k === "x²") expr += "^2"; else if (k === "Ln") expr += "Ln("; else if (k === "e^") expr += "e^(";
        else if (k === "=") {
          var r = evaluar(expr);
          if (isNaN(r)) { p.textContent = "Error"; expr = ""; return; }
          ans = String(Math.round(r * 1e9) / 1e9); expr = ans;
        } else expr += (k === "mod" ? " mod " : k);
        p.textContent = expr || "0"; b.blur();
      };
    });
  }

  /* ---------- Bucle principal ---------- */
  function bucle(ahora) {
    if (!S || !cv || !document.body.contains(cv)) return;
    var dt = Math.min(0.1, (ahora - ultimo) / 1000); ultimo = ahora;
    var hayModal = !!document.querySelector(".modal-fondo:not(.resultado)");
    if (S.listo && !S.pausa && S.fase !== "fin" && !hayModal) {
      acum += dt;
      while (acum >= PASO && S && S.fase !== "fin") { paso(PASO); acum -= PASO; }
    } else {
      acum = 0; S.prev.dist = S.dist; S.prev.y = S.y;
      if (hayModal && S.listo && !S.pausa && S.fase === "calcular") relojZona(dt);
    }
    if (S) dibujar(Math.min(1, acum / PASO));
    rafId = requestAnimationFrame(bucle);
  }

  document.addEventListener("DOMContentLoaded", function () {
    raiz = document.getElementById("runner");
    document.addEventListener("keydown", function (e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      var modalAbierto = document.querySelector(".modal-fondo");
      if (e.key === "Escape") {
        if (modalAbierto) { if (modalAbierto._cerrar) modalAbierto._cerrar(); return; }
        if (S && S.demo) { finDemo(); return; }
        if (S) menuPausa();
        return;
      }
      if (!S) { if (e.key === "Enter" && !modalAbierto && raiz.querySelector("#hPlay")) raiz.querySelector("#hPlay").click(); return; }
      if (modalAbierto) return;
      if (e.code === "Space" || e.key === "ArrowUp") { e.preventDefault(); brincar(); }
      if (e.key === "ArrowDown") { e.preventDefault(); teclas.abajo = true; if (S.fase === "tubos" || S.fase === "salida") entrar(); }
      if (e.key === "Enter" && S.fase === "calcular") { e.preventDefault(); tubos(); }
      if (e.key === "Enter" && S.fase === "solucion") { e.preventDefault(); continuar(); }
      if (e.key === "p" || e.key === "P") menuPausa();
    });
    document.addEventListener("keyup", function (e) { if (e.key === "ArrowDown") teclas.abajo = false; });
    window.addEventListener("blur", function () { teclas.abajo = false; if (S && S.listo && !S.pausa && S.fase !== "fin" && !document.querySelector(".modal-fondo")) menuPausa(); });
    if (document.fonts && document.fonts.load) document.fonts.load("20px Pixel").then(inicio, inicio); else inicio();
  });
  window.BROTE_RUN_PRUEBA = { estado: function () { return S; }, entrar: function () { return entrar(); }, tubos: function () { tubos(); }, abrir: function (i) { jugar(i, false); }, demo: function () { jugar(0, true); }, finDemo: function () { finDemo(); }, niveles: NV };
})();
