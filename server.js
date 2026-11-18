/* =========================================================
   SEMILLÍN RUN · servidor
   - Sirve el juego (archivos estáticos).
   - Liga en línea: guarda el mejor puntaje de cada jugador por mundo.
     Con DATABASE_URL usa PostgreSQL (Render); sin ella, un archivo JSON
     local (data/liga.json) para probar en la computadora.
   Uso: node server.js   (puerto: variable PORT o 8000)
   ========================================================= */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const RAIZ = __dirname;
const PUERTO = +process.env.PORT || 8000;
const PUBLICOS = ["index.html", "favicon.png", "css/", "js/", "vendor/", "sprites/", "audio/"];
const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav", ".json": "application/json; charset=utf-8" };
const MUNDO = /^m(0[1-9]|1[0-7])$/;
const AVATARES = ["semillin", "108", "120", "121"];
const MAX_PUNTOS = 60000;

/* ---------- Almacenamiento ---------- */
function hash(clave) { return crypto.createHash("sha256").update(String(clave)).digest("hex"); }
function resumen(records) {
  let total = 0, estrellas = 0, mundos = 0;
  Object.keys(records).forEach(function (m) { const r = records[m]; total += r[0]; estrellas += r[1]; if (r[0] > 0) mundos++; });
  return { total, estrellas, mundos };
}

function almacenArchivo() {
  const ARCH = path.join(RAIZ, "data", "liga.json");
  let datos = {};
  try { datos = JSON.parse(fs.readFileSync(ARCH, "utf8")); } catch (e) { datos = {}; }
  function guardar() { fs.mkdirSync(path.dirname(ARCH), { recursive: true }); fs.writeFileSync(ARCH, JSON.stringify(datos)); }
  return {
    tipo: "archivo",
    async obtener(id) { return datos[id] || null; },
    async guardar(j) { datos[j.id] = j; guardar(); },
    async lista() { return Object.values(datos); }
  };
}

async function almacenPostgres(url) {
  const { Pool } = require("pg");
  const externo = /render\.com|amazonaws|neon\.tech|supabase/.test(url) && !/sslmode=disable/.test(url);
  const pool = new Pool({ connectionString: url, ssl: externo ? { rejectUnauthorized: false } : false, max: 5 });
  await pool.query(`CREATE TABLE IF NOT EXISTS semillin_jugadores (
    id TEXT PRIMARY KEY, clave TEXT NOT NULL, nombre TEXT NOT NULL, avatar TEXT NOT NULL,
    records JSONB NOT NULL DEFAULT '{}'::jsonb, total INT NOT NULL DEFAULT 0, estrellas INT NOT NULL DEFAULT 0,
    mundos INT NOT NULL DEFAULT 0, actualizado TIMESTAMPTZ NOT NULL DEFAULT now())`);
  function fila(r) { return r && { id: r.id, clave: r.clave, nombre: r.nombre, avatar: r.avatar, records: r.records, total: r.total, estrellas: r.estrellas, mundos: r.mundos }; }
  return {
    tipo: "postgres",
    async obtener(id) { const r = await pool.query("SELECT * FROM semillin_jugadores WHERE id = $1", [id]); return fila(r.rows[0]); },
    async guardar(j) {
      await pool.query(`INSERT INTO semillin_jugadores (id, clave, nombre, avatar, records, total, estrellas, mundos, actualizado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
        ON CONFLICT (id) DO UPDATE SET nombre = $3, avatar = $4, records = $5, total = $6, estrellas = $7, mundos = $8, actualizado = now()`,
      [j.id, j.clave, j.nombre, j.avatar, JSON.stringify(j.records), j.total, j.estrellas, j.mundos]);
    },
    async lista() { const r = await pool.query("SELECT * FROM semillin_jugadores ORDER BY total DESC LIMIT 500"); return r.rows.map(fila); }
  };
}

/* ---------- Validación ---------- */
function limpiarNombre(n) { return String(n || "").replace(/[<>&"'`\\]/g, "").replace(/\s+/g, " ").trim().slice(0, 18); }
function validar(b) {
  if (!b || typeof b !== "object") return "Datos vacíos";
  if (!/^j[a-z0-9]{6,32}$/.test(String(b.id || ""))) return "Jugador inválido";
  if (!/^[A-Za-z0-9]{16,64}$/.test(String(b.clave || ""))) return "Clave inválida";
  if (!limpiarNombre(b.nombre)) return "Falta el nombre";
  if (!b.records || typeof b.records !== "object") return "Sin puntajes";
  return null;
}
function limpiarRecords(rec) {
  const out = {};
  Object.keys(rec).forEach(function (m) {
    if (!MUNDO.test(m) || !Array.isArray(rec[m])) return;
    const p = Math.max(0, Math.min(MAX_PUNTOS, Math.round(+rec[m][0] || 0))), e = Math.max(0, Math.min(3, Math.round(+rec[m][1] || 0)));
    if (p > 0) out[m] = [p, e];
  });
  return out;
}

/* ---------- Límite de peticiones por IP ---------- */
const visitas = new Map();
function permitido(ip) {
  const ahora = Date.now(), v = (visitas.get(ip) || []).filter(function (t) { return ahora - t < 60000; });
  v.push(ahora); visitas.set(ip, v);
  if (visitas.size > 5000) visitas.clear();
  return v.length <= 40;
}

/* ---------- HTTP ---------- */
function json(res, codigo, obj) { res.writeHead(codigo, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); }
function leerCuerpo(req) {
  return new Promise(function (ok, mal) {
    let t = "";
    req.on("data", function (c) { t += c; if (t.length > 16000) { mal(new Error("Muy grande")); req.destroy(); } });
    req.on("end", function () { try { ok(JSON.parse(t || "{}")); } catch (e) { mal(e); } });
    req.on("error", mal);
  });
}
function estatico(req, res, ruta) {
  let rel = decodeURIComponent(ruta.split("?")[0]).replace(/^\/+/, "");
  if (rel === "") rel = "index.html";
  if (!PUBLICOS.some(function (p) { return p.endsWith("/") ? rel.startsWith(p) : rel === p; }) || rel.includes("..")) { res.writeHead(404); return res.end("No encontrado"); }
  const arch = path.join(RAIZ, rel);
  fs.stat(arch, function (err, st) {
    if (err || !st.isFile()) { res.writeHead(404); return res.end("No encontrado"); }
    const ext = path.extname(arch).toLowerCase();
    res.writeHead(200, { "Content-Type": TIPOS[ext] || "application/octet-stream", "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600", "X-Content-Type-Options": "nosniff" });
    fs.createReadStream(arch).pipe(res);
  });
}

async function iniciar() {
  let almacen;
  if (process.env.DATABASE_URL) {
    try { almacen = await almacenPostgres(process.env.DATABASE_URL); }
    catch (e) { console.error("No se pudo conectar a PostgreSQL:", e.message); almacen = almacenArchivo(); }
  } else almacen = almacenArchivo();
  console.log("Liga guardada en:", almacen.tipo);

  const servidor = http.createServer(async function (req, res) {
    const url = new URL(req.url, "http://x");
    const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
    try {
      if (url.pathname === "/api/salud") return json(res, 200, { ok: true, liga: almacen.tipo });
      if (url.pathname === "/api/liga" && req.method === "GET") {
        const mundo = url.searchParams.get("mundo") || "";
        if (mundo && !MUNDO.test(mundo)) return json(res, 400, { error: "Mundo inválido" });
        const lista = (await almacen.lista()).map(function (j) {
          const r = mundo ? (j.records[mundo] || [0, 0]) : null;
          return { id: j.id, nombre: j.nombre, avatar: j.avatar, puntos: mundo ? r[0] : j.total, estrellas: mundo ? r[1] : j.estrellas, mundos: j.mundos };
        }).filter(function (j) { return j.puntos > 0; })
          .sort(function (a, b) { return b.puntos - a.puntos || b.estrellas - a.estrellas || a.nombre.localeCompare(b.nombre); }).slice(0, 100);
        return json(res, 200, { jugadores: lista });
      }
      if (url.pathname === "/api/puntaje" && req.method === "POST") {
        if (!permitido(ip)) return json(res, 429, { error: "Demasiadas peticiones, espera un minuto" });
        const b = await leerCuerpo(req), err = validar(b);
        if (err) return json(res, 400, { error: err });
        const previo = await almacen.obtener(b.id);
        if (previo && previo.clave !== hash(b.clave)) return json(res, 403, { error: "Ese jugador pertenece a otra computadora" });
        const records = Object.assign({}, previo ? previo.records : {});
        const nuevos = limpiarRecords(b.records);
        Object.keys(nuevos).forEach(function (m) { const a = records[m] || [0, 0]; records[m] = [Math.max(a[0], nuevos[m][0]), Math.max(a[1], nuevos[m][1])]; });
        const avatar = AVATARES.indexOf(String(b.avatar)) >= 0 ? String(b.avatar) : "semillin";
        const j = Object.assign({ id: b.id, clave: previo ? previo.clave : hash(b.clave), nombre: limpiarNombre(b.nombre), avatar: avatar, records: records }, resumen(records));
        await almacen.guardar(j);
        return json(res, 200, { ok: true, total: j.total });
      }
      if (url.pathname.startsWith("/api/")) return json(res, 404, { error: "No existe" });
      if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405); return res.end(); }
      estatico(req, res, url.pathname);
    } catch (e) {
      console.error(e);
      json(res, 500, { error: "Error del servidor" });
    }
  });
  servidor.listen(PUERTO, function () { console.log("Semillín Run en http://localhost:" + PUERTO); });
}
iniciar();
