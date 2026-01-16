import { app, BrowserWindow, ipcMain, nativeTheme, shell, safeStorage } from 'electron';
import Store from 'electron-store';
import type { IpcMainEvent } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// 1. Types & Interfaces
interface TitlebarStylePayload {
  backgroundColor: string;
  symbolColor: string;
  theme: 'light' | 'dark' | 'system';
}

// Define the schema for the store to ensure type safety
interface StoreSchema {
  auth_token?: string;
  auth_token_enc?: string;
}

// 2. Setup Environment
// specific switch for some linux distros or specific rendering needs
app.commandLine.appendSwitch('no-sandbox');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

// Initialize Store with schema
const store = new Store<StoreSchema>();

// Global reference
let mainWindow: BrowserWindow | null = null;
console.log('Preload Path:', path.join(__dirname, 'preload.js'));
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    // FIX: Adjust icon path logic. In dev, it's usually public/ or assets/. 
    // In prod, it's in resources. Using a conditional path or a simpler specific location is safer.
    icon: path.join(__dirname, './build/logo.png'), // Adjusted assumption based on standard structure
    
    // --- VS CODE STYLE CONFIGURATION ---
    titleBarStyle: 'hidden', 
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#09090b' : '#ffffff',
    
    titleBarOverlay: nativeTheme.shouldUseDarkColors 
      ? { color: '#09090b', symbolColor: '#ffffff', height: 40 }
      : { color: '#ffffff', symbolColor: '#3f3f46', height: 40 },
    // -----------------------------------

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Required if you use 'safeStorage' or complex Node modules
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const loadUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(loadUrl);
  
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 3. Register IPC Handlers
app.whenReady().then(() => {
  
  // --- Window Control ---
  ipcMain.on('window-minimize', () => mainWindow?.minimize());

  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on('window-close', () => mainWindow?.close());

  // --- Dynamic Titlebar Style ---
  ipcMain.on('update-titlebar-style', (event: IpcMainEvent, payload: TitlebarStylePayload) => {
    const { backgroundColor, symbolColor, theme } = payload;
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return;

    if (theme) nativeTheme.themeSource = theme; 

    // Safety check: setTitleBarOverlay is not available on Linux
    if (process.platform === 'win32' || process.platform === 'darwin') {
      try {
        window.setTitleBarOverlay({
          color: backgroundColor,
          symbolColor: symbolColor,
          height: 40
        });
      } catch (err) {
        console.error("Failed to set title bar overlay:", err);
      }
    }
  });

  ipcMain.handle('get-system-theme', (): 'light' | 'dark' => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  });

  // --- Auth / SafeStorage ---
  ipcMain.handle('auth:save-token', (_, token: string) => {
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(token);
      store.set('auth_token_enc', encrypted.toString('base64'));
      store.delete('auth_token'); // Cleanup unencrypted if exists
    } else {
      store.set('auth_token', token);
    }
    return true;
  });

  ipcMain.handle('auth:get-token', () => {
    if (safeStorage.isEncryptionAvailable() && store.has('auth_token_enc')) {
      try {
        const encrypted = store.get('auth_token_enc') as string;
        const buffer = Buffer.from(encrypted, 'base64');
        return safeStorage.decryptString(buffer);
      } catch (error) {
        console.error('Decryption failed:', error);
        return null;
      }
    }
    return store.get('auth_token') as string | null;
  });

  ipcMain.handle('auth:delete-token', () => {
    store.delete('auth_token');
    store.delete('auth_token_enc');
    return true;
  });

  // --- File System (FIXED) ---
  
  // FIX: Don't write to __dirname (fails in packaged apps). Use User Data.
  const userDataPath = app.getPath('userData');

  ipcMain.handle('read-files', async (): Promise<string[] | { error: string }> => {
    try {
      const files = await fs.readdir(userDataPath);
      return files;
    } catch (err: any) {
      return { error: err.message };
    }
  });

  ipcMain.handle('create-test-file', async (): Promise<string | { error: string }> => {
    try {
      const filePath = path.join(userDataPath, 'test.txt');
      await fs.writeFile(filePath, 'Hello! This file was created by Electron TS.', 'utf-8');
      return `Success! File created at: ${filePath}`;
    } catch (err: any) {
      return { error: err.message };
    }
  });

  ipcMain.handle('get-network-status', () => {
    return { online: true }; // Note: Real network check usually happens in Renderer via window.navigator.onLine
  });
  // 1. Save Data (Encrypt -> Store)
  ipcMain.handle('storage:save', (_, key: string, data: any) => {
    try {
      const jsonString = JSON.stringify(data);
      
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(jsonString);
        store.set(key as keyof StoreSchema, encrypted.toString('base64'));
        store.set(`${key}_is_encrypted` as keyof StoreSchema, true); // Flag to know how to read it back
      } else {
        // Fallback for dev/systems without encryption (not recommended for prod)
        store.set(key as keyof StoreSchema, jsonString);
        store.set(`${key}_is_encrypted` as keyof StoreSchema, false);
      }
      return true;
    } catch (err) {
      console.error(`Failed to save ${key}:`, err);
      return false;
    }
  });

  // 2. Get Data (Retrieve -> Decrypt -> Parse)
  ipcMain.handle('storage:get', (_, key: string) => {
    if (!store.has(key as keyof StoreSchema)) return null;

    try {
      const isEncrypted = store.get(`${key}_is_encrypted`);
      const rawValue = store.get(key) as string;

      let jsonString = rawValue;

      if (isEncrypted && safeStorage.isEncryptionAvailable()) {
        const buffer = Buffer.from(rawValue, 'base64');
        jsonString = safeStorage.decryptString(buffer);
      }

      return JSON.parse(jsonString);
    } catch (err) {
      console.error(`Failed to retrieve ${key}:`, err);
      return null;
    }
  });

  // 3. Delete Data
  ipcMain.handle('storage:delete', (_, key: string) => {
    store.delete(key as keyof StoreSchema);
    store.delete(`${key}_is_encrypted` as keyof StoreSchema);
    return true;
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});