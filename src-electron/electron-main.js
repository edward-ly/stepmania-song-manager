import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import path from 'path'
import fs from 'fs'
import glob from 'glob'

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    fs.unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

let mainWindow

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD)
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// ---------------------------------------------------------------------------

ipcMain.on('init-download-path', event => {
  const result = path.join(app.getPath('userData'), 'Songs')
  if (!fs.existsSync(result)) {
    fs.mkdirSync(result)
  }
  event.returnValue = result
})

ipcMain.on('get-preferences-ini-path', event => {
  let files = []

  if (process.platform === 'win32') {
    files = files.concat(glob.sync('StepMania 5*/Save/Preferences.ini', {
      cwd: '/Games',
      absolute: true
    }))
    files = files.concat(glob.sync('StepMania 5*/Save/Preferences.ini', {
      cwd: app.getPath('appData'),
      absolute: true
    }))
    files = files.map(str => str.replace(/\//g, '\\'))
  } else if (process.platform === 'darwin') { // macOS
    files = glob.sync('StepMania 5*/Preferences.ini', {
      cwd: path.join(app.getPath('home'), 'Library', 'Preferences'),
      absolute: true
    })
  } else { // Linux (any)
    files = glob.sync('.stepmania-5*/Save/Preferences.ini', {
      cwd: app.getPath('home'),
      absolute: true
    })
  }

  event.returnValue = files
})
