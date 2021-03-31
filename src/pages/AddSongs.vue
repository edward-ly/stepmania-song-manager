<template>
  <q-page class="q-pt-lg q-px-lg">
    <div class="row">
      <div class="col-auto">
        <div class="text-h5 q-my-none">Select a Bucket</div>
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

    <EmptyMessage :show="!defaultRepos.length" icon="info">
      No repositories found.<br />Click on "+ Add Custom Repo" to add a new
      repository.
    </EmptyMessage>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import RepositoryCard from 'components/RepositoryCard.vue'
import defaultRepos from 'components/defaultRepos'
import AddRepoDialog from 'components/dialogs/AddRepoDialog.vue'
import EmptyMessage from 'components/EmptyMessage.vue'

export default defineComponent({
  components: {
    RepositoryCard,
    EmptyMessage,
  },

  setup () {
    const $q = useQuasar()
    const router = useRouter()

    function addCustomRepo () {
      $q.dialog({ component: AddRepoDialog }).onOk((data) => {
        window.fs.addPathsToPreferencesIni(
          $q.localStorage.getItem('PreferencesIniPath'),
          [data.localPath]
        )

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
