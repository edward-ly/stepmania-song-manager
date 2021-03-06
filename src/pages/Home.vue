<template>
  <q-page class="q-pa-lg">
    <div class="row">
      <div class="col" />
      <div class="col-auto">
        <q-btn
          to="/add"
          no-wrap
          no-caps
          color="positive"
          icon="add"
          label="Add Songs"
          class="btn-icon-left-padding-sm"
          size="md"
          padding="xs md xs sm"
        />
      </div>
    </div>
    <div class="row q-pt-lg">
      <div class="col">
        <div class="flex flex-center">
          <img
            alt="Quasar logo"
            src="~assets/quasar-logo-full.svg"
          >
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({})
</script>

<style lang="scss">
  .btn-icon-left-padding-sm .on-left {
    margin-right: map-get($space-sm, "x");
  }
</style>
