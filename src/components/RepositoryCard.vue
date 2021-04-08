<template>
  <q-card class="q-mb-lg">
    <q-card-section>
      <!-- TODO: add popups to edit name and description -->
      <div class="text-h6">{{ name }}</div>

      <div class="text-caption">S3 Bucket: {{ bucketURL }}</div>

      <div v-if="description" class="text-body2 q-pt-sm">{{ description }}</div>
      <div v-else class="text-body2 text-italic text-muted q-pt-sm">
        No description set.
      </div>
    </q-card-section>

    <q-separator inset />

    <q-card-actions
      v-if="route === '/'"
      align="right"
      class="q-pa-md q-gutter-sm"
    >
      <div
        v-if="route === '/' && isDownloaded"
        class="text-body2 text-italic text-no-wrap"
      >
        Last Updated: {{ lastUpdatedString }}
      </div>

      <q-space />

      <q-btn
        no-wrap
        no-caps
        :disable="disable"
        :loading="loading"
        color="primary"
        :icon="isDownloaded ? 'sync' : 'download'"
        :label="isDownloaded ? 'Update' : 'Download'"
        class="btn-icon-left-padding-sm"
        size="md"
        padding="xs md xs sm"
        @click="syncFunction"
      >
        <template #loading>
          <q-spinner color="white" class="loading-spinner" />
          {{ isDownloaded ? 'Update' : 'Download' }}
        </template>
      </q-btn>
      <q-btn
        no-wrap
        no-caps
        :disable="disable"
        :loading="songListLoading"
        color="accent"
        icon="list"
        label="View Song List"
        class="btn-icon-left-padding-sm"
        size="md"
        padding="xs md xs sm"
        @click="getSongListFunction"
      >
        <template #loading>
          <q-spinner color="white" class="loading-spinner" />
          View Song List
        </template>
      </q-btn>
      <q-btn
        no-wrap
        no-caps
        :disable="disable"
        color="negative"
        icon="delete"
        label="Delete"
        class="btn-icon-left-padding-sm"
        size="md"
        padding="xs md xs sm"
        @click="deleteFunction"
      />
    </q-card-actions>

    <q-card-actions
      v-if="route === '/add'"
      align="right"
      class="q-pa-md q-gutter-sm"
    >
      <q-btn
        no-wrap
        no-caps
        :disable="isAdded"
        color="positive"
        :icon="isAdded ? 'done' : 'add'"
        :label="isAdded ? 'Added' : 'Add'"
        class="btn-icon-left-padding-sm"
        size="md"
        padding="xs md xs sm"
        @click="addRepo"
      />
    </q-card-actions>

    <q-card-section v-if="loading" class="q-pt-none">
      <q-linear-progress v-if="progress || progress === 0" :value="progress" />
      <q-linear-progress v-else indeterminate />
    </q-card-section>

    <q-card-section v-if="error" class="q-pt-none">
      <q-banner inline-actions dense rounded class="text-white bg-negative">
        {{ error }}
        <template #avatar>
          <q-icon name="warning" color="white" />
        </template>
        <template #action>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            @click="closeErrorMessageFunction"
          />
        </template>
      </q-banner>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    name: { type: String, required: true },
    bucketName: { type: String, required: true },
    endpoint: { type: String, default: '' },
    description: { type: String, default: '' },
    route: { type: String, required: true },
    isDownloaded: { type: Boolean, default: false },
    lastUpdated: { type: String, default: new Date().toISOString() },
    localPath: { type: String, default: '' },
    syncFunction: { type: Function, default: () => {} },
    getSongListFunction: { type: Function, default: () => {} },
    closeErrorMessageFunction: { type: Function, default: () => {} },
    deleteFunction: { type: Function, default: () => {} },
    disable: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    songListLoading: { type: Boolean, default: false },
    progress: { type: Number, default: NaN },
    error: { type: String, default: '' },
  },

  computed: {
    bucketURL () {
      if (!this.endpoint) return this.bucketName
      return this.endpoint + '/' + this.bucketName
    },
    lastUpdatedString () {
      return new Date(this.lastUpdated).toLocaleString(this.$i18n.locale)
    },
    isLoading () {
      return this.loading || this.songListLoading
    },
    isAdded () {
      return (
        this.$q.localStorage
          .getItem('RepositoryList')
          .find((repo) => repo.bucketName === this.bucketName) !== undefined
      )
    },
  },

  methods: {
    async addRepo () {
      const localPath = await window.electron.getDownloadPath(
        this.$q.localStorage.getItem('DownloadPath'),
        this.bucketName
      )

      window.fs.addPathsToPreferencesIni(
        this.$q.localStorage.getItem('PreferencesIniPath'),
        [localPath]
      )

      let repoList = this.$q.localStorage.getItem('RepositoryList')
      repoList.push({
        name: this.name,
        bucketName: this.bucketName,
        description: this.description,
        isDownloaded: false,
        disable: false,
        loading: false,
        songListLoading: false,
        progress: null,
        error: '',
        lastUpdated: new Date().toISOString(),
        localPath: localPath,
      })
      this.$q.localStorage.set('RepositoryList', repoList)
      this.$router.push('/')
    },
  },
})
</script>

<style lang="scss" scoped>
.loading-spinner {
  margin-left: -8px;
  margin-right: 8px;
}
</style>
