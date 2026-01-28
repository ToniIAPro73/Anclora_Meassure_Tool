
import { app, BrowserWindow, screen, ipcMain, globalShortcut } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true, // cleaner look
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Register a global shortcut to toggle the tool
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      // Reinforce alwaysOnTop when showing to ensure it stays on top of all apps
      win.setAlwaysOnTop(true, 'screen-saver');
    }
  });

  // Handle Close from UI
  ipcMain.on('quit-app', () => {
    app.quit();
  });

  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const webContents = event.sender;
    const window = BrowserWindow.fromWebContents(webContents);
    if (window && !window.isDestroyed()) {
      window.setIgnoreMouseEvents(ignore, options);
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});


