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
  return readDir(folderPath).filter((fileName) => {
    if (path.extname(fileName) === '.sm') {
      // Remove .sm file if an .ssc file for the same song exists
      return !fs.existsSync(fileName.slice(0, fileName.length - 1) + 'sc')
    }
    return path.extname(fileName) === '.ssc'
  })
})

// TODO: parse all local .sm and .ssc files
// ipcMain.handle('read-sm-files', (event, files) => {
//   let songList = []
//   for (let file of files) {
//     try {
//       const data = fs.readFileSync(file, 'utf8')
//       console.log(data)
//
//       songList.push({})
//     } catch (err) {
//       console.error(err)
//     }
//   }
// })

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
