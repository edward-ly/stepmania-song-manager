<template>
  <q-page class="q-pa-lg">
    <!-- TODO: build page -->
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Download Path</div>
      </q-card-section>

      <q-separator inset />

      <q-card-section>
        <q-input dense outlined v-model="downloadPath" @update:modelValue="saveDownloadPath">
          <template v-slot:append>
            <q-icon name="folder_open" @click.stop="openDownloadPath()" class="cursor-pointer" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  setup () {
    const $q = useQuasar()
    let downloadPath = ref($q.localStorage.getItem('DownloadPath'))

    function saveDownloadPath (newPath) {
      $q.localStorage.set('DownloadPath', newPath)
    }

    function openDownloadPath () {
      const result = window.electron.openFolderDialog(this.downloadPath)
      if (result !== undefined) {
        const newPath = result[0]
        this.downloadPath = newPath
        saveDownloadPath(newPath)
      }
    }

    return {
      downloadPath,
      saveDownloadPath,
      openDownloadPath
    }
  }
})
</script>
