<template>
  <q-card class="q-mb-lg">
    <q-card-section>
      <div class="text-h6">{{ name }}</div>
      <div class="text-caption">S3 Bucket: {{ bucketName }}</div>
      <div v-if="description.length" class="text-body2 q-pt-sm">
        {{ description }}
      </div>
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
        Last Updated:
        {{
          new Date(lastUpdated).toLocaleString(
            this.$q.localStorage.getItem('Locale')
          )
        }}
      </div>

      <q-space />

      <q-btn
        no-wrap
        no-caps
        :disable="loading || songListLoading"
        color="primary"
        :icon="isDownloaded ? 'sync' : 'download'"
        :label="isDownloaded ? 'Update' : 'Download'"
        class="btn-icon-left-padding-sm"
        size="md"
        padding="xs md xs sm"
        @click="syncFunction"
      />
      <q-btn
        no-wrap
        no-caps
        :disable="loading || songListLoading"
        color="accent"
        icon="list"
        label="View Song List"
        class="btn-icon-left-padding-sm"
        size="md"
        padding="xs md xs sm"
        @click="getSongListLocal"
      />
      <q-btn
        no-wrap
        no-caps
        :disable="loading || songListLoading"
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
        :disable="isAdded()"
        color="positive"
        :icon="isAdded() ? 'done' : 'add'"
        :label="isAdded() ? 'Added' : 'Add'"
        class="btn-icon-left-padding-sm"
        size="md"
        padding="xs md xs sm"
        @click="addRepo"
      />
    </q-card-actions>

    <q-card-section v-if="loading" class="q-pt-none">
      <q-linear-progress v-if="isNaN(progress)" indeterminate />
      <q-linear-progress v-else :value="progress" />
    </q-card-section>
    <q-card-section v-else-if="songListLoading" class="q-pt-none">
      <q-linear-progress v-if="isNaN(songListProgress)" indeterminate />
      <q-linear-progress v-else :value="songListProgress" />
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
    bucketName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    route: {
      type: String,
      required: true,
    },
    isDownloaded: {
      type: Boolean,
      default: false,
    },
    lastUpdated: {
      type: String,
      default: new Date().toISOString(),
    },
    localPath: {
      type: String,
      default: '',
    },
    syncFunction: {
      type: Function,
      default: () => {
        return
      },
    },
    deleteFunction: {
      type: Function,
      default: () => {
        return
      },
    },
    loading: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: NaN,
    },
  },

  data () {
    return {
      songListLoading: false,
      songListProgress: NaN,
    }
  },

  methods: {
    isAdded () {
      return (
        this.$q.localStorage
          .getItem('RepositoryList')
          .find((repo) => repo.bucketName === this.bucketName) !== undefined
      )
    },
    addRepo () {
      // TODO: add local repo path to Preferences.ini files
      let repoList = this.$q.localStorage.getItem('RepositoryList')
      repoList.push({
        name: this.name,
        bucketName: this.bucketName,
        description: this.description,
        isDownloaded: false,
        loading: false,
        progress: null,
        lastUpdated: new Date().toISOString(),
        localPath: window.electron.getDownloadPath(
          this.$q.localStorage.getItem('DownloadPath'),
          this.bucketName
        ),
      })
      this.$q.localStorage.set('RepositoryList', repoList)
      this.$router.push('/')
    },
    getSongListLocal () {
      // TODO: pause current timer for syncAllRepos
      // TODO: disable all repo buttons, show loading animation

      // TODO: if found, parse all local .sm and .ssc files
      // TODO: else, download .sm and .ssc files from bucket first
      this.songListLoading = true
      window.aws.s3SyncSongList(this.bucketName, this.localPath)
      window.aws.subscribeSyncEvents(
        (err) => {
          // TODO: display error message
          console.log(err)
          window.aws.unsubscribeSyncEvents()
          this.songListLoading = false
        },
        (progress) => (this.songListProgress = progress),
        () => {
          window.aws.unsubscribeSyncEvents()
          this.songListLoading = false
          // TODO: parse all local .sm and .ssc files
        }
      )
    },
  },
})
</script>
