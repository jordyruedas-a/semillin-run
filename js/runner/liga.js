/* =========================================================
   LIGA DE SEMILLÍN · perfiles de jugador y tabla de clasificación
   Cada jugador se guarda en localStorage. Si el juego se abre desde el
   servidor (Render), los mejores puntajes también se suben a la liga en
   línea (base de datos) para compararse con los compañeros. Sin servidor
   (abriendo index.html directo) queda la liga local y el "código de liga".
   ========================================================= */
(function () {
  "use strict";
  var B = window.BROTE = window.BROTE || {};
  var CLAVE = "semillin_liga";
  var MUNDOS_IDS = B.niveles ? B.niveles.NIVELES.map(function (n) { return n.id; }) : [];
  /* Avatares: índices del tilemap Tiny City (Kenney, CC0) o "semillin" (vector). */
  var AVATARES = ["semillin", 108, 120, 121];

  function leer() {
    try { var d = JSON.parse(localStorage.getItem(CLAVE)); if (d && d.jugadores) return d; } catch (e) { /* datos dañados: se reinicia */ }
    return { actual: null, jugadores: {} };
  }
  function guardar(d) { localStorage.setItem(CLAVE, JSON.stringify(d)); }
  function claveNueva() { var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", s = ""; var r = window.crypto && window.crypto.getRandomValues ? window.crypto.getRandomValues(new Uint32Array(32)) : null; for (var i = 0; i < 32; i++) s += a[(r ? r[i] : Math.floor(Math.random() * 1e9)) % a.length]; return s; }
  function uid() { return "j" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
  function limpiarNombre(n) { return String(n || "").replace(/[<>&"']/g, "").replace(/\s+/g, " ").trim().slice(0, 18); }

  function total(j) { return MUNDOS_IDS.reduce(function (s, id) { var r = j.records[id]; return s + (r ? r.puntos : 0); }, 0); }
  function estrellas(j) { return MUNDOS_IDS.reduce(function (s, id) { var r = j.records[id]; return s + (r ? r.estrellas : 0); }, 0); }

  /* Ranking general (mundo vacío) o de un mundo. Empates: más estrellas y luego orden alfabético. */
  function ranking(mundo) {
    var d = leer();
    return Object.keys(d.jugadores).map(function (id) {
      var j = d.jugadores[id], r = mundo ? (j.records[mundo] || { puntos: 0, estrellas: 0 }) : null;
      return { id: id, nombre: j.nombre, avatar: j.avatar, externo: !!j.externo, yo: id === d.actual,
        puntos: mundo ? r.puntos : total(j), estrellas: mundo ? r.estrellas : estrellas(j), mundos: MUNDOS_IDS.filter(function (m) { return j.records[m] && j.records[m].puntos > 0; }).length };
    }).sort(function (a, b) { return b.puntos - a.puntos || b.estrellas - a.estrellas || a.nombre.localeCompare(b.nombre); });
  }
  function posicion(id, mundo) { var r = ranking(mundo); for (var i = 0; i < r.length; i++) if (r[i].id === id) return i + 1; return 0; }

  var L = {
    MUNDOS: MUNDOS_IDS, AVATARES: AVATARES,
    actual: function () { var d = leer(); return d.actual && d.jugadores[d.actual] ? Object.assign({ id: d.actual }, d.jugadores[d.actual]) : null; },
    crear: function (nombre, avatar) {
      var d = leer(), id = uid(), recs = {};
      /* El primer perfil hereda los récords que ya existían en este navegador. */
      if (!Object.keys(d.jugadores).length && B.arcade && B.arcade.record) {
        MUNDOS_IDS.forEach(function (m) { var r = B.arcade.record("run_" + m); if (r && r.puntos) recs[m] = { puntos: r.puntos, estrellas: r.estrellas || 0 }; });
      }
      d.jugadores[id] = { nombre: limpiarNombre(nombre) || "Jugador", avatar: avatar, records: recs, creado: Date.now(), clave: claveNueva() };
      d.actual = id; guardar(d); return id;
    },
    renombrar: function (nombre, avatar) { var d = leer(), j = d.jugadores[d.actual]; if (!j) return; j.nombre = limpiarNombre(nombre) || j.nombre; if (avatar !== undefined) j.avatar = avatar; guardar(d); },
    cambiar: function (id) { var d = leer(); if (d.jugadores[id] && !d.jugadores[id].externo) { d.actual = id; guardar(d); } },
    locales: function () { var d = leer(); return Object.keys(d.jugadores).filter(function (id) { return !d.jugadores[id].externo; }).map(function (id) { return Object.assign({ id: id }, d.jugadores[id]); }); },
    quitar: function (id) { var d = leer(); if (id === d.actual) return; delete d.jugadores[id]; guardar(d); },
    record: function (mundo) { var j = L.actual(); return (j && j.records[mundo]) || { puntos: 0, estrellas: 0 }; },
    total: function () { var j = L.actual(); return j ? total(j) : 0; },
    ranking: ranking,
    posicion: function (mundo) { var d = leer(); return { pos: posicion(d.actual, mundo), de: Object.keys(d.jugadores).length }; },

    /* Guarda la partida del jugador actual. Devuelve si fue récord y cómo cambió su lugar. */
    registrar: function (mundo, puntos, est) {
      var d = leer(), j = d.jugadores[d.actual]; if (!j) return { record: false };
      var antes = posicion(d.actual, ""), r = j.records[mundo] || { puntos: 0, estrellas: 0 }, nuevo = puntos > r.puntos;
      j.records[mundo] = { puntos: Math.max(r.puntos, puntos), estrellas: Math.max(r.estrellas, est || 0) };
      j.actualizado = Date.now(); guardar(d);
      L.subir();
      return { record: nuevo, antes: antes, despues: posicion(d.actual, ""), de: Object.keys(d.jugadores).length };
    },

    /* Marcador en vivo: con qué total quedaría el jugador si termina con estos puntos,
       y cuántos puntos le faltan para alcanzar al de arriba. */
    enVivo: function (mundo, puntos) {
      var d = leer(), j = d.jugadores[d.actual]; if (!j) return null;
      var mio = total(j) - ((j.records[mundo] || {}).puntos || 0) + Math.max(puntos, (j.records[mundo] || {}).puntos || 0);
      var otros = Object.keys(d.jugadores).filter(function (id) { return id !== d.actual; }).map(function (id) { return { nombre: d.jugadores[id].nombre, puntos: total(d.jugadores[id]) }; })
        .sort(function (a, b) { return b.puntos - a.puntos; });
      /* En empate se cuenta al otro adelante: hay que superarlo para pasar. */
      var delante = otros.filter(function (o) { return o.puntos >= mio; }), pos = 1 + delante.length, arriba = delante.pop();
      return { pos: pos, de: otros.length + 1, total: mio, arriba: arriba ? { nombre: arriba.nombre, faltan: arriba.puntos - mio + 1 } : null };
    },

    /* Código para compartir: texto con nombre, avatar y mejores puntajes. */
    codigo: function () {
      var j = L.actual(); if (!j) return "";
      var r = {}; MUNDOS_IDS.forEach(function (m) { if (j.records[m]) r[m] = [j.records[m].puntos, j.records[m].estrellas]; });
      var json = JSON.stringify({ v: 1, id: j.id, n: j.nombre, a: j.avatar, r: r });
      var b64 = btoa(unescape(encodeURIComponent(json))), suma = 0;
      for (var i = 0; i < b64.length; i++) suma = (suma * 31 + b64.charCodeAt(i)) % 9973;
      return "SEMILLIN-" + b64 + "-" + suma;
    },
    importar: function (texto) {
      var m = String(texto || "").replace(/\s+/g, "").match(/^SEMILLIN-([A-Za-z0-9+/=]+)-(\d+)$/);
      if (!m) return { ok: false, error: "El código no tiene el formato SEMILLIN-…" };
      var suma = 0; for (var i = 0; i < m[1].length; i++) suma = (suma * 31 + m[1].charCodeAt(i)) % 9973;
      if (String(suma) !== m[2]) return { ok: false, error: "El código está incompleto o mal copiado." };
      var o; try { o = JSON.parse(decodeURIComponent(escape(atob(m[1])))); } catch (e) { return { ok: false, error: "No se pudo leer el código." }; }
      var d = leer();
      if (!o.id || o.id === d.actual) return { ok: false, error: "Ese es tu propio código." };
      if (d.jugadores[o.id] && !d.jugadores[o.id].externo) return { ok: false, error: "Ese jugador ya existe en esta computadora." };
      var recs = {};
      MUNDOS_IDS.forEach(function (k) { var v = o.r && o.r[k]; if (v) recs[k] = { puntos: Math.max(0, Math.min(99999, +v[0] || 0)), estrellas: Math.max(0, Math.min(3, +v[1] || 0)) }; });
      var nuevo = !d.jugadores[o.id];
      d.jugadores[o.id] = { nombre: limpiarNombre(o.n) || "Compañero", avatar: AVATARES.indexOf(o.a) >= 0 ? o.a : 108, records: recs, externo: true, actualizado: Date.now() };
      guardar(d);
      return { ok: true, nombre: d.jugadores[o.id].nombre, nuevo: nuevo };
    }
  };
  /* ---------- Liga en línea (solo si el juego viene de un servidor con /api) ---------- */
  var enLinea = null;
  L.enLinea = function (cb) {
    if (enLinea !== null || !/^https?:$/.test(location.protocol)) { enLinea = !!enLinea; return cb(enLinea); }
    fetch("api/salud", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { enLinea = !!(j && j.ok); cb(enLinea); }, function () { enLinea = false; cb(false); });
  };
  L.subir = function (cb) {
    var fin = typeof cb === "function" ? cb : function () {};
    L.enLinea(function (ok) {
      if (!ok) return fin();
      var d = leer(), j = d.jugadores[d.actual]; if (!j || j.externo) return fin();
      if (!j.clave) { j.clave = claveNueva(); guardar(d); }
      var r = {}; MUNDOS_IDS.forEach(function (m) { if (j.records[m] && j.records[m].puntos > 0) r[m] = [j.records[m].puntos, j.records[m].estrellas]; });
      if (!Object.keys(r).length) return fin();
      fetch("api/puntaje", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: d.actual, clave: j.clave, nombre: j.nombre, avatar: j.avatar, records: r }) }).then(function () { fin(); }, function () { fin(); });
    });
  };
  L.rankingEnLinea = function (mundo, cb) {
    fetch("api/liga" + (mundo ? "?mundo=" + encodeURIComponent(mundo) : ""), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
      var yo = leer().actual;
      cb((j.jugadores || []).map(function (x) { return { id: x.id, nombre: limpiarNombre(x.nombre) || "Jugador", avatar: x.avatar === "semillin" ? "semillin" : (AVATARES.indexOf(+x.avatar) >= 0 ? +x.avatar : "semillin"), puntos: +x.puntos || 0, estrellas: +x.estrellas || 0, mundos: +x.mundos || 0, yo: x.id === yo }; }));
    }, function () { cb(null); });
  };
  B.liga = L;
})();
