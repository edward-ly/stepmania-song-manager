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
          :sync-function="() => syncRepo(index)"
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

    function syncRepo (index) {
      // TODO: clear current timer for syncAllRepos
      // TODO: disable all repo buttons, show loading animation
      let repo = repoList.value[index]
      repo.loading = true
      window.aws.s3Sync(repo.bucketName, repo.localPath)
      window.aws.subscribeSyncEvents(
        (err) => {
          // TODO: display error message
          console.log(err)
          window.aws.unsubscribeSyncEvents()
          repo.loading = false
        },
        (progress) => (repo.progress = progress),
        () => {
          window.aws.unsubscribeSyncEvents()
          repo.isDownloaded = true
          repo.loading = false
          repo.lastUpdated = new Date().toISOString()
          $q.localStorage.set('RepositoryList', repoList.value)
          // TODO: set timer for next call to syncAllRepos
        }
      )
    }

    function deleteRepo (index) {
      $q.dialog({
        component: ConfirmDialog,
        componentProps: {
          message: 'Are you sure you want to remove this repository?',
        },
      }).onOk(() => {
        // TODO: remove local repo path from Preferences.ini files
        this.repoList.splice(index, 1)
        $q.localStorage.set('RepositoryList', repoList.value)
      })
    }

    return {
      repoList,
      syncRepo,
      deleteRepo,
    }
  },
})
</script>
