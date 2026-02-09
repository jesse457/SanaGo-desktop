import {
  app,
  BrowserWindow,
  ipcMain,
  nativeTheme,
  shell,
  safeStorage,
} from "electron";
import Store from "electron-store";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs"; // Use sync for startup checks
import fsPromises from "fs/promises";

// --- ESM Path Resolution ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

// --- Setup & Stability ---
if (process.platform === "linux") {
  app.commandLine.appendSwitch("no-sandbox");
}



interface StoreSchema {
  auth_token?: string;
  auth_token_enc?: string;
  [key: string]: any;
}

const store = new Store<StoreSchema>();
let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // --- Platform Icon Logic ---
  // Windows: .ico | Linux: .png
  const iconExt = process.platform === "win32" ? "ico" : "png";
  const iconPath = isDev
    ? path.join(__dirname, `./build/logo.${iconExt}`) // Dev: Step out of dist-electron to find build folder
    : path.join(process.resourcesPath, `logo.${iconExt}`); // Prod: resources folder

  // --- Robust Preload Detection ---
  // Windows is sensitive to the forward/backward slash mix in ESM. 
  // We resolve the absolute path and verify existence.
  const preloadPath = path.resolve(__dirname, "preload.js");
  
  if (!fs.existsSync(preloadPath)) {
    console.error(`🚨 PRELOAD MISSING: Attempted to load from ${preloadPath}`);
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: iconPath,
    titleBarStyle: "hidden", // Required for custom title bar
    // Windows/Linux specific overlay settings
    titleBarOverlay: {
      color: nativeTheme.shouldUseDarkColors ? "#09090b" : "#ffffff",
      symbolColor: nativeTheme.shouldUseDarkColors ? "#ffffff" : "#3f3f46",
      height: 40,
    },
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#09090b" : "#ffffff",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Set to false if you need to use certain Node features via preload
      preload: preloadPath,
      backgroundThrottling: false,
    },
  });

  const loadUrl = isDev
    ? "http://localhost:5173"
    : `file://${path.join(__dirname, "../dist/index.html")}`;

  mainWindow.loadURL(loadUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  // --- Window Events ---
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  // Windows: Prevent app from hanging on exit
  mainWindow.on("close", (e) => {
    if (!(app as any).isQuitting) {
      if (process.platform === "win32") {
        // Option: Hide instead of close to keep tray alive or just let it close
        // e.preventDefault();
        // mainWindow?.hide();
      }
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

// --- App Lifecycle ---
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// --- IPC Handlers ---

// Fixed Titlebar Style Handler for Windows/Linux
ipcMain.on("update-titlebar-style", (event, payload) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) return;

  nativeTheme.themeSource = payload.theme;

  // Windows doesn't support transparency for titleBarOverlay
  // We resolve "transparent" to the actual theme color
  const overlayColor = payload.backgroundColor === "transparent"
    ? (payload.theme === "dark" ? "#09090b" : "#ffffff")
    : payload.backgroundColor;

  if (process.platform === "win32" || process.platform === "linux") {
    try {
      window.setTitleBarOverlay({
        color: overlayColor,
        symbolColor: payload.symbolColor,
        height: 40,
      });
    } catch (e) {
      console.warn("WCO not supported on this environment");
    }
  }
});

// Auth & Storage Handlers
ipcMain.handle("auth:save-token", (_, token: string) => {
  try {
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(token);
      store.set("auth_token_enc", encrypted.toString("base64"));
      store.delete("auth_token");
    } else {
      store.set("auth_token", token);
    }
    return true;
  } catch (e) {
    return false;
  }
});

ipcMain.handle("auth:get-token", () => {
  try {
    if (safeStorage.isEncryptionAvailable() && store.has("auth_token_enc")) {
      const encrypted = store.get("auth_token_enc") as string;
      return safeStorage.decryptString(Buffer.from(encrypted, "base64"));
    }
    return store.get("auth_token") || null;
  } catch (e) {
    return null;
  }
});

ipcMain.handle("storage:clear-all", () => {
  store.clear();
  return true;
});

ipcMain.handle("storage:save", (_, key: string, data: any) => {
  try {
    const jsonString = JSON.stringify(data);
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(jsonString);
      store.set(key, encrypted.toString("base64"));
      store.set(`${key}_is_encrypted`, true);
    } else {
      store.set(key, jsonString);
      store.set(`${key}_is_encrypted`, false);
    }
    return true;
  } catch (err) {
    return false;
  }
});

ipcMain.handle("storage:get", (_, key: string) => {
  if (!store.has(key)) return null;
  try {
    const isEncrypted = store.get(`${key}_is_encrypted`);
    const rawValue = store.get(key) as string;
    let jsonString = rawValue;

    if (isEncrypted && safeStorage.isEncryptionAvailable()) {
      jsonString = safeStorage.decryptString(Buffer.from(rawValue, "base64"));
    }
    return JSON.parse(jsonString);
  } catch (err) {
    return null;
  }
}); 

// Error Management
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  if (process.platform === "win32") app.quit();
});