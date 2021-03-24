<template>
  <q-page class="q-pa-lg">
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-h6">Download Path</div>
      </q-card-section>

      <q-separator inset />

      <q-card-section>
        <q-input v-model="downloadPath" dense outlined readonly>
          <template #append>
            <q-icon
              name="folder_open"
              class="cursor-pointer"
              @click.stop="openDownloadPath()"
            />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="row">
          <div class="col-auto">
            <div class="text-h6">Preferences.ini Path</div>
          </div>
          <div class="col" />
          <div class="col-auto q-my-auto">
            <q-btn
              no-wrap
              no-caps
              color="positive"
              icon="add"
              label="Add Preferences.ini"
              class="btn-icon-left-padding-sm"
              size="md"
              padding="xs md xs sm"
              @click="addPreferencesIniPath"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator inset class="q-mb-md" />

      <q-card-section
        v-for="(path, index) in preferencesIniPath"
        :key="index"
        class="q-pt-none"
      >
        <q-input dense outlined :model-value="path" readonly>
          <template #after>
            <q-btn
              dense
              icon="delete"
              aria-label="Delete"
              color="negative"
              class="q-ml-xs"
              @click="deletePreferencesIniFile(index)"
            />
          </template>
        </q-input>
      </q-card-section>

      <q-card-section v-if="!preferencesIniPath.length" class="q-pt-none">
        <div class="text-muted text-body1 text-dark text-center">
          No Preferences.ini files added.
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-h6">Update Frequency</div>
      </q-card-section>

      <q-separator inset />

      <q-card-section>
        <q-select
          v-model="updateFrequency"
          dense
          options-dense
          outlined
          :options="updateFrequencyOptions"
          @update:modelValue="saveUpdateFrequency"
        />
      </q-card-section>
    </q-card>

    <q-card class="q-mb-lg">
      <q-card-section>
        <q-checkbox
          v-model="autoLaunchOnLogin"
          dense
          size="lg"
          @update:modelValue="saveAutoLaunchOnLogin"
        >
          <div class="text-subtitle1 text-weight-medium q-pl-xs">
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
          v-model="locale"
          dense
          options-dense
          outlined
          :options="localeOptions"
          @update:modelValue="saveLocale"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useQuasar } from 'quasar'
import ConfirmDialog from 'components/dialogs/ConfirmDialog.vue'

export default defineComponent({
  setup () {
    const $q = useQuasar()

    // ==================================================================

    let downloadPath = ref($q.localStorage.getItem('DownloadPath'))

    function openDownloadPath () {
      const result = window.electron.openFolderDialog(this.downloadPath)
      if (result === undefined) return

      const newPath = result[0]
      this.downloadPath = newPath
      $q.localStorage.set('DownloadPath', newPath)
    }

    // ==================================================================

    let preferencesIniPath = ref($q.localStorage.getItem('PreferencesIniPath'))

    function savePreferencesIniPath () {
      $q.localStorage.set('PreferencesIniPath', preferencesIniPath.value)
    }

    function addPreferencesIniPath () {
      const result = window.electron.openIniFileDialog()
      if (result === undefined) return

      const newFile = result[0]
      if (!newFile.includes('Preferences.ini')) return
      if (preferencesIniPath.value.includes(newFile)) return

      // TODO: add local paths of installed packs to new Preferences.ini file

      preferencesIniPath.value.push(newFile)
      savePreferencesIniPath()
    }

    function deletePreferencesIniFile (index) {
      $q.dialog({
        component: ConfirmDialog,
        componentProps: {
          message: 'Are you sure you want to remove this file?',
        },
      }).onOk(() => {
        this.preferencesIniPath.splice(index, 1)
        savePreferencesIniPath()
      })
    }

    // ==================================================================

    const updateFrequencyOptions = [
      {
        label: '1 minute',
        value: 60000,
      },
      {
        label: '5 minutes',
        value: 300000,
      },
      {
        label: '10 minutes',
        value: 600000,
      },
      {
        label: '15 minutes',
        value: 900000,
      },
      {
        label: '30 minutes',
        value: 1800000,
      },
      {
        label: '1 hour',
        value: 3600000,
      },
      {
        label: '2 hours',
        value: 7200000,
      },
      {
        label: '4 hours',
        value: 14400000,
      },
      {
        label: '6 hours',
        value: 21600000,
      },
      {
        label: 'Never',
        value: -1,
      },
    ]

    let updateFrequency = ref(
      updateFrequencyOptions.find(
        (i) => i.value === $q.localStorage.getItem('UpdateInterval')
      )
    )

    function saveUpdateFrequency (newValue) {
      $q.localStorage.set('UpdateInterval', newValue.value)
    }

    // ==================================================================

    let autoLaunchOnLogin = ref(window.autoLaunch.isEnabled())

    function saveAutoLaunchOnLogin (newValue) {
      if (newValue) {
        window.autoLaunch.enable()
      } else {
        window.autoLaunch.disable()
      }
    }

    // ==================================================================

    const localeOptions = [
      {
        label: 'English',
        value: 'en-US',
      },
    ]

    let locale = ref(
      localeOptions.find((i) => i.value === $q.localStorage.getItem('Locale'))
    )

    function saveLocale (newValue) {
      $q.localStorage.set('Locale', newValue.value)
    }

    // ==================================================================

    return {
      downloadPath,
      openDownloadPath,
      preferencesIniPath,
      addPreferencesIniPath,
      deletePreferencesIniFile,
      updateFrequency,
      updateFrequencyOptions,
      saveUpdateFrequency,
      autoLaunchOnLogin,
      saveAutoLaunchOnLogin,
      localeOptions,
      locale,
      saveLocale,
    }
  },
})
</script>
