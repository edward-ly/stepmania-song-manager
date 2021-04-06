/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   const { contextBridge } = require('electron')
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  initDownloadPath: async () => {
    return await ipcRenderer.invoke('init-download-path')
  },
  getDownloadPath: async (downloadPath, bucketName) => {
    return await ipcRenderer.invoke(
      'get-download-path',
      downloadPath,
      bucketName
    )
  },
  getPreferencesIniPath: () => {
    return ipcRenderer.sendSync('get-preferences-ini-path')
  },
  openExternal: (url) => {
    ipcRenderer.send('open-external', url)
  },
  openFolderDialog: (currentPath) => {
    return ipcRenderer.sendSync('open-folder-dialog', currentPath)
  },
  openIniFileDialog: () => {
    return ipcRenderer.sendSync('open-ini-file-dialog')
  },
  openSongListWindow: (songList, bucketName) => {
    ipcRenderer.send('open-song-list', songList, bucketName)
  },
  getSongListData: (callback) => {
    ipcRenderer.on('song-list-data', (event, songList, bucketName) => {
      callback(songList, bucketName)
    })
  },
})

contextBridge.exposeInMainWorld('windowAPI', {
  minimize: () => {
    ipcRenderer.send('minimize')
  },
  toggleMaximize: () => {
    ipcRenderer.send('toggle-maximize')
  },
  close: () => {
    ipcRenderer.send('window-close')
  },
})

contextBridge.exposeInMainWorld('fs', {
  addPathsToPreferencesIni: (iniFiles, paths) => {
    ipcRenderer.send('add-paths-preferences-ini', iniFiles, paths)
  },
  deletePathsFromPreferencesIni: (iniFiles, paths) => {
    ipcRenderer.send('delete-paths-preferences-ini', iniFiles, paths)
  },
  getSongList: async (folderPath) => {
    return await ipcRenderer.invoke('list-sm-files', folderPath)
  },
  readSongList: async (files) => {
    return await ipcRenderer.invoke('read-sm-files', files)
  },
})

contextBridge.exposeInMainWorld('autoLaunch', {
  isEnabled: () => {
    return ipcRenderer.sendSync('is-auto-launch-enabled')
  },
  enable: () => {
    ipcRenderer.send('enable-auto-launch')
  },
  disable: () => {
    ipcRenderer.send('disable-auto-launch')
  },
})

contextBridge.exposeInMainWorld('aws', {
  s3Sync: (bucketName, downloadPath, credentials) => {
    ipcRenderer.send('sync-bucket', bucketName, downloadPath, credentials)
  },
  s3SyncSongList: (bucketName, downloadPath, credentials) => {
    ipcRenderer.send('sync-song-list', bucketName, downloadPath, credentials)
  },
  subscribeSyncEvents: (errorCallback, progressCallback, endCallback) => {
    ipcRenderer.on('sync-error', (event, err) => {
      errorCallback(err)
    })
    ipcRenderer.on('sync-progress', (event, progress) => {
      progressCallback(progress)
    })
    ipcRenderer.on('sync-end', () => {
      endCallback()
    })
  },
  unsubscribeSyncEvents: () => {
    ipcRenderer.removeAllListeners('sync-error')
    ipcRenderer.removeAllListeners('sync-progress')
    ipcRenderer.removeAllListeners('sync-end')
  },
})
