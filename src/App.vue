<template>
  <router-view />
</template>

<script>
import { defineComponent, onMounted } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  setup () {
    onMounted(() => {
      const $q = useQuasar()

      $q.loading.show({
        message: 'Initializing. Please wait...',
      })

      // Initialize Local Storage
      if (!$q.localStorage.has('RepositoryList')) {
        $q.localStorage.set('RepositoryList', [])
      }

      if (!$q.localStorage.has('DownloadPath')) {
        $q.localStorage.set('DownloadPath', window.electron.initDownloadPath())
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
      if (!$q.localStorage.has('Locale')) {
        $q.localStorage.set('Locale', 'en-US')
      }

      $q.loading.hide()

      // Check if Git LFS is installed, and initialize it if not
      // window.electron.initGitLfs().then((res) => {
      //   if (res.code !== 0) {
      //     $q.dialog({
      //       title: 'Error',
      //       message: res.errorMessage,
      //       ok: 'Quit',
      //       cancel: 'Continue Anyway',
      //       persistent: true,
      //     }).onOk(() => {
      //       window.close()
      //     })
      //   }
      // })
    })
  },
})
</script>
