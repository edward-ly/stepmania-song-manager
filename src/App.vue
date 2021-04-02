<template>
  <router-view />
</template>

<script>
import { defineComponent, onMounted } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  setup () {
    onMounted(async () => {
      const $q = useQuasar()

      // Initialize Local Storage
      if (!$q.localStorage.has('RepositoryList')) {
        $q.localStorage.set('RepositoryList', [])
      }

      if (!$q.localStorage.has('DownloadPath')) {
        $q.localStorage.set(
          'DownloadPath',
          await window.electron.initDownloadPath()
        )
      }
      if (!$q.localStorage.has('PreferencesIniPath')) {
        $q.localStorage.set(
          'PreferencesIniPath',
          window.electron.getPreferencesIniPath()
        )
      }
      if (!$q.localStorage.has('UpdateInterval')) {
        $q.localStorage.set('UpdateInterval', 3600000)
      }
    })
  },
})
</script>
