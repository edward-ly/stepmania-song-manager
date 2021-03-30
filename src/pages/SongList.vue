<template>
  <q-scroll-area
    class="bg-grey-1 q-py-sm window-height window-width"
    :thumb-style="thumbScrollStyle"
  >
    <!-- TODO: add expand/collapse all header buttons -->
    <!-- TODO: add songNativeLanguage toggle -->
    <!-- TODO: add search bar -->
    <div
      v-for="(pack, index) in packs"
      :key="index"
      class="q-pl-md q-pr-lg q-py-sm q-gutter-y-sm"
    >
      <!-- TODO: create separate expanded for each table -->
      <q-btn
        flat
        rounded
        dense
        no-caps
        :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        :label="`${pack.name} (${pack.songs.length})`"
        class="q-pr-md"
        size="lg"
        @click="expanded = !expanded"
      />
      <q-slide-transition>
        <div v-show="expanded">
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
    const expanded = ref(false)
    window.electron.getSongListData((data) => {
      packs.value = data
      expanded.value = data.length < 2
    })

    const songNativeLanguage = ref(true)

    function levelSort (a, b) {
      const aInt = Number(a) || -1
      const bInt = Number(b) || -1
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
