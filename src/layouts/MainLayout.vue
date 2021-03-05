<template>
  <q-layout view="hHh lpR fFf">
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

        <q-toolbar-title>
          SM Song Manager
        </q-toolbar-title>

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
          <q-item clickable v-ripple to="/">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>

            <q-item-section>
              Home
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/add">
            <q-item-section avatar>
              <q-icon name="create_new_folder" />
            </q-item-section>

            <q-item-section>
              Add Songs...
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable v-ripple to="/settings">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>

            <q-item-section>
              Settings
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/about">
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>

            <q-item-section>
              About
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="close" />
            </q-item-section>

            <q-item-section>
              Quit
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { version } from '../../version'

export default defineComponent({
  setup () {
    const leftDrawerOpen = ref(false)

    return {
      version,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
})
</script>
