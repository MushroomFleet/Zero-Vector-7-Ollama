import { app as n, BrowserWindow as c, shell as r } from "electron";
import i from "path";
import { fileURLToPath as p } from "url";
const d = p(import.meta.url), a = i.dirname(d), l = process.env.NODE_ENV === "development" || !n.isPackaged;
let t = null;
function s() {
  t = new c({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: i.join(a, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0,
      webSecurity: !0
    },
    backgroundColor: "#1a1625",
    // NSL dark background
    title: "Zero Vector 7 Ollama",
    icon: i.join(a, "../build/icon.png")
  }), l ? (t.loadURL("http://localhost:8080"), t.webContents.openDevTools()) : t.loadFile(i.join(a, "../dist/index.html")), t.webContents.setWindowOpenHandler(({ url: e }) => e.startsWith("http://") || e.startsWith("https://") ? (r.openExternal(e), { action: "deny" }) : { action: "allow" }), t.webContents.on("will-navigate", (e, o) => {
    if (o.startsWith("http://") || o.startsWith("https://")) {
      if (l && o.startsWith("http://localhost"))
        return;
      e.preventDefault(), r.openExternal(o);
    }
  }), t.on("closed", () => {
    t = null;
  });
}
n.whenReady().then(() => {
  s(), n.on("activate", () => {
    c.getAllWindows().length === 0 && s();
  });
});
n.on("window-all-closed", () => {
  process.platform !== "darwin" && n.quit();
});
process.on("uncaughtException", (e) => {
  console.error("Uncaught Exception:", e);
});
