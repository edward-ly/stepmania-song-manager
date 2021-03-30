<template>
  <div v-if="show" class="text-muted absolute-center">
    <div class="column items-center q-gutter-y-xs">
      <q-icon v-if="icon" :name="icon" size="xl" color="dark" />
      <div class="text-body1 text-dark text-center">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    show: { type: Boolean, required: true },
    icon: { type: String, default: '' },
  },
})
</script>
