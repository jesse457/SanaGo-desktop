// preload.js (ESM version)
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),

  readFiles: () => ipcRenderer.invoke("read-files"),
  createFile: () => ipcRenderer.invoke("create-test-file"),

  updateTitleBar: (config) => ipcRenderer.send("update-titlebar-style", config),

  getSystemTheme: () => ipcRenderer.invoke("get-system-theme"),
  getNetworkStatus: () => ipcRenderer.invoke("get-network-status"),

  // Auth Handlers
  saveToken: (token) => ipcRenderer.invoke("auth:save-token", token),
  getToken: () => ipcRenderer.invoke("auth:get-token"),
  deleteToken: () => ipcRenderer.invoke("auth:delete-token"),

  secureSet: (key, data) => ipcRenderer.invoke("storage:save", key, data),
  secureGet: (key) => ipcRenderer.invoke("storage:get", key),
  secureDelete: (key) => ipcRenderer.invoke("storage:delete", key),

  platform: process.platform,
});
