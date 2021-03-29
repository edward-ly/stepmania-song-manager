<template>
  <div class="fullscreen bg-grey-1 q-pa-lg">
    <!-- TODO: build tables -->
    {{ songList }}
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup () {
    const songList = ref([])

    window.electron.getSongListData((data) => songList.value = data)

    return {
      songList,
    }
  },
})
</script>
