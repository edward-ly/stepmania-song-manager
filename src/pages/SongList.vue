<template>
  <q-layout view="hHh lpR fFf" class="fullscreen">
    <q-header bordered class="bg-blue-grey-1 text-dark q-pa-sm">
      <q-toolbar>
        <q-btn outline label="Expand All" class="q-mr-md" />
        <q-btn outline label="Collapse All" class="q-mr-md" />
        <q-toggle v-model="showTranslit" label="Show Transliterated" />
        <q-space />
        <q-input
          v-model="searchText"
          dense
          filled
          label="Search"
          class="song-search"
        >
          <template #append>
            <q-icon v-if="!searchText" name="search" />
            <q-icon
              v-else
              name="close"
              class="cursor-pointer"
              @click="searchText = null"
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
        <!-- TODO: add expand/collapse all header buttons -->
        <!-- TODO: add search bar -->
        <div
          v-for="(pack, index) in packs"
          :key="index"
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
                class="fill-width"
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

        <EmptyMessage :show="!packs.length" icon="info">
          No songs found.
        </EmptyMessage>
      </q-scroll-area>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import EmptyMessage from 'components/EmptyMessage.vue'
import thumbScrollStyle from 'components/thumbScrollStyle'

export default defineComponent({
  components: {
    EmptyMessage,
  },

  setup () {
    const packs = ref([])
    const expanded = ref([])
    const duration = ref([])
    window.electron.getSongListData((data) => {
      packs.value = data
      expanded.value = Array(data.length).fill(data.length < 2)
      duration.value = data.map((pack) =>
        Math.max(Math.log1p(pack.songs.length) * 100, 150)
      )
    })

    const showTranslit = ref(false)
    const searchText = ref(null)

    function levelSort (a, b) {
      const aInt = Number(a) || -1
      const bInt = Number(b) || -1
      return bInt - aInt
    }

    function getSongTitle (row) {
      const title =
        showTranslit.value && row.titleTranslit.length
          ? row.titleTranslit
          : row.title
      const subtitle =
        showTranslit.value && row.subtitleTranslit.length
          ? row.subtitleTranslit
          : row.subtitle
      return subtitle.length ? `${title} ${subtitle}` : title
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
          showTranslit.value && row.artistTranslit.length
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
        classes: 'text-no-wrap q-table--col-auto-width',
        headerClasses: 'text-center text-no-wrap q-table--col-auto-width',
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
    ]

    const rows = []

    return {
      thumbScrollStyle,
      getSongTitle,
      packs,
      expanded,
      duration,
      columns,
      rows,
      showTranslit,
      searchText,
    }
  },
})
</script>

<style lang="scss">
.q-table--dense .q-table th.padding-level,
.q-table--dense .q-table td.padding-level {
  padding: 4px 2px;
}

.song-search {
  min-width: 240px;
  width: 25%;
}
</style>
