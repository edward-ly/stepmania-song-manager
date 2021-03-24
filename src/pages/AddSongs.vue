<template>
  <q-page class="q-pa-lg">
    <div class="row">
      <div class="col-auto">
        <div class="text-h5 q-my-none">Select a Repository</div>
      </div>
      <div class="col" />
      <div class="col-auto q-my-auto">
        <q-btn
          no-wrap
          no-caps
          color="primary"
          icon="add"
          label="Add Custom Repo"
          class="btn-icon-left-padding-sm"
          size="md"
          padding="xs md xs sm"
          @click="addCustomRepo"
        />
      </div>
    </div>
    <div class="row q-pt-lg">
      <div class="col">
        <RepositoryCard
          v-for="repo in defaultRepos"
          :key="repo.bucketName"
          v-bind="repo"
          :route="this.$route.path"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import RepositoryCard from 'components/RepositoryCard.vue'
import defaultRepos from 'components/defaultRepos'
import AddRepoDialog from 'components/dialogs/AddRepoDialog.vue'

export default defineComponent({
  components: {
    RepositoryCard,
  },

  setup () {
    const $q = useQuasar()
    const router = useRouter()

    function addCustomRepo () {
      // TODO: add local repo path to Preferences.ini files
      $q.dialog({ component: AddRepoDialog }).onOk((data) => {
        data.isDownloaded = false
        data.lastUpdated = new Date().toISOString()
        data.localPath = window.electron.getDownloadPath($q.localStorage.getItem('DownloadPath'), data.bucketName)

        let repoList = $q.localStorage.getItem('RepositoryList')
        repoList.push(data)
        $q.localStorage.set('RepositoryList', repoList)
        router.push('/')
      })
    }

    return {
      defaultRepos,
      addCustomRepo,
    }
  },
})
</script>
