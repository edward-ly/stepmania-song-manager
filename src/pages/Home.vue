<template>
  <q-page class="q-pa-lg">
    <div class="row">
      <div class="col-auto">
        <div class="text-h5 q-my-none">Installed Packs</div>
      </div>
      <div class="col" />
      <div class="col-auto q-my-auto">
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
        <div class="no-packs absolute-center">
          <div class="column items-center q-gutter-y-xs">
            <q-icon name="info" size="xl" color="dark" />
            <div class="text-body1 text-dark text-center">
              No song packs installed.<br>Click on "+ Add Songs" to get started!
            </div>
          </div>
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

  .no-packs {
    opacity: 0.5;
  }
</style>