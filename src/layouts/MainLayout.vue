<template>
  <q-layout view="hHh lpR fFf" class="fullscreen">
    <q-header elevated>
      <q-bar class="bg-grey-9 text-white q-electron-drag">
        <q-btn dense flat icon="menu">
          <q-menu>
            <q-list dense>
              <q-item v-close-popup clickable to="/" exact>
                <q-item-section>Home</q-item-section>
              </q-item>
              <q-item v-close-popup clickable to="/add" exact>
                <q-item-section>Add Songs...</q-item-section>
              </q-item>

              <q-separator />

              <q-item v-close-popup clickable to="/settings" exact>
                <q-item-section>Settings</q-item-section>
              </q-item>

              <q-item v-close-popup clickable to="/about" exact>
                <q-item-section>About</q-item-section>
              </q-item>

              <q-separator />

              <q-item v-close-popup clickable @click="closeApp">
                <q-item-section>Quit</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-space />

        <div>StepMania Song Manager</div>

        <q-space />

        <q-btn dense flat icon="minimize" @click="minimize" />
        <q-btn dense flat icon="crop_square" @click="toggleMaximize" />
        <q-btn dense flat icon="close" @click="closeApp" />
      </q-bar>
    </q-header>

    <q-page-container class="bg-grey-1 full-height full-width">
      <q-scroll-area
        class="full-height full-width"
        :thumb-style="thumbScrollStyle"
      >
        <router-view />
      </q-scroll-area>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue'
import thumbScrollStyle from 'components/thumbScrollStyle'

export default defineComponent({
  setup () {
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
      minimize,
      toggleMaximize,
      closeApp,
    }
  },
})
</script>
