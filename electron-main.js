const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  })
  // load local dev server or built index
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, 'dist', 'index.html')}`
  win.loadURL(startUrl)
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
