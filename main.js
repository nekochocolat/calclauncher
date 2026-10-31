const { app, BrowserWindow, ipcMain, shell } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

try { require("electron-reloader")(module); } catch {}

function createMain() {
  const win = new BrowserWindow({
    width: 1240,
    height: 860,
    minWidth: 720,
    minHeight: 560,
    show: false,
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, "preload.js") }
  });
  win.maximize();
  win.loadFile("index.html");
  win.once("ready-to-show", () => win.show());
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      event.preventDefault();
      win.setFullScreen(!win.isFullScreen());
    }
  });
}

ipcMain.handle("list", () => {
  const dir = path.join(__dirname, "calculators");
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    .sort((a, b) => a.name.localeCompare(b.name));
});

ipcMain.handle("github-profile", async () => {
  try {
    const response = await fetch("https://api.github.com/users/nekochocolat", {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "CalcLauncher"
      },
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return null;

    const profile = await response.json();
    if (!profile.login || !profile.avatar_url) return null;
    return {
      login: profile.login,
      name: typeof profile.name === "string" && profile.name.trim() ? profile.name.trim() : profile.login,
      avatarUrl: profile.avatar_url,
      profileUrl: `https://github.com/${encodeURIComponent(profile.login)}`
    };
  } catch {
    return null;
  }
});

ipcMain.handle("open-external", async (_event, target) => {
  try {
    const url = new URL(target);
    if (url.protocol !== "https:" || url.hostname !== "github.com") return false;
    await shell.openExternal(url.href);
    return true;
  } catch {
    return false;
  }
});

function openWeb(calc) {
      console.log("OPEN", JSON.stringify(calc));
  const w = new BrowserWindow({
    width: calc.width || 420,
    height: calc.height || 820,
    useContentSize: true,
    title: calc.name,
    autoHideMenuBar: true,
    show: false
  });
  w.setMenuBarVisibility(false);
  w.loadURL(calc.url);

  w.webContents.on("did-finish-load", async () => {
    if (calc.isolate !== false) {
      try {
        const code = fs.readFileSync(path.join(__dirname, "isolate.js"), "utf8");
        const size = await w.webContents.executeJavaScript(
          code + `;isolate(${JSON.stringify(calc.selector || null)}, ${calc.height || "null"}, ${JSON.stringify(calc.skin || null)})`
        );
        w.setResizable(true);
        if (calc.width && calc.height) w.setContentSize(calc.width, calc.height);
        else if (size) w.setContentSize(size.w, size.h);
      } catch (e) {
        console.log("isolate error:", e.message);
      }
    }
    w.setResizable(false);
    w.show();
    if (calc.debug) w.webContents.openDevTools({ mode: "detach" });
  });
}

function openLocal(calc) {
  const offlineRoot = path.resolve(__dirname, "calculators", "offline") + path.sep;
  const file = path.resolve(__dirname, calc.file || "");
  if (!file.startsWith(offlineRoot) || !fs.existsSync(file)) return;

  const win = new BrowserWindow({
    width: calc.width || 1000,
    height: calc.height || 800,
    useContentSize: true,
    title: calc.name,
    autoHideMenuBar: true,
    show: false
  });
  win.setMenuBarVisibility(false);
  win.loadFile(file);
  win.once("ready-to-show", () => win.show());
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      event.preventDefault();
      win.setFullScreen(!win.isFullScreen());
    }
  });
}

ipcMain.on("open-calc", (e, calc) => {
  if (calc.type === "web") {
    openWeb(calc);
  } else if (calc.type === "local") {
    openLocal(calc);
  } else if (calc.type === "link") {
    try {
      const url = new URL(calc.url);
      if (url.protocol === "http:" || url.protocol === "https:") {
        shell.openExternal(url.href);
      }
    } catch {}
  } else if (calc.type === "external") {
    const p = spawn(calc.command, calc.args || [], { detached: true, stdio: "ignore" });
    p.on("error", () => console.log("Introuvable : " + calc.command));
    p.unref();
  }
});

app.whenReady().then(createMain);
app.on("window-all-closed", () => app.quit());