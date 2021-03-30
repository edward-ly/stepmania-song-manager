<template>
  <q-layout view="hHh lpR fFf" class="fullscreen">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>SM Song Manager</q-toolbar-title>

        <div>v{{ version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      :width="200"
      overlay
      behavior="desktop"
      elevated
      class="bg-grey-3"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item v-ripple clickable to="/" exact>
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>

            <q-item-section>Home</q-item-section>
          </q-item>

          <q-item v-ripple clickable to="/add" exact>
            <q-item-section avatar>
              <q-icon name="create_new_folder" />
            </q-item-section>

            <q-item-section>Add Songs...</q-item-section>
          </q-item>

          <q-separator />

          <q-item v-ripple clickable to="/settings" exact>
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>

            <q-item-section>Settings</q-item-section>
          </q-item>

          <q-item v-ripple clickable to="/about" exact>
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>

            <q-item-section>About</q-item-section>
          </q-item>

          <q-separator />

          <q-item v-ripple v-close-popup clickable @click="closeApp">
            <q-item-section avatar>
              <q-icon name="close" />
            </q-item-section>

            <q-item-section>Quit</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

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
import { defineComponent, ref } from 'vue'
import { version } from '../../version'
import thumbScrollStyle from 'components/thumbScrollStyle'

export default defineComponent({
  setup () {
    const leftDrawerOpen = ref(false)

    function closeApp () {
      window.close()
    }

    return {
      version,
      thumbScrollStyle,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      closeApp,
    }
  },
})
</script>
