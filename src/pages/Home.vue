<template>
  <q-page class="q-pt-lg q-px-lg q-pb-xl">
    <div class="row">
      <div class="col-auto">
        <div class="text-h5 q-my-none">Installed Packs</div>
      </div>
      <div class="col" />
      <div class="col-auto q-my-auto">
        <q-btn
          to="/add"
          no-wrap
          no-caps
          :disable="disableAddSongs"
          color="positive"
          icon="add"
          label="Add Songs"
          class="btn-icon-left-padding-sm"
          size="md"
          padding="xs md xs sm"
        />
      </div>
    </div>
    <div class="row q-pt-lg">
      <div class="col">
        <RepositoryCard
          v-for="(repo, index) in repoList"
          :key="repo.bucketName"
          v-bind="repo"
          :route="this.$route.path"
          :sync-function="() => syncOneRepo(index)"
          :get-song-list-function="() => getSongList(index)"
          :close-error-message-function="() => closeErrorMessage(index)"
          :delete-function="() => deleteRepo(index)"
        />

        <EmptyMessage :show="!repoList.length" icon="info">
          No song packs installed.<br />Click on "+ Add Songs" to get started!
        </EmptyMessage>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import RepositoryCard from 'components/RepositoryCard.vue'
import ConfirmDialog from 'components/dialogs/ConfirmDialog.vue'
import EmptyMessage from 'components/EmptyMessage.vue'

export default defineComponent({
  components: {
    RepositoryCard,
    EmptyMessage,
  },

  setup () {
    const $q = useQuasar()

    const disableAddSongs = ref(false)
    const repoList = ref($q.localStorage.getItem('RepositoryList'))
    const syncAllReposTimer = setSyncAllReposInitTimeout()

    function setSyncAllReposInitTimeout () {
      const interval = $q.localStorage.getItem('UpdateInterval')
      if (interval < 0) return ref(null)
      return ref(setTimeout(syncAllRepos, interval))
    }

    function setSyncAllReposTimeout () {
      const interval = $q.localStorage.getItem('UpdateInterval')
      if (interval >= 0) {
        syncAllReposTimer.value = setTimeout(syncAllRepos, interval)
      }
    }

    function setLoadingStatus (index, status) {
      disableAddSongs.value = status
      repoList.value[index].loading = status
      repoList.value = repoList.value.map((repo) => {
        repo.disable = status
        return repo
      })
      $q.localStorage.set('RepositoryList', repoList.value)
    }

    function setSongListLoadingStatus (index, status) {
      disableAddSongs.value = status
      repoList.value[index].songListLoading = status
      repoList.value = repoList.value.map((repo) => {
        repo.disable = status
        return repo
      })
      $q.localStorage.set('RepositoryList', repoList.value)
    }

    function getRoleEndpoint (endpoint) {
      let roleEndpoint = '/getRole'
      if (endpoint.endsWith('amazonaws.com')) roleEndpoint += 'S3'
      if (endpoint.endsWith('backblazeb2.com')) roleEndpoint += 'B2'
      return roleEndpoint
    }

    function syncRepo (index) {
      return new Promise((resolve) => {
        let repo = repoList.value[index]

        api
          .get(getRoleEndpoint(repo.endpoint))
          .then((res) => {
            const bucket = {
              name: repo.bucketName,
              localPath: repo.localPath,
              endpoint: repo.endpoint,
              region: repo.region,
            }
            window.aws.s3Sync(bucket, res.data.credentials)
            window.aws.subscribeSyncEvents(
              (err) => {
                window.aws.unsubscribeSyncEvents()
                resolve(err)
              },
              (progress) => (repo.progress = progress),
              () => {
                window.aws.unsubscribeSyncEvents()
                repo.isDownloaded = true
                repo.lastUpdated = new Date().toISOString()
                $q.localStorage.set('RepositoryList', repoList.value)
                resolve(null)
              }
            )
          })
          .catch((err) => resolve(err))
      })
    }

    function syncSongList (index) {
      return new Promise((resolve) => {
        let repo = repoList.value[index]

        api
          .get(getRoleEndpoint(repo.endpoint))
          .then((res) => {
            const bucket = {
              name: repo.bucketName,
              localPath: repo.localPath,
              endpoint: repo.endpoint,
              region: repo.region,
            }
            window.aws.s3SyncSongList(bucket, res.data.credentials)
            window.aws.subscribeSyncEvents(
              (err) => {
                window.aws.unsubscribeSyncEvents()
                resolve(err)
              },
              () => {},
              () => {
                window.aws.unsubscribeSyncEvents()
                resolve(null)
              }
            )
          })
          .catch((err) => resolve(err))
      })
    }

    async function syncOneRepo (index) {
      clearTimeout(syncAllReposTimer.value)
      closeErrorMessage(index)
      setLoadingStatus(index, true)

      const err = await syncRepo(index)
      if (err) repoList.value[index].error = err.toString()

      setLoadingStatus(index, false)
      setSyncAllReposTimeout()
    }

    async function syncAllRepos () {
      clearTimeout(syncAllReposTimer.value)
      closeAllErrorMessages()

      for (let i = 0; i < repoList.value.length; i++) {
        if (repoList.value[i].isDownloaded) {
          setLoadingStatus(i, true)

          const err = await syncRepo(i)
          if (err) repoList.value[i].error = err.toString()

          setLoadingStatus(i, false)
        }
      }

      setSyncAllReposTimeout()
    }

    async function getSongList (index) {
      clearTimeout(syncAllReposTimer.value)
      closeErrorMessage(index)
      setSongListLoadingStatus(index, true)
      let repo = repoList.value[index]

      let files = await window.fs.getSongList(repo.localPath)
      if (!files.length) {
        const err = await syncSongList(index)
        if (err) {
          repo.error = err.toString()
          setSongListLoadingStatus(index, false)
          setSyncAllReposTimeout()
          return
        }
        files = await window.fs.getSongList(repo.localPath)
      }

      const songList = await window.fs.readSongList(files)
      window.electron.openSongListWindow(songList, repo.name)
      setSongListLoadingStatus(index, false)
      setSyncAllReposTimeout()
    }

    function closeErrorMessage (index) {
      repoList.value[index].error = ''
      $q.localStorage.set('RepositoryList', repoList.value)
    }

    function closeAllErrorMessages () {
      repoList.value = repoList.value.map((repo) => {
        repo.error = ''
        return repo
      })
      $q.localStorage.set('RepositoryList', repoList.value)
    }

    function deleteRepo (index) {
      clearTimeout(syncAllReposTimer.value)

      $q.dialog({
        component: ConfirmDialog,
        componentProps: {
          message:
            'Are you sure you want to remove this bucket? No files will be deleted, but all songs in this bucket will be removed from StepMania.',
        },
      })
        .onOk(() => {
          window.fs.deletePathsFromPreferencesIni(
            $q.localStorage.getItem('PreferencesIniPath'),
            [repoList.value[index].localPath]
          )

          this.repoList.splice(index, 1)
          $q.localStorage.set('RepositoryList', repoList.value)
        })
        .onDismiss(() => {
          setSyncAllReposTimeout()
        })
    }

    onMounted(() => {
      repoList.value = repoList.value.map((repo) => {
        repo.error = ''
        repo.disable = false
        repo.loading = false
        repo.songListLoading = false
        return repo
      })
      $q.localStorage.set('RepositoryList', repoList.value)
    })

    return {
      disableAddSongs,
      repoList,
      syncOneRepo,
      getSongList,
      closeErrorMessage,
      deleteRepo,
    }
  },
})
</script>
