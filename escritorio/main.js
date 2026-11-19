/* Semillín Run · versión de escritorio (Electron).
   Abre el juego desde los archivos locales: funciona sin internet y guarda el
   progreso en la carpeta de datos del usuario. La liga es local (códigos). */
const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");

function crear() {
  const win = new BrowserWindow({
    width: 1600, height: 960, minWidth: 1100, minHeight: 700,
    title: "Semillín Run", backgroundColor: "#7cc35f", autoHideMenuBar: true,
    icon: path.join(__dirname, "juego", "favicon.png"),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, "juego", "index.html"));
  /* F11: pantalla completa · F5: recargar */
  win.webContents.on("before-input-event", (e, t) => {
    if (t.type !== "keyDown") return;
    if (t.key === "F11") { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (t.key === "F5") { win.reload(); e.preventDefault(); }
  });
  /* Los enlaces externos se abren en el navegador */
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
}
app.whenReady().then(crear);
app.on("window-all-closed", () => app.quit());
