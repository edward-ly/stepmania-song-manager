<template>
  <q-page class="q-pa-lg">
    <!-- TODO: build page -->
    <q-card class="q-mb-lg">
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

    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-h6">Update Frequency</div>
      </q-card-section>

      <q-separator inset />

      <q-card-section>
        <q-select
          dense
          options-dense
          outlined
          :options="updateFrequencyOptions"
          v-model="updateFrequency"
          @update:modelValue="saveUpdateFrequency"
        />
      </q-card-section>
    </q-card>

    <q-card class="q-mb-lg">
      <q-card-section>
        <q-checkbox
          dense
          size="lg"
          v-model="autoLaunchOnLogin"
          @update:modelValue="saveAutoLaunchOnLogin"
        >
          <div class="text-h6">
            Auto-Launch on Login
          </div>
        </q-checkbox>
      </q-card-section>
    </q-card>

    <q-card>
      <q-card-section>
        <div class="text-h6">Language</div>
      </q-card-section>

      <q-separator inset />

      <q-card-section>
        <q-select
          dense
          options-dense
          outlined
          :options="localeOptions"
          v-model="locale"
          @update:modelValue="saveLocale"
        />
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

    // ==================================================================

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

    // ==================================================================

    const updateFrequencyOptions = [
      {
        label: '1 minute',
        value: 60000
      },
      {
        label: '5 minutes',
        value: 300000
      },
      {
        label: '10 minutes',
        value: 600000
      },
      {
        label: '15 minutes',
        value: 900000
      },
      {
        label: '30 minutes',
        value: 1800000
      },
      {
        label: '1 hour',
        value: 3600000
      },
      {
        label: '2 hours',
        value: 7200000
      },
      {
        label: '4 hours',
        value: 14400000
      },
      {
        label: '6 hours',
        value: 21600000
      },
      {
        label: 'Never',
        value: -1
      }
    ]

    let updateFrequency = ref(updateFrequencyOptions.find(i => i.value === $q.localStorage.getItem('UpdateInterval')))

    function saveUpdateFrequency (newValue) {
      $q.localStorage.set('UpdateInterval', newValue.value)
    }

    // ==================================================================

    let autoLaunchOnLogin = ref($q.localStorage.getItem('AutoLaunchOnLogin'))

    function saveAutoLaunchOnLogin (newValue) {
      $q.localStorage.set('AutoLaunchOnLogin', newValue)
    }

    // ==================================================================

    const localeOptions = [
      {
        label: 'English',
        value: 'en-US'
      }
    ]

    let locale = ref(localeOptions.find(i => i.value === $q.localStorage.getItem('Locale')))

    function saveLocale (newValue) {
      $q.localStorage.set('Locale', newValue.value)
    }

    // ==================================================================

    return {
      downloadPath,
      saveDownloadPath,
      openDownloadPath,
      updateFrequency,
      updateFrequencyOptions,
      saveUpdateFrequency,
      autoLaunchOnLogin,
      saveAutoLaunchOnLogin,
      localeOptions,
      locale,
      saveLocale
    }
  }
})
</script>
