/* Semillín Run · versión de escritorio (Electron).
   Abre el juego desde los archivos locales: funciona sin internet y guarda el
   progreso en la carpeta de datos del usuario. La liga es local (códigos).
   Compatibilidad: no requiere permisos de administrador; si la tarjeta gráfica
   o su controlador fallan, se reinicia solo con dibujo por software. */
const { app, BrowserWindow, Menu, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

const SIN_GPU = process.argv.includes("--sin-gpu");
if (SIN_GPU) {
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch("disable-gpu");
}

/* Carpeta de datos: %APPDATA%\Semillín Run; si no se puede escribir ahí
   (equipos con restricciones), se usa la carpeta temporal del usuario. */
function carpetaEscribible(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    const prueba = path.join(dir, ".prueba");
    fs.writeFileSync(prueba, "ok"); fs.unlinkSync(prueba);
    return true;
  } catch (e) { return false; }
}
if (!carpetaEscribible(app.getPath("userData"))) {
  const alterna = path.join(os.tmpdir(), "SemillinRun-datos");
  if (carpetaEscribible(alterna)) app.setPath("userData", alterna);
}

/* Una sola ventana del juego aunque se abra el .exe dos veces */
if (!app.requestSingleInstanceLock()) { app.quit(); }

let win = null;
function reiniciarSinGPU() {
  if (SIN_GPU) return;
  app.relaunch({ args: process.argv.slice(1).concat(["--sin-gpu"]) });
  app.exit(0);
}

function crear() {
  win = new BrowserWindow({
    width: 1600, height: 960, minWidth: 1000, minHeight: 640,
    title: "Semillín Run", backgroundColor: "#7cc35f", autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, "juego", "favicon.png"),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  Menu.setApplicationMenu(null);
  /* Ajuste a pantallas pequeñas: la ventana nunca excede el área de trabajo */
  const { screen } = require("electron");
  const area = screen.getPrimaryDisplay().workAreaSize;
  if (area.width < 1600 || area.height < 960) {
    win.setSize(Math.min(1600, area.width), Math.min(960, area.height));
    win.center();
    if (area.width < 1280) win.maximize();
  }
  win.once("ready-to-show", () => win.show());
  win.loadFile(path.join(__dirname, "juego", "index.html"));
  /* F11: pantalla completa · F5: recargar */
  win.webContents.on("before-input-event", (e, t) => {
    if (t.type !== "keyDown") return;
    if (t.key === "F11") { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (t.key === "F5") { win.reload(); e.preventDefault(); }
  });
  /* Los enlaces externos se abren en el navegador */
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  /* Si la página se cae, se recarga; si vuelve a caer, se reinicia sin GPU */
  let caidas = 0;
  win.webContents.on("render-process-gone", () => {
    caidas++;
    if (caidas === 1) win.reload(); else reiniciarSinGPU();
  });
}

app.on("second-instance", () => {
  if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
});
/* Falla del proceso gráfico (controlador antiguo, máquina virtual, escritorio remoto) */
app.on("child-process-gone", (e, d) => {
  if (d.type === "GPU" && d.reason !== "clean-exit") reiniciarSinGPU();
});
app.whenReady().then(crear).catch((err) => {
  dialog.showErrorBox("Semillín Run", "No se pudo abrir el juego:\n" + (err && err.message));
  app.exit(1);
});
app.on("window-all-closed", () => app.quit());
