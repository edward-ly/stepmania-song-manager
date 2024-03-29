<template>
  <q-card class="no-scroll">
    <q-card-section class="row">
      <div class="text-h6">Settings</div>
      <q-space />
      <q-btn v-close-popup flat round dense icon="close" />
    </q-card-section>

    <q-separator />

    <q-card-section class="bg-grey-1 no-padding full-width full-height-dialog">
      <q-scroll-area
        :thumb-style="thumbScrollStyle"
        class="full-width full-height"
      >
        <div class="q-pa-lg full-dialog-header-fix">
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

          <q-card class="q-mb-lg">
            <q-card-section>
              <div class="text-h6">Language</div>
            </q-card-section>

            <q-separator inset />

            <q-card-section>
              <q-select
                v-model="lang"
                :options="langOptions"
                dense
                outlined
                emit-value
                map-options
                options-dense
              />
            </q-card-section>
          </q-card>
        </div>
      </q-scroll-area>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import ConfirmDialog from 'components/dialogs/ConfirmDialog.vue'
import thumbScrollStyle from 'components/thumbScrollStyle'

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

      window.fs.addPathsToPreferencesIni(
        [newFile],
        $q.localStorage.getItem('RepositoryList').map((el) => el.localPath)
      )

      preferencesIniPath.value.push(newFile)
      savePreferencesIniPath()
    }

    function deletePreferencesIniFile (index) {
      $q.dialog({
        component: ConfirmDialog,
        componentProps: {
          message:
            'Are you sure you want to delete this file? This will also remove all installed packs from the version of StepMania associated with this file.',
        },
      }).onOk(() => {
        window.fs.deletePathsFromPreferencesIni(
          [preferencesIniPath.value[index]],
          $q.localStorage.getItem('RepositoryList').map((el) => el.localPath)
        )

        this.preferencesIniPath.splice(index, 1)
        savePreferencesIniPath()
      })
    }

    // ==================================================================

    const updateFrequencyOptions = [
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

    const { locale } = useI18n({ useScope: 'global' })
    const lang = ref(locale)

    watch(lang, (val) => {
      locale.value = val
      $q.localStorage.set('Locale', val)
    })

    // TODO: add 'ja' locale
    const langOptions = [
      {
        label: 'English (United States)',
        value: 'en-US',
      },
      {
        label: 'English (United Kingdom)',
        value: 'en-GB',
      },
    ]

    // ==================================================================

    // TODO: add dark mode setting

    return {
      thumbScrollStyle,
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
      lang,
      langOptions,
    }
  },
})
</script>
