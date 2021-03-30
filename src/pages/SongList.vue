<template>
  <div class="bg-grey-1 q-pa-lg">
    <!-- TODO: build tables -->
    <div v-for="(songs, index) in songList" :key="index" class="q-pt-md">
      <!-- TODO: {{ pack.name }} -->
      <q-table
        dense
        :rows="songs"
        :columns="columns"
        :row-key="getSongTitle"
        :pagination="{ rowsPerPage: 0 }"
        hide-pagination
        wrap-cells
      />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup () {
    const songList = ref([])
    window.electron.getSongListData((data) => (songList.value = data))

    const songNativeLanguage = ref(true)

    function levelSort (a, b) {
      const aInt = Number(a) || 999
      const bInt = Number(b) || 999
      return bInt - aInt
    }

    function getSongTitle (row) {
      const title =
        !songNativeLanguage.value && row.titleTranslit.length
          ? row.titleTranslit
          : row.title
      const subtitle =
        !songNativeLanguage.value && row.subtitleTranslit.length
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
          !songNativeLanguage.value && row.artistTranslit.length
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
          let aInt
          let bInt
          if (a === '*') {
            aInt = 9999
          } else if (a.includes('-')) {
            aInt = Number(a.substring(a.indexOf('-') + 1))
          } else {
            aInt = Number(a)
          }
          if (b === '*') {
            bInt = 9999
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
      getSongTitle,
      songList,
      columns,
      rows,
      songNativeLanguage,
    }
  },
})
</script>

<style lang="scss">
.q-table--dense .q-table th.padding-level,
.q-table--dense .q-table td.padding-level {
  padding: 4px 2px;
}
</style>
