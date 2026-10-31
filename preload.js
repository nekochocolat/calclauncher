const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("api", {
  openCalc: (c) => ipcRenderer.send("open-calc", c),
  list: () => ipcRenderer.invoke("list"),
  githubProfile: () => ipcRenderer.invoke("github-profile"),
  openExternal: (url) => ipcRenderer.invoke("open-external", url)
});