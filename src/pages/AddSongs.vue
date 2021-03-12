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
          :key="repo.url"
          v-bind="repo"
          :route="this.$route.path"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { useQuasar } from 'quasar'
import RepositoryCard from 'components/RepositoryCard.vue'
import defaultRepos from 'components/defaultRepos'

export default defineComponent({
  components: {
    RepositoryCard,
  },

  setup () {
    const $q = useQuasar()

    function addCustomRepo () {
      // TODO: add dialog for new custom repo
      $q.dialog({
        title: 'New Repository',
        prompt: {
          model: '',
          type: 'text', // optional
        },
        cancel: true,
        persistent: true,
      }).onOk((data) => {
        console.log('>>>> OK, received', data)
      })
    }

    return {
      defaultRepos,
      addCustomRepo,
    }
  },
})
</script>
