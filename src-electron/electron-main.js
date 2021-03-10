import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  nativeTheme,
  shell
} from 'electron'
import path from 'path'
import fs from 'fs'
import glob from 'glob'
import * as sh from 'shelljs'
import semver from 'semver'

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

// ===========================================================================
// Main Process Methods for Renderer
// ===========================================================================

// Configure shelljs for Electron
sh.config.execPath = sh.env.npm_node_execpath
sh.config.silent = true

ipcMain.handle('init-git-lfs', event => {
  // Check if Git LFS exists, and install it if not on Windows
  if (sh.exec('git lfs --version').code !== 0) {
    if (process.platform === 'win32') {
      return { code: 2, errorMessage: 'Error: Git LFS is not installed.' }
    }

    // Check if Homebrew exists, and return error if not
    if (!sh.which('brew')) {
      return { code: 1, errorMessage: 'Error: Homebrew is not installed.' }
    }

    // Make sure Homebrew and all formulae are updated
    sh.exec('brew update')

    // Check if Git exists, and install it if not
    if (!sh.which('git')) {
      sh.exec('brew install git')
    }

    // Check if Git >= 1.8.2, and install new Git from Homebrew if not
    // (probably came from a different package manager)
    const gitVersion = sh.exec('git --version').stdout.match(/\d+\.\d+\.\d+/g)[0]
    if (semver.satisfies(gitVersion, '>=1.8.2')) {
      sh.exec('brew install git')
    }

    sh.exec('brew install git-lfs')
  }

  sh.exec('git lfs install')
  return { code: 0, errorMessage: '' }
})

ipcMain.on('init-download-path', event => {
  const downloadPath = path.join(app.getPath('userData'), 'Songs')
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath)
  }
  event.returnValue = downloadPath
})

ipcMain.on('get-preferences-ini-path', event => {
  let files

  if (process.platform === 'win32') {
    files = glob.sync('StepMania 5*/Save/Preferences.ini', {
      cwd: '/Games',
      absolute: true
    }).concat(glob.sync('StepMania 5*/Save/Preferences.ini', {
      cwd: app.getPath('appData'),
      absolute: true
    })).map(str => str.replace(/\//g, '\\'))
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

ipcMain.handle('open-external', (event, url) => {
  return shell.openExternal(url)
})

ipcMain.on('open-folder-dialog', (event, defaultPath) => {
  event.returnValue = dialog.showOpenDialogSync(mainWindow, {
    title: 'Open Folder',
    defaultPath: fs.existsSync(defaultPath) ? defaultPath : app.getPath('home'),
    buttonLabel: 'Select Folder',
    properties: [ 'openDirectory', 'createDirectory', 'showHiddenFiles' ]
  })
})

ipcMain.on('open-ini-file-dialog', (event) => {
  event.returnValue = dialog.showOpenDialogSync(mainWindow, {
    title: 'Open Preferences.ini File',
    filters: [
      { name: 'Initialization Files', extensions: ['ini'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: [ 'openFile', 'showHiddenFiles' ]
  })
})
