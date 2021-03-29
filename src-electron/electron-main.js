import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  nativeTheme,
  shell,
} from 'electron'
import path from 'path'
import fs from 'fs'
import glob from 'glob'
import AutoLaunch from 'auto-launch'
import s3 from '@auth0/s3'

try {
  if (
    process.platform === 'win32' &&
    nativeTheme.shouldUseDarkColors === true
  ) {
    fs.unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) {
  /* continue */
}

let mainWindow
let songListWindow

function createWindow () {
  /* Initial window options */
  /* global __dirname */
  mainWindow = new BrowserWindow({
    width: 810,
    height: 500,
    minWidth: 360,
    minHeight: 480,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
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
    songListWindow.destroy()
    songListWindow = null
    mainWindow = null
  })
}

function createSongListWindow () {
  songListWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 854,
    minHeight: 480,
    useContentSize: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  })

  songListWindow.loadURL(process.env.APP_URL + '/#/songs')

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    songListWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    songListWindow.webContents.on('devtools-opened', () => {
      songListWindow.webContents.closeDevTools()
    })
  }

  songListWindow.on('close', (event) => {
    event.preventDefault()
    songListWindow.hide()
  })
}

app.on('ready', () => {
  createWindow()
  createSongListWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
    createSongListWindow()
  }
})

const autoLauncher = new AutoLaunch({
  name: 'StepMania Song Manager',
})

// ===========================================================================
// Helper Functions
// ===========================================================================

// Based on the 'fs-readdir-recursive' npm package, modified for this app
// https://github.com/fs-utils/fs-readdir-recursive
function readDir (root, files, prefix) {
  files = files || []
  prefix = prefix || ''

  let dir = path.join(root, prefix)
  if (!fs.existsSync(dir)) return files
  if (fs.statSync(dir).isDirectory()) {
    fs.readdirSync(dir)
      .filter((name) => name[0] !== '.')
      .forEach((name) => readDir(root, files, path.join(prefix, name)))
  } else {
    files.push(dir)
  }

  return files
}

function getChartLevel (data, fileExtension, style, difficulty) {
  let matchStr = 'a^'
  if (fileExtension === '.sm') {
    matchStr = `(?<=#NOTES:\\s*${style}:\\s*.*:\\s*${difficulty}:\\s*)\\d+`
  }
  if (fileExtension === '.ssc') {
    matchStr = `(?<=#STEPSTYPE:${style};\\s*(.*\\s*){0,2}#DIFFICULTY:${difficulty};\\s*#METER:)\\d+`
  }
  const match = data.match(new RegExp(matchStr))
  return !match ? '-' : match[0]
}

function getDisplayBPM (data) {
  const displayBpmMatch = data.match(/(?<=#DISPLAYBPM:).*(?=;)/)
  const displayBPM = !displayBpmMatch ? '' : displayBpmMatch[0]
  if (!displayBPM.length) {
    const trueBPMs = data
      .match(/(?<=#BPMS:)[^;]*(?=;)/)[0]
      .replace(/\s+/g, '')
      .split(',')
      .map((entry) => Number(entry.substring(entry.indexOf('=') + 1)))
    const minBPM = trueBPMs.reduce((a, b) => Math.min(a, b))
    const maxBPM = trueBPMs.reduce((a, b) => Math.max(a, b))
    if (minBPM === maxBPM) return Math.round(maxBPM).toString()
    return `${Math.round(minBPM)}-${Math.round(maxBPM)}`
  }
  if (displayBPM === '*') return '???'
  if (displayBPM.includes(':')) {
    const bpms = displayBPM.split(':')
    const minBPM = Math.round(Number(bpms[0]))
    const maxBPM = Math.round(Number(bpms[1]))
    return `${minBPM}-${maxBPM}`
  } // else: displayBPM is a single number
  return Math.round(Number(displayBPM)).toString()
}

function getSimfileField (data, field) {
  const match = data.match(new RegExp(`(?<=#${field}:).*(?=;)`))
  return !match ? '' : match[0]
}

function parseSimfileData (data, fileExtension) {
  if (fileExtension !== '.sm' && fileExtension !== '.ssc') return {}

  return {
    title: getSimfileField(data, 'TITLE'),
    subtitle: getSimfileField(data, 'SUBTITLE'),
    artist: getSimfileField(data, 'ARTIST'),
    titleTranslit: getSimfileField(data, 'TITLETRANSLIT'),
    subtitleTranslit: getSimfileField(data, 'SUBTITLETRANSLIT'),
    artistTranslit: getSimfileField(data, 'ARTISTTRANSLIT'),
    genre: getSimfileField(data, 'GENRE'),
    displayBPM: getDisplayBPM(data),
    begLevel: getChartLevel(data, fileExtension, 'dance-single', 'Beginner'),
    bspLevel: getChartLevel(data, fileExtension, 'dance-single', 'Easy'),
    dspLevel: getChartLevel(data, fileExtension, 'dance-single', 'Medium'),
    espLevel: getChartLevel(data, fileExtension, 'dance-single', 'Hard'),
    cspLevel: getChartLevel(data, fileExtension, 'dance-single', 'Challenge'),
    bdpLevel: getChartLevel(data, fileExtension, 'dance-double', 'Easy'),
    ddpLevel: getChartLevel(data, fileExtension, 'dance-double', 'Medium'),
    edpLevel: getChartLevel(data, fileExtension, 'dance-double', 'Hard'),
    cdpLevel: getChartLevel(data, fileExtension, 'dance-double', 'Challenge'),
  }
}

// ===========================================================================
// Main Process Methods for Renderer
// ===========================================================================

// Electron ==================================================================

ipcMain.on('init-download-path', (event) => {
  const downloadPath = path.join(app.getPath('userData'), 'Songs')
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath)
  }
  event.returnValue = downloadPath
})

ipcMain.on('get-download-path', (event, downloadPath, bucketName) => {
  const bucketPath = path.join(downloadPath, bucketName)
  if (!fs.existsSync(bucketPath)) {
    fs.mkdirSync(bucketPath)
  }
  event.returnValue = bucketPath
})

ipcMain.on('get-preferences-ini-path', (event) => {
  let files

  if (process.platform === 'win32') {
    files = glob
      .sync('StepMania 5*/Save/Preferences.ini', {
        cwd: '/Games',
        absolute: true,
      })
      .concat(
        glob.sync('StepMania 5*/Save/Preferences.ini', {
          cwd: app.getPath('appData'),
          absolute: true,
        })
      )
      .map((str) => str.replace(/\//g, '\\'))
  } else if (process.platform === 'darwin') {
    // macOS
    files = glob.sync('StepMania 5*/Preferences.ini', {
      cwd: path.join(app.getPath('home'), 'Library', 'Preferences'),
      absolute: true,
    })
  } else {
    // Linux (any)
    files = glob.sync('.stepmania-5*/Save/Preferences.ini', {
      cwd: app.getPath('home'),
      absolute: true,
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
    properties: ['openDirectory', 'createDirectory', 'showHiddenFiles'],
  })
})

ipcMain.on('open-ini-file-dialog', (event) => {
  event.returnValue = dialog.showOpenDialogSync(mainWindow, {
    title: 'Open Preferences.ini File',
    filters: [
      { name: 'Initialization Files', extensions: ['ini'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile', 'showHiddenFiles'],
  })
})

ipcMain.on('open-song-list', (event, songList, bucketName) => {
  songListWindow.setTitle('Song List: ' + bucketName)
  songListWindow.webContents.send('song-list-data', songList)
  songListWindow.show()
})

// File System ===============================================================

ipcMain.on('add-paths-preferences-ini', (event, iniFiles, paths) => {
  for (let file of iniFiles) {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) return

      const newData = data.replace(/(?<=AdditionalSongFolders=).*/, (match) => {
        let newPaths = new Set(match.length ? match.split(',') : [])
        for (let path of paths) {
          newPaths.add(path)
        }
        return [...newPaths].join(',')
      })

      fs.writeFile(file, newData, () => {})
    })
  }
})

ipcMain.on('delete-paths-preferences-ini', (event, iniFiles, paths) => {
  for (let file of iniFiles) {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) return

      const newData = data.replace(/(?<=AdditionalSongFolders=).*/, (match) => {
        let newPaths = new Set(match.length ? match.split(',') : [])
        for (let path of paths) {
          newPaths.delete(path)
        }
        return [...newPaths].join(',')
      })

      fs.writeFile(file, newData, () => {})
    })
  }
})

ipcMain.handle('list-sm-files', (event, folderPath) => {
  let files = []
  const packPaths = fs.readdirSync(folderPath)
  for (let packPath of packPaths) {
    const packFullPath = path.join(folderPath, packPath)
    if (fs.lstatSync(packFullPath).isDirectory()) {
      const packFiles = readDir(packFullPath).filter((fileName) => {
        if (path.extname(fileName) === '.sm') {
          // Remove .sm file if an .ssc file for the same song exists
          return !fs.existsSync(fileName.slice(0, fileName.length - 1) + 'sc')
        }
        return path.extname(fileName) === '.ssc'
      })
      files.push(packFiles)
    }
  }
  return files
})

ipcMain.handle('read-sm-files', (event, files) => {
  return files.map((group) => {
    return group.map((file) => {
      try {
        const data = fs.readFileSync(file, 'utf8')
        return parseSimfileData(data, path.extname(file))
      } catch (err) {
        return { error: err }
      }
    })
  })
})

// Auto-launcher =============================================================

ipcMain.on('is-auto-launch-enabled', async (event) => {
  event.returnValue = await autoLauncher.isEnabled()
})

ipcMain.handle('enable-auto-launch', () => {
  return autoLauncher.enable()
})

ipcMain.handle('disable-auto-launch', () => {
  return autoLauncher.disable()
})

// AWS S3 ====================================================================

ipcMain.on('sync-bucket', (event, bucketName, downloadPath) => {
  const dl = s3.createClient().downloadDir({
    localDir: downloadPath,
    s3Params: {
      Bucket: bucketName,
      Prefix: '',
    },
    deleteRemoved: true,
  })

  dl.on('error', (err) => event.reply('sync-error', err))
  dl.on('progress', () =>
    event.reply('sync-progress', dl.progressAmount / dl.progressTotal)
  )
  dl.on('end', () => event.reply('sync-end'))
})

ipcMain.on('sync-song-list', (event, bucketName, downloadPath) => {
  const dl = s3.createClient().downloadDir({
    localDir: downloadPath,
    s3Params: {
      Bucket: bucketName,
      Prefix: '',
    },
    getS3Params: (localFile, s3Object, callback) => {
      const ext = path.extname(s3Object.Key)
      if (ext === '.sm' || ext === '.ssc') {
        callback(null, {})
      } else {
        callback(null, null)
      }
    },
  })

  dl.on('error', (err) => event.reply('sync-error', err))
  dl.on('progress', () =>
    event.reply('sync-progress', dl.progressAmount / dl.progressTotal)
  )
  dl.on('end', () => event.reply('sync-end'))
})
