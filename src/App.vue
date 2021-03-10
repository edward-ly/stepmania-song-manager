<template>
  <router-view />
</template>

<script>
import { defineComponent, onMounted } from 'vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  setup () {
    onMounted(() => {
      const $q = useQuasar()

      // Initialize Local Storage
      if (!$q.localStorage.has('RepositoryList')) {
        $q.localStorage.set('RepositoryList', []);
      }

      if (!$q.localStorage.has('DownloadPath')) {
        $q.localStorage.set('DownloadPath', window.electron.initDownloadPath())
      }
      if (!$q.localStorage.has('PreferencesIniPath')) {
        $q.localStorage.set('PreferencesIniPath', window.electron.getPreferencesIniPath())
      }
      if (!$q.localStorage.has('AutoLaunchOnLogin')) {
        $q.localStorage.set('AutoLaunchOnLogin', true);
      }
      if (!$q.localStorage.has('UpdateInterval')) {
        $q.localStorage.set('UpdateInterval', 3600000);
      }
      if (!$q.localStorage.has('Locale')) {
        $q.localStorage.set('Locale', 'en-US');
      }
    })
  }
})
</script>
