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

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  initGitLfs: async () => {
    return await ipcRenderer.invoke('init-git-lfs')
  },
  initDownloadPath: () => {
    return ipcRenderer.sendSync('init-download-path')
  },
  getPreferencesIniPath: () => {
    return ipcRenderer.sendSync('get-preferences-ini-path')
  },
  openFolderDialog: (currentPath) => {
    return ipcRenderer.sendSync('open-folder-dialog', currentPath)
  },
  openIniFileDialog: () => {
    return ipcRenderer.sendSync('open-ini-file-dialog')
  }
})
