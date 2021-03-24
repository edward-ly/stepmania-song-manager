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
  initDownloadPath: () => {
    return ipcRenderer.sendSync('init-download-path')
  },
  getDownloadPath: (downloadPath, bucketName) => {
    return ipcRenderer.sendSync('get-download-path', downloadPath, bucketName)
  },
  getPreferencesIniPath: () => {
    return ipcRenderer.sendSync('get-preferences-ini-path')
  },
  openExternal: async (url) => {
    return await ipcRenderer.invoke('open-external', url)
  },
  openFolderDialog: (currentPath) => {
    return ipcRenderer.sendSync('open-folder-dialog', currentPath)
  },
  openIniFileDialog: () => {
    return ipcRenderer.sendSync('open-ini-file-dialog')
  },
})

contextBridge.exposeInMainWorld('autoLaunch', {
  isEnabled: () => {
    return ipcRenderer.sendSync('is-auto-launch-enabled')
  },
  enable: async () => {
    return await ipcRenderer.invoke('enable-auto-launch')
  },
  disable: async () => {
    return await ipcRenderer.invoke('disable-auto-launch')
  },
})
