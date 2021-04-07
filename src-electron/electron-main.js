import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  nativeTheme,
  shell,
} from 'electron'
import path from 'path'
import fs from 'fs-extra'
import glob from 'glob'
import _ from 'lodash'
import AutoLaunch from 'auto-launch'
import { autoUpdater } from 'electron-updater'
// TODO: replace with native '@aws-sdk/client-s3' package and md5 file caching
import s3 from '@auth0/s3'

const appLock = app.requestSingleInstanceLock()
if (!appLock) {
  app.quit()
}

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
    frame: false,
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

  mainWindow.on('close', () => {
    songListWindow.destroy()
    songListWindow = null
    mainWindow.destroy()
  })

  mainWindow.on('closed', () => {
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
    frame: false,
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

app.on('second-instance', () => {
  // someone tried to run a second instance, we should focus our window
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify()
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
  const displayBpmMatch = data.match(/(?<=#DISPLAYBPM:).*(?=;\s*#BPMS:)/)
  const displayBPM = !displayBpmMatch ? '' : displayBpmMatch[0]
  if (!displayBPM) {
    const trueBPMs = data
      .match(/(?<=#BPMS:)[^;]*(?=;)/)[0]
      .replace(/\s+/g, '')
      .split(',')
      .map((entry) => Number(entry.substring(entry.indexOf('=') + 1)))
    const minBPM = _.round(_.min(trueBPMs))
    const maxBPM = _.round(_.max(trueBPMs))
    return minBPM === maxBPM ? `${maxBPM}` : `${minBPM}-${maxBPM}`
  }
  if (displayBPM === '*') return '???'
  const bpms = displayBPM.split(':')
  const minBPM = _.round(Number(bpms[0]))
  if (bpms.length > 1) {
    const maxBPM = _.round(Number(bpms[1]))
    return `${minBPM}-${maxBPM}`
  }
  return minBPM.toString()
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

ipcMain.handle('init-download-path', async () => {
  try {
    const downloadPath = path.join(app.getPath('userData'), 'Songs')
    await fs.ensureDir(downloadPath)
    return downloadPath
  } catch (err) {
    return ''
  }
})

ipcMain.handle('get-download-path', async (event, downloadPath, bucketName) => {
  try {
    const bucketPath = path.join(downloadPath, bucketName)
    await fs.ensureDir(bucketPath)
    return bucketPath
  } catch (err) {
    return ''
  }
})

ipcMain.on('get-preferences-ini-path', (event) => {
  switch (process.platform) {
    case 'win32': {
      const files = _.concat(
        glob.sync('StepMania 5*/Save/Preferences.ini', {
          cwd: '/Games',
          absolute: true,
        }),
        glob.sync('StepMania 5*/Save/Preferences.ini', {
          cwd: app.getPath('appData'),
          absolute: true,
        })
      )
      event.returnValue = _.map(files, (str) => str.replace(/\//g, '\\'))
      break
    }
    case 'darwin': {
      event.returnValue = glob.sync('StepMania 5*/Preferences.ini', {
        cwd: path.join(app.getPath('home'), 'Library', 'Preferences'),
        absolute: true,
      })
      break
    }
    default: {
      event.returnValue = glob.sync('.stepmania-5*/Save/Preferences.ini', {
        cwd: app.getPath('home'),
        absolute: true,
      })
    }
  }
})

ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url)
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
  songListWindow.webContents.send('song-list-data', songList, bucketName)
  songListWindow.show()
})

// Window ====================================================================

ipcMain.on('minimize', () => {
  BrowserWindow.getFocusedWindow().minimize()
})

ipcMain.on('toggle-maximize', () => {
  const win = BrowserWindow.getFocusedWindow()

  if (win.isMaximized()) {
    win.unmaximize()
  } else {
    win.maximize()
  }
})

ipcMain.on('window-close', () => {
  BrowserWindow.getFocusedWindow().close()
})

// File System ===============================================================

ipcMain.on('add-paths-preferences-ini', (event, iniFiles, paths) => {
  for (let file of iniFiles) {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) return

      const newData = data.replace(/(?<=AdditionalSongFolders=).*/, (match) => {
        const iniPaths = match ? match.replace(/\\/g, '/').split(',') : []
        const newPaths = paths.map((path) => path.replace(/\\/g, '/'))
        return _.union(iniPaths, newPaths).join(',')
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
        const iniPaths = match ? match.replace(/\\/g, '/').split(',') : []
        const newPaths = paths.map((path) => path.replace(/\\/g, '/'))
        return _.difference(iniPaths, newPaths).join(',')
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
      let packName = packPath
      const packFiles = readDir(packFullPath)
      const groupIni = packFiles.find((el) => el.endsWith('group.ini'))
      if (groupIni) {
        try {
          const data = fs.readFileSync(groupIni, 'utf8')
          const newPackName = getSimfileField(data, 'NAME')
          if (newPackName) packName = newPackName
        } catch (err) {
          /* continue */
        }
      }
      const songFiles = packFiles.filter((fileName) => {
        if (path.extname(fileName) === '.sm') {
          // Remove .sm file if an .ssc file for the same song exists
          return !fs.existsSync(fileName.slice(0, fileName.length - 1) + 'sc')
        }
        return path.extname(fileName) === '.ssc'
      })
      files.push({
        name: packName,
        songs: songFiles,
      })
    }
  }
  return files
})

ipcMain.handle('read-sm-files', (event, packs) => {
  return packs.map((pack) => {
    let packData = pack
    packData.songs = pack.songs
      .map((file) => {
        try {
          const data = fs.readFileSync(file, 'utf8')
          return parseSimfileData(data, path.extname(file))
        } catch (err) {
          return null
        }
      })
      .filter((data) => !!data)
    return packData
  })
})

// Auto-launcher =============================================================

ipcMain.on('is-auto-launch-enabled', async (event) => {
  event.returnValue = await autoLauncher.isEnabled()
})

ipcMain.on('enable-auto-launch', () => {
  autoLauncher.enable()
})

ipcMain.on('disable-auto-launch', () => {
  autoLauncher.disable()
})

// AWS S3 ====================================================================

ipcMain.on('sync-bucket', (event, bucket, credentials) => {
  let s3Params = {
    s3Options: {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
      sessionToken: credentials.SessionToken,
    },
  }
  if (bucket.endpoint) s3Params.s3Options.endpoint = bucket.endpoint

  const dlParams = {
    localDir: bucket.localPath,
    s3Params: {
      Bucket: bucket.name,
      Prefix: '',
    },
    deleteRemoved: true,
  }

  const dl = s3.createClient(s3Params).downloadDir(dlParams)
  dl.on('error', (err) => event.reply('sync-error', err))
  dl.on('progress', () =>
    event.reply('sync-progress', dl.progressAmount / dl.progressTotal)
  )
  dl.on('end', () => event.reply('sync-end'))
})

ipcMain.on('sync-song-list', (event, bucket, credentials) => {
  let s3Params = {
    s3Options: {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
      sessionToken: credentials.SessionToken,
    },
  }
  if (bucket.endpoint) s3Params.s3Options.endpoint = bucket.endpoint

  const dlParams = {
    localDir: bucket.localPath,
    s3Params: {
      Bucket: bucket.name,
      Prefix: '',
    },
    getS3Params: (localFile, s3Object, callback) => {
      const ext = path.extname(s3Object.Key)
      if (ext === '.sm' || ext === '.ssc' || ext === '.ini') {
        callback(null, {})
      } else {
        callback(null, null)
      }
    },
  }

  const dl = s3.createClient(s3Params).downloadDir(dlParams)
  dl.on('error', (err) => event.reply('sync-error', err))
  dl.on('progress', () =>
    event.reply('sync-progress', dl.progressAmount / dl.progressTotal)
  )
  dl.on('end', () => event.reply('sync-end'))
})
