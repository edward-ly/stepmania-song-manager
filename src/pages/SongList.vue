<template>
  <q-layout view="hHh lpR fFf" class="fullscreen">
    <q-header>
      <q-bar class="bg-grey-9 text-white q-electron-drag">
        <q-space />
        <div>Song List: {{ bucketName }}</div>
        <q-space />

        <q-btn dense flat icon="minimize" @click="minimize" />
        <q-btn dense flat icon="crop_square" @click="toggleMaximize" />
        <q-btn dense flat icon="close" @click="closeApp" />
      </q-bar>

      <q-toolbar class="bg-blue-grey-1 text-dark q-pa-sm q-header--bordered">
        <q-btn
          outline
          label="Expand All"
          class="q-mr-md"
          @click="expanded.fill(true)"
        />
        <q-btn
          outline
          label="Collapse All"
          class="q-mr-md"
          @click="expanded.fill(false)"
        />
        <q-toggle v-model="showTranslit" label="Show Transliterated" />
        <q-space />
        <q-input
          v-model="searchText"
          dense
          filled
          label="Search"
          class="song-search"
          @update:modelValue="filterSongList"
        >
          <template #append>
            <q-icon v-if="!searchText" name="search" />
            <q-icon
              v-else
              name="close"
              class="cursor-pointer"
              @click="() => filterSongList((searchText = null))"
            />
          </template>
        </q-input>
      </q-toolbar>
    </q-header>

    <q-page-container class="bg-grey-1 full-height full-width">
      <q-scroll-area
        class="full-height full-width"
        :thumb-style="thumbScrollStyle"
      >
        <div v-for="(pack, index) in filteredSongList" :key="index">
          <div
            v-if="pack.songs.length"
            class="q-pl-md q-pr-lg q-py-sm q-gutter-y-sm"
          >
            <q-btn
              flat
              rounded
              dense
              no-caps
              :icon="
                expanded[index] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
              "
              :label="`${pack.name} (${pack.songs.length})`"
              class="q-pr-md"
              size="lg"
              @click="expanded[index] = !expanded[index]"
            />
            <q-slide-transition :duration="duration[index]">
              <div v-show="expanded[index]">
                <q-table
                  dense
                  :rows="pack.songs"
                  :columns="columns"
                  :row-key="getSongTitle"
                  :pagination="{ rowsPerPage: 0 }"
                  hide-pagination
                  wrap-cells
                />
              </div>
            </q-slide-transition>
          </div>
        </div>

        <EmptyMessage :show="noSongsFound" icon="info">
          No songs found.
        </EmptyMessage>
      </q-scroll-area>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import EmptyMessage from 'components/EmptyMessage.vue'
import thumbScrollStyle from 'components/thumbScrollStyle'
import _ from 'lodash'

export default defineComponent({
  components: {
    EmptyMessage,
  },

  setup () {
    const bucketName = ref(null)
    const songList = ref([])
    const filteredSongList = ref([])
    const expanded = ref([])
    const duration = ref([])
    const showTranslit = ref(false)
    const searchText = ref(null)

    const noSongsFound = computed(() => {
      const songs = _.flatten(filteredSongList.value.map((pack) => pack.songs))
      return !songs.length
    })

    function getDuration (pack) {
      return Math.max(Math.log1p(pack.songs.length) * 100, 150)
    }

    window.electron.getSongListData((data, name) => {
      bucketName.value = name
      searchText.value = null
      songList.value = data
      filteredSongList.value = data
      expanded.value = Array(data.length).fill(data.length < 2)
      duration.value = data.map((pack) => getDuration(pack))
    })

    // TODO: implement searching by bpm and level (by chart)
    function filterSongList (input) {
      if (!input || /^\s*$/.test(input)) {
        filteredSongList.value = songList.value
        return
      }

      const query = input.trim().toLowerCase()
      filteredSongList.value = songList.value.map((pack) => {
        return {
          name: pack.name,
          songs: pack.songs.filter((song) => {
            const ifLevel = /^level:(\d+)$/gi.exec(query)
            const matchConds = [
              `${song.title} ${song.artist}`.toLowerCase().includes(query),
              `${song.titleTranslit} ${song.artistTranslit}`
                .toLowerCase()
                .includes(query),
              ifLevel &&
                _.values(song).map(Number).includes(Number(ifLevel[1])),
            ]
            return matchConds.reduce((a, b) => a || b)
          }),
        }
      })

      duration.value = filteredSongList.value.map((pack) => getDuration(pack))
    }

    function levelSort (a, b) {
      const aInt = Number(a) || -1
      const bInt = Number(b) || -1
      return bInt - aInt
    }

    function getSongTitle (row) {
      const title =
        showTranslit.value && row.titleTranslit ? row.titleTranslit : row.title
      const subtitle =
        showTranslit.value && row.subtitleTranslit
          ? row.subtitleTranslit
          : row.subtitle
      return subtitle ? `${title} ${subtitle}` : title
    }

    const columns = [
      {
        name: 'title',
        label: 'Title',
        field: getSongTitle,
        required: true,
        align: 'left',
        sortable: true,
        style: 'width: 60%',
      },
      {
        name: 'artist',
        label: 'Artist',
        field: (row) =>
          showTranslit.value && row.artistTranslit
            ? row.artistTranslit
            : row.artist,
        align: 'left',
        sortable: true,
        style: 'width: 40%',
      },
      {
        name: 'bpm',
        label: 'BPM',
        field: 'displayBPM',
        align: 'center',
        sortable: true,
        sort: (a, b) => {
          if (a === b) return 0

          let aInt
          let bInt
          if (a === '???') {
            aInt = Infinity
          } else if (a.includes('-')) {
            aInt = Number(a.substring(a.indexOf('-') + 1))
          } else {
            aInt = Number(a)
          }
          if (b === '???') {
            bInt = Infinity
          } else if (b.includes('-')) {
            bInt = Number(b.substring(b.indexOf('-') + 1))
          } else {
            bInt = Number(b)
          }
          return bInt - aInt
        },
        classes: 'text-no-wrap q-table--col-auto-width bpm-width',
        headerClasses:
          'text-center text-no-wrap q-table--col-auto-width bpm-width',
      },
      {
        name: 'beg',
        label: 'BEG',
        field: 'begLevel',
        align: 'center',
        sortable: true,
        sort: levelSort,
        classes:
          'bg-beginner text-no-wrap q-table--col-auto-width padding-level',
        headerClasses:
          'text-center text-no-wrap q-table--col-auto-width padding-level',
      },
      {
        name: 'bsp',
        label: 'BSP',
        field: 'bspLevel',
        align: 'center',
        sortable: true,
        sort: levelSort,
        classes: 'bg-basic text-no-wrap q-table--col-auto-width padding-level',
        headerClasses:
          'text-center text-no-wrap q-table--col-auto-width padding-level',
      },
      {
        name: 'dsp',
        label: 'DSP',
        field: 'dspLevel',
        align: 'center',
        sortable: true,
        sort: levelSort,
        classes:
          'bg-difficult text-no-wrap q-table--col-auto-width padding-level',
        headerClasses:
          'text-center text-no-wrap q-table--col-auto-width padding-level',
      },
      {
        name: 'esp',
        label: 'ESP',
        field: 'espLevel',
        align: 'center',
        sortable: true,
        sort: levelSort,
        classes: 'bg-expert text-no-wrap q-table--col-auto-width padding-level',
        headerClasses:
          'text-center text-no-wrap q-table--col-auto-width padding-level',
      },
      {
        name: 'csp',
        label: 'CSP',
        field: 'cspLevel',
        align: 'center',
        sortable: true,
        sort: levelSort,
        classes:
          'bg-challenge text-no-wrap q-table--col-auto-width padding-level',
        headerClasses:
          'text-center text-no-wrap q-table--col-auto-width padding-level',
      },
      {
        name: 'spEdit',
        label: 'EDIT',
        field: 'spEditLevel',
        align: 'center',
        sortable: true,
        sort: levelSort,
        classes:
          'bg-blue-grey-1 text-no-wrap q-table--col-auto-width padding-level',
        headerClasses:
          'text-center text-no-wrap q-table--col-auto-width padding-level',
      },
      {
        name: 'bdp',
        label: 'BDP',
        field: 'bdpLevel',
        align: 'center',
        sortable: true,
        sort: levelSort,
        classes: 'bg-basic text-no-wrap q-table--col-auto-width padding-level',
        headerClasses:
          'text-center text-no-wrap q-table--col-auto-width padding-level',
      },
      {
        name: 'ddp',
        label: 'DDP',
        field: 'ddpLevel',
        align: 'center',
        sortable: true,
        sort: levelSort,
        classes:
          'bg-difficult text-no-wrap q-table--col-auto-width padding-level',
        headerClasses:
          'text-center text-no-wrap q-table--col-auto-width padding-level',
      },
      {
        name: 'edp',
        label: 'EDP',
        field: 'edpLevel',
        align: 'center',
        sortable: true,
        sort: levelSort,
        classes: 'bg-expert text-no-wrap q-table--col-auto-width padding-level',
        headerClasses:
          'text-center text-no-wrap q-table--col-auto-width padding-level',
      },
      {
        name: 'cdp',
        label: 'CDP',
        field: 'cdpLevel',
        align: 'center',
        sortable: true,
        sort: levelSort,
        classes:
          'bg-challenge text-no-wrap q-table--col-auto-width padding-level',
        headerClasses:
          'text-center text-no-wrap q-table--col-auto-width padding-level',
      },
      {
        name: 'dpEdit',
        label: 'EDIT',
        field: 'dpEditLevel',
        align: 'center',
        sortable: true,
        sort: levelSort,
        classes:
          'bg-blue-grey-1 text-no-wrap q-table--col-auto-width padding-level',
        headerClasses:
          'text-center text-no-wrap q-table--col-auto-width padding-level',
      },
    ]

    function minimize () {
      window.windowAPI.minimize()
    }

    function toggleMaximize () {
      window.windowAPI.toggleMaximize()
    }

    function closeApp () {
      window.windowAPI.close()
    }

    return {
      thumbScrollStyle,
      getSongTitle,
      bucketName,
      filteredSongList,
      expanded,
      duration,
      showTranslit,
      searchText,
      noSongsFound,
      filterSongList,
      columns,
      minimize,
      toggleMaximize,
      closeApp,
    }
  },
})
</script>

<style lang="scss">
.bpm-width {
  min-width: 64px;
}

.q-table--dense .q-table th.padding-level,
.q-table--dense .q-table td.padding-level {
  padding: 4px 2px;
}

.song-search {
  min-width: 240px;
  width: 25%;
}
</style>
