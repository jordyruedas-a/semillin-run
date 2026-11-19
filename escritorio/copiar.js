/* Copia los archivos del juego (carpeta superior) a ./juego antes de empaquetar. */
const fs = require("fs"), path = require("path");
const ORIGEN = path.join(__dirname, ".."), DESTINO = path.join(__dirname, "juego");
fs.rmSync(DESTINO, { recursive: true, force: true });
for (const r of ["index.html", "favicon.png", "css", "js", "vendor", "sprites", "audio"]) fs.cpSync(path.join(ORIGEN, r), path.join(DESTINO, r), { recursive: true });
console.log("Juego copiado a", DESTINO);
