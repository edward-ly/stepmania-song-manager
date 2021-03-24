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
        v-if="isDownloaded"
        no-wrap
        no-caps
        color="primary"
        icon="sync"
        label="Update"
        class="btn-icon-left-padding-sm"
        size="md"
        padding="xs md xs sm"
        @click="pullRepo"
      />
      <q-btn
        v-else
        no-wrap
        no-caps
        color="primary"
        icon="download"
        label="Download"
        class="btn-icon-left-padding-sm"
        size="md"
        padding="xs md xs sm"
        @click="cloneRepo"
      />
      <q-btn
        no-wrap
        no-caps
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
        v-if="!isAdded()"
        no-wrap
        no-caps
        color="accent"
        icon="list"
        label="View Song List"
        class="btn-icon-left-padding-sm"
        size="md"
        padding="xs md xs sm"
        @click="getSongListRemote"
      />
      <q-btn
        v-if="isAdded()"
        no-wrap
        no-caps
        disable
        color="positive"
        icon="done"
        label="Added"
        class="btn-icon-left-padding-sm"
        size="md"
        padding="xs md xs sm"
      />
      <q-btn
        v-else
        no-wrap
        no-caps
        color="positive"
        icon="add"
        label="Add"
        class="btn-icon-left-padding-sm"
        size="md"
        padding="xs md xs sm"
        @click="addRepo"
      />
    </q-card-actions>
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
    deleteFunction: {
      type: Function,
      default: () => {
        return
      },
    },
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
        lastUpdated: new Date().toISOString(),
        localPath: window.electron.getDownloadPath(
          this.$q.localStorage.getItem('DownloadPath'),
          this.bucketName
        ),
      })
      this.$q.localStorage.set('RepositoryList', repoList)
      this.$router.push('/')
    },
    cloneRepo () {
      // TODO: if local repo already exists, call pullRepo()
      // TODO: else, clone repo from remote
    },
    pullRepo () {
      // TODO: if local repo not found, call cloneRepo()
      // TODO: else, pull latest commits from remote
    },
    getSongListLocal () {
      // TODO: display song list from local song list file
    },
    getSongListRemote () {
      // TODO: display song list from remote song list file
    },
  },
})
</script>
