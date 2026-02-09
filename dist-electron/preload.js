import { contextBridge, ipcRenderer } from "electron";

// Enhanced preload script with better error handling and stability
contextBridge.exposeInMainWorld("electronAPI", {
  // Window
  secureClear: () => {
    return new Promise((resolve) => {
      ipcRenderer.invoke("storage:clear-all").then(resolve).catch((err) => {
        console.error("secureClear error:", err);
        resolve(false);
      });
    });
  },
  // System / UI
  updateTitleBar: (config) => {
    try {
      ipcRenderer.send("update-titlebar-style", config);
    } catch (err) {
      console.error("updateTitleBar error:", err);
    }
  },
  getSystemTheme: () => {
    return new Promise((resolve) => {
      ipcRenderer.invoke("get-system-theme").then(resolve).catch((err) => {
        console.error("getSystemTheme error:", err);
        resolve("light"); // Default to light theme on error
      });
    });
  },
  getNetworkStatus: () => {
    return new Promise((resolve) => {
      ipcRenderer.invoke("get-network-status").then(resolve).catch((err) => {
        console.error("getNetworkStatus error:", err);
        resolve(true); // Assume online on error
      });
    });
  },

  // Filesystem
  readFiles: () => {
    return new Promise((resolve) => {
      ipcRenderer.invoke("read-files").then(resolve).catch((err) => {
        console.error("readFiles error:", err);
        resolve([]);
      });
    });
  },
  createFile: () => {
    return new Promise((resolve) => {
      ipcRenderer.invoke("create-test-file").then(resolve).catch((err) => {
        console.error("createFile error:", err);
        resolve(null);
      });
    });
  },

  // Auth Specific
  saveToken: (token) => {
    return new Promise((resolve) => {
      ipcRenderer.invoke("auth:save-token", token).then(resolve).catch((err) => {
        console.error("saveToken error:", err);
        resolve(false);
      });
    });
  },
  getToken: () => {
    return new Promise((resolve) => {
      ipcRenderer.invoke("auth:get-token").then(resolve).catch((err) => {
        console.error("getToken error:", err);
        resolve(null);
      });
    });
  },
  deleteToken: () => {
    return new Promise((resolve) => {
      ipcRenderer.invoke("auth:delete-token").then(resolve).catch((err) => {
        console.error("deleteToken error:", err);
        resolve(false);
      });
    });
  },

  // Generic Secure Storage
  secureSet: (key, data) => {
    return new Promise((resolve) => {
      ipcRenderer.invoke("storage:save", key, data).then(resolve).catch((err) => {
        console.error("secureSet error:", err);
        resolve(false);
      });
    });
  },
  secureGet: (key) => {
    return new Promise((resolve) => {
      ipcRenderer.invoke("storage:get", key).then(resolve).catch((err) => {
        console.error("secureGet error:", err);
        resolve(null);
      });
    });
  },
  secureDelete: (key) => {
    return new Promise((resolve) => {
      ipcRenderer.invoke("storage:delete", key).then(resolve).catch((err) => {
        console.error("secureDelete error:", err);
        resolve(false);
      });
    });
  },

  platform: process.platform,
});