import { app, BrowserWindow } from 'electron';
import * as path from 'path'; // Import the 'path' module

export let avaliableWin: BrowserWindow;

function createWindow() {
  let win = new BrowserWindow({
    width: 740,
    height: 690,
    backgroundColor: '#006400', //#006400 // dark green
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.setMenu(null);
  win.webContents.openDevTools(); // debug mode
  win.loadFile(path.join(__dirname, 'index.html'));
  avaliableWin = win;
}

app.whenReady().then(createWindow);