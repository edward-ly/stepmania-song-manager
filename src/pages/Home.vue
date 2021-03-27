<template>
  <q-page class="q-pa-lg">
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
          :delete-function="() => deleteRepo(index)"
        />

        <div v-if="!repoList.length" class="text-muted absolute-center">
          <div class="column items-center q-gutter-y-xs">
            <q-icon name="info" size="xl" color="dark" />
            <div class="text-body1 text-dark text-center">
              No song packs installed.<br />Click on "+ Add Songs" to get
              started!
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useQuasar } from 'quasar'
import RepositoryCard from 'components/RepositoryCard.vue'
import ConfirmDialog from 'components/dialogs/ConfirmDialog.vue'

export default defineComponent({
  components: {
    RepositoryCard,
  },

  setup () {
    const $q = useQuasar()

    const repoList = ref($q.localStorage.getItem('RepositoryList'))
    const syncAllReposTimer = setSyncAllReposInitTimeout()

    function setSyncAllReposInitTimeout () {
      const interval = $q.localStorage.getItem('UpdateInterval')
      if (interval >= 0) {
        return ref(setTimeout(syncAllRepos, interval))
      }
      return ref(null)
    }

    function setSyncAllReposTimeout () {
      const interval = $q.localStorage.getItem('UpdateInterval')
      if (interval >= 0) {
        syncAllReposTimer.value = setTimeout(syncAllRepos, interval)
      }
    }

    function setLoadingStatus (index, status) {
      repoList.value[index].loading = status
      repoList.value = repoList.value.map((repo) => {
        repo.disable = status
        return repo
      })
    }

    function setSongListLoadingStatus (index, status) {
      repoList.value[index].songListLoading = status
      repoList.value = repoList.value.map((repo) => {
        repo.disable = status
        return repo
      })
    }

    function syncRepo (index) {
      return new Promise((resolve) => {
        let repo = repoList.value[index]
        setLoadingStatus(index, true)

        window.aws.s3Sync(repo.bucketName, repo.localPath)
        window.aws.subscribeSyncEvents(
          (err) => {
            window.aws.unsubscribeSyncEvents()
            setLoadingStatus(index, false)
            resolve(err)
          },
          (progress) => (repo.progress = progress),
          () => {
            window.aws.unsubscribeSyncEvents()
            setLoadingStatus(index, false)
            repo.isDownloaded = true
            repo.lastUpdated = new Date().toISOString()
            $q.localStorage.set('RepositoryList', repoList.value)
            resolve(null)
          }
        )
      })
    }

    function syncSongList (index) {
      return new Promise((resolve) => {
        let repo = repoList.value[index]
        setSongListLoadingStatus(index, true)

        window.aws.s3SyncSongList(repo.bucketName, repo.localPath)
        window.aws.subscribeSyncEvents(
          (err) => {
            window.aws.unsubscribeSyncEvents()
            setSongListLoadingStatus(index, false)
            resolve(err)
          },
          (progress) => (repo.songListProgress = progress),
          () => {
            window.aws.unsubscribeSyncEvents()
            setSongListLoadingStatus(index, false)
            repo.lastUpdated = new Date().toISOString()
            $q.localStorage.set('RepositoryList', repoList.value)
            resolve(null)
          }
        )
      })
    }

    async function syncOneRepo (index) {
      clearTimeout(syncAllReposTimer.value)

      const err = await syncRepo(index)
      if (err) {
        // TODO: display error message
        console.log(err)
      }

      setSyncAllReposTimeout()
    }

    async function syncAllRepos () {
      clearTimeout(syncAllReposTimer.value)

      for (let i = 0; i < repoList.value.length; i++) {
        if (repoList.value[i].isDownloaded) {
          const err = await syncRepo(i)
          if (err) {
            // TODO: display error message
            console.log(err)
          }
        }
      }

      setSyncAllReposTimeout()
    }

    async function getSongList (index) {
      clearTimeout(syncAllReposTimer.value)

      // TODO: if no .sm and .ssc files found, download files from bucket first
      const err = await syncSongList(index)
      if (err) {
        // TODO: display error message
        console.log(err)
      }

      // TODO: parse all local .sm and .ssc files

      setSyncAllReposTimeout()
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

    return {
      repoList,
      syncOneRepo,
      getSongList,
      deleteRepo,
    }
  },
})
</script>
