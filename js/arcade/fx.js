/* =========================================================
   BROTE ARCADE · Efectos, récords, logros y rango del jugador
   ========================================================= */
(function () {
  "use strict";
  var B = (window.BROTE = window.BROTE || {});
  var A = (B.arcade = {});
  var CLAVE = "brote_arcade_v1";

  function leer() { try { return JSON.parse(localStorage.getItem(CLAVE)) || { records: {}, logros: {}, stats: {} }; } catch (e) { return { records: {}, logros: {}, stats: {} }; } }
  function guardar(d) { localStorage.setItem(CLAVE, JSON.stringify(d)); }
  A.datos = leer;

  /* ---------- Récords ---------- */
  A.guardarRecord = function (clave, puntos, estrellas) {
    var d = leer(), r = d.records[clave] || { puntos: 0, estrellas: 0 }, nuevo = puntos > r.puntos;
    d.records[clave] = { puntos: Math.max(r.puntos, puntos), estrellas: Math.max(r.estrellas || 0, estrellas || 0) };
    guardar(d);
    return nuevo;
  };
  A.record = function (clave) { return leer().records[clave] || { puntos: 0, estrellas: 0 }; };
  A.sumarStat = function (k, n) { var d = leer(); d.stats[k] = (d.stats[k] || 0) + (n || 1); guardar(d); A.revisarLogros(); return d.stats[k]; };
  A.stat = function (k) { return leer().stats[k] || 0; };

  /* ---------- Logros ---------- */
  A.LOGROS = [
    { id: "primer_dia", icono: "", nombre: "Primer día", desc: "Sobrevive tu primera ciudad en Contención", cond: function (s) { return s.ciudades_ganadas >= 1; } },
    { id: "salvador", icono: "", nombre: "Salvavidas", desc: "Corta 25 contagios justo a tiempo", cond: function (s) { return s.salvados >= 25; } },
    { id: "vacunador", icono: "", nombre: "Brigada de vacunación", desc: "Aplica 50 vacunas", cond: function (s) { return s.vacunas >= 50; } },
    { id: "periodo", icono: "", nombre: "Período descubierto", desc: "Vence al Dr. Período", cond: function (s) { return s.jefe_vencido >= 1; } },
    { id: "jackpot", icono: "", nombre: "Jackpot", desc: "Consigue 5 períodos completos en la Máquina de semillas", cond: function (s) { return s.jackpots >= 5; } },
    { id: "jackpot_pro", icono: "", nombre: "Hull-Dobell en persona", desc: "Consigue 25 períodos completos", cond: function (s) { return s.jackpots >= 25; } },
    { id: "detective", icono: "", nombre: "Detective estadístico", desc: "Descubre 10 impostores", cond: function (s) { return s.impostores >= 10; } },
    { id: "sherlock", icono: "", nombre: "Sherlock de la χ²", desc: "Racha de 8 impostores sin fallar", cond: function (s) { return s.mejor_racha_impostor >= 8; } },
    { id: "cazador", icono: "", nombre: "Cazador de rangos", desc: "Atrapa 30 valores en el Cazador de rangos", cond: function (s) { return s.rangos >= 30; } },
    { id: "combo", icono: "", nombre: "En llamas", desc: "Haz un combo ×10 en el Cazador de rangos", cond: function (s) { return s.mejor_combo_rangos >= 10; } },
    { id: "estrellas", icono: "", nombre: "Ciudad modelo", desc: "Consigue 3 estrellas en 3 ciudades", cond: function (s) { return s.ciudades_3estrellas >= 3; } }
  ];
  A.revisarLogros = function () {
    var d = leer(), nuevos = [];
    A.LOGROS.forEach(function (l) { if (!d.logros[l.id] && l.cond(d.stats)) { d.logros[l.id] = Date.now(); nuevos.push(l); } });
    if (nuevos.length) { guardar(d); nuevos.forEach(function (l, i) { setTimeout(function () { A.avisoLogro(l); }, 600 + i * 2200); }); }
  };
  A.statMax = function (k, v) { var d = leer(); if ((d.stats[k] || 0) < v) { d.stats[k] = v; guardar(d); A.revisarLogros(); } };
  A.avisoLogro = function (l) {
    var d = document.createElement("div"); d.className = "logro-aviso";
    d.innerHTML = "<span class='ic'>" + l.icono + "</span><div><b>¡Logro desbloqueado!</b><br>" + l.nombre + "</div>";
    document.body.appendChild(d);
    B.ui.sonar("chimes", .5);
    setTimeout(function () { d.classList.add("fuera"); }, 2600);
    setTimeout(function () { d.remove(); }, 3200);
  };

  /* ---------- Rango del jugador ---------- */
  var RANGOS = [[0, "Becario de simulación"], [1500, "Analista junior"], [4000, "Modelador estocástico"], [8000, "Cazador de brotes"], [14000, "Jefe de Epidemiología"], [22000, "Leyenda Monte Carlo"]];
  A.xp = function () { var d = leer(), t = 0; Object.keys(d.records).forEach(function (k) { t += d.records[k].puntos; }); t += Object.keys(d.logros).length * 500; return t; };
  A.rango = function () {
    var xp = A.xp(), r = RANGOS[0], sig = null;
    for (var i = 0; i < RANGOS.length; i++) { if (xp >= RANGOS[i][0]) { r = RANGOS[i]; sig = RANGOS[i + 1] || null; } }
    return { xp: xp, nombre: r[1], desde: r[0], hasta: sig ? sig[0] : null, siguiente: sig ? sig[1] : null };
  };

  /* ---------- Banners y cuenta regresiva ---------- */
  A.banner = function (cont, html, clase, ms) {
    var d = document.createElement("div"); d.className = "banner " + (clase || "");
    d.innerHTML = html; cont.appendChild(d);
    setTimeout(function () { d.classList.add("fuera"); }, ms || 1800);
    setTimeout(function () { d.remove(); }, (ms || 1800) + 500);
    return d;
  };
  A.cuentaRegresiva = function (cont, cb) {
    var n = 3;
    (function tic() {
      if (n > 0) { A.banner(cont, "<span class='gigante'>" + n + "</span>", "cuenta", 600); B.ui.sonar("button" + (n % 3), .5); n--; setTimeout(tic, 750); }
      else { A.banner(cont, "<span class='gigante'>¡YA!</span>", "cuenta ya", 600); B.ui.sonar("party_short", .45); setTimeout(cb, 350); }
    })();
  };

  /* ---------- Resultado con estrellas ---------- */
  A.resultado = function (op) {
    var m = document.createElement("div"); m.className = "modal-fondo";
    var est = "";
    if (op.estrellas !== undefined) for (var i = 1; i <= 3; i++) est += "<span class='estrella " + (i <= op.estrellas ? "on" : "") + "' style='animation-delay:" + (i * 0.25) + "s'><svg viewBox='0 0 24 24' width='1em' height='1em'><path d='m12 2 3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6Z' fill='currentColor' stroke='#3f2631' stroke-width='1.6' stroke-linejoin='round'/></svg></span>";
    m.innerHTML = "<div class='modal-caja resultado-caja'><h2>" + op.titulo + "</h2>" + (est ? "<div class='estrellas'>" + est + "</div>" : "") +
      "<div class='puntos-grande'>" + (op.puntos !== undefined ? op.puntos.toLocaleString("es-MX") + " <small>pts</small>" : "") + "</div>" +
      (op.record ? "<div class='nuevo-record'>¡Nuevo récord!</div>" : "") +
      (op.stats ? "<div class='stats'>" + op.stats.map(function (s) { return "<div><span>" + s[0] + "</span><b>" + s[1] + "</b></div>"; }).join("") + "</div>" : "") +
      (op.aprende ? "<div class='aviso verde' style='text-align:left'><span class='titulo-aviso'>La matemática detrás</span>" + op.aprende + "</div>" : "") +
      "<div class='fila-btn' style='justify-content:center'></div></div>";
    var fila = m.querySelector(".fila-btn");
    (op.botones || []).forEach(function (b) {
      var x = document.createElement(b.href ? "a" : "button"); x.className = "btn " + (b.clase || ""); x.innerHTML = b.txt;
      if (b.href) x.href = b.href;
      x.onclick = function () { if (b.fn) { m.remove(); b.fn(); } };
      fila.appendChild(x);
    });
    document.body.appendChild(m);
    if (op.estrellas >= 1) B.ui.sonar("party", .5);
    if (window.renderMathInElement) B.ui.mate(m);
    return m;
  };

  /* ---------- Partículas para canvas ---------- */
  A.Particulas = function () {
    var ps = [];
    this.estallido = function (x, y, color, n, vel) {
      n = n || 18; vel = vel || 4;
      for (var i = 0; i < n; i++) {
        var a = Math.random() * Math.PI * 2, v = vel * (0.4 + Math.random());
        ps.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, r: 3 + Math.random() * 4, c: color, t: 0, dur: 40 + Math.random() * 25 });
      }
    };
    this.texto = function (x, y, txt, color, tam) { ps.push({ x: x, y: y, vx: 0, vy: -1.1, txt: txt, c: color, t: 0, dur: 70, tam: tam || 22 }); };
    this.dibujar = function (ctx) {
      for (var i = ps.length - 1; i >= 0; i--) {
        var p = ps[i]; p.t++; p.x += p.vx; p.y += p.vy;
        if (!p.txt) { p.vy += 0.12; p.vx *= 0.97; }
        var a = 1 - p.t / p.dur;
        if (a <= 0) { ps.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = a;
        if (p.txt) {
          ctx.font = "bold " + p.tam + "px Pixel, PatrickHand, sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 4; ctx.strokeStyle = "#fff";
          ctx.strokeText(p.txt, p.x, p.y); ctx.fillStyle = p.c; ctx.fillText(p.txt, p.x, p.y);
        } else { ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
    };
  };

  /* ---------- Teclas rápidas ---------- */
  A.tecla = function (fn) { document.addEventListener("keydown", function (e) { if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return; fn(e); }); };
})();
