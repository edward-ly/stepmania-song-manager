<template>
  <q-card class="q-mb-lg">
    <q-card-section>
      <div class="text-h6">{{ name }}</div>
      <div class="text-caption text-link" @click="openUrl(url)">{{ url }}</div>
      <div v-if="description.length" class="text-body2 q-pt-sm">
        {{ description }}
      </div>
      <div v-else class="text-body2 text-italic text-muted q-pt-sm">
        No description set.
      </div>
    </q-card-section>

    <q-separator inset />

    <q-card-section v-if="route === '/'" class="row">
      <q-space />
      <q-btn
        v-if="isDownloaded"
        no-wrap
        no-caps
        color="primary"
        icon="sync"
        label="Update"
        class="btn-icon-left-padding-sm q-ml-sm"
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
        class="btn-icon-left-padding-sm q-ml-sm"
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
        class="btn-icon-left-padding-sm q-ml-sm"
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
        class="btn-icon-left-padding-sm q-ml-sm"
        size="md"
        padding="xs md xs sm"
        @click="deleteFunction"
      />
    </q-card-section>
    <q-card-section v-else-if="route === '/add'" class="row">
      <q-space />
      <q-btn
        v-if="!isAdded()"
        no-wrap
        no-caps
        color="accent"
        icon="list"
        label="View Song List"
        class="btn-icon-left-padding-sm q-ml-sm"
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
        class="btn-icon-left-padding-sm q-ml-sm"
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
        class="btn-icon-left-padding-sm q-ml-sm"
        size="md"
        padding="xs md xs sm"
        @click="addRepo"
      />
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
    url: {
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
    deleteFunction: {
      type: Function,
      default: () => {
        return
      },
    },
  },
  methods: {
    openUrl (url) {
      window.electron.openExternal(url)
    },
    isAdded () {
      return (
        this.$q.localStorage
          .getItem('RepositoryList')
          .find((repo) => repo.url === this.url) !== undefined
      )
    },
    addRepo () {
      let repoList = this.$q.localStorage.getItem('RepositoryList')
      repoList.push({
        name: this.name,
        url: this.url,
        description: this.description,
        isDownloaded: false,
      })
      this.$q.localStorage.set('RepositoryList', repoList)
      this.$router.push('/')
    },
    cloneRepo () {
      // TODO: clone repo from remote
    },
    pullRepo () {
      // TODO: pull latest commits from remote
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
