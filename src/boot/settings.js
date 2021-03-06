import { LocalStorage } from 'quasar'

export default (app) => {
  if (!LocalStorage.has('DownloadPath')) {
    LocalStorage.set('DownloadPath', window.electron.initDownloadPath())
  }
  if (!LocalStorage.has('PreferencesIniPath')) {
    LocalStorage.set('PreferencesIniPath', window.electron.getPreferencesIniPath())
  }
  if (!LocalStorage.has('AutoLaunchOnLogin')) {
    LocalStorage.set('AutoLaunchOnLogin', true);
  }
  if (!LocalStorage.has('UpdateInterval')) {
    LocalStorage.set('UpdateInterval', 1800000);
  }
  if (!LocalStorage.has('Locale')) {
    LocalStorage.set('Locale', 'en-US');
  }
}
