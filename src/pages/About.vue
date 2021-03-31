<template>
  <q-card class="no-scroll">
    <q-card-section class="row">
      <div class="text-h6">About</div>
      <q-space />
      <q-btn v-close-popup flat round dense icon="close" />
    </q-card-section>

    <q-separator />

    <q-card-section class="bg-grey-1 no-padding full-height full-width">
      <q-scroll-area :thumb-style="thumbScrollStyle" class="full-height full-width">
        <div class="q-pt-sm q-px-lg q-gutter-y-md full-dialog-header-fix">
          <div class="text-center q-gutter-y-sm">
            <q-img src="~assets/master-icon.png" ratio="1" width="64px" />
            <div class="text-h5 text-bold">StepMania Song Manager</div>
            <div class="text-subtitle1">Version: {{ version }}</div>
            <div class="q-gutter-sm" @click="openUrl(appGitHub)">
              <q-icon name="fab fa-github" size="xl" class="cursor-pointer" />
              <p class="text-body2 text-link">Free and Open-Source on GitHub!</p>
            </div>
          </div>

          <p class="text-body2">
            Want to report a bug or submit feedback? Create an issue or start a
            discussion on GitHub from the link above, or contact me on social media!
          </p>

          <ul class="text-body2">
            <li>
              Email:
              <span class="text-link" @click="openUrl('mailto:' + personalEmail)">{{
                personalEmail
              }}</span>
            </li>
            <!-- <li>
              GitHub:
              <span class="text-link" @click="openUrl(personalGitHub)">{{
                personalGitHub
              }}</span>
            </li> -->
            <li>
              Twitter:
              <span class="text-link" @click="openUrl(personalTwitter1)"
                >@_edward_ly</span
              >
              or
              <span class="text-link" @click="openUrl(personalTwitter2)"
                >@_led_light</span
              >
            </li>
            <!-- <li>
              Twitch:
              <span class="text-link" @click="openUrl(personalTwitch)">{{
                personalTwitch
              }}</span>
            </li> -->
            <li>
              Discord Server:
              <span class="text-link" @click="openUrl(personalDiscord)">{{
                personalDiscord
              }}</span>
            </li>
          </ul>

          <p class="text-body2">Want to donate and support the work that I do?</p>

          <q-card-actions class="q-gutter-lg">
            <q-img
              class="cursor-pointer"
              position="0"
              height="48px"
              width="150px"
              fit="scale-down"
              alt="Donate with PayPal"
              src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"
              @click="openUrl(personalPayPal)"
            />
            <q-img
              class="cursor-pointer"
              position="0"
              height="38px"
              width="160px"
              fit="scale-down"
              alt="Buy Me a Coffee at ko-fi.com"
              src="https://cdn.ko-fi.com/cdn/kofi1.png?v=2"
              @click="openUrl(personalKofi)"
            />
          </q-card-actions>

          <q-separator />

          <div>
            <p class="text-h6 text-bold">MIT License</p>
            <p class="text-subtitle2">
              Copyright <q-icon name="copyright" /> 2021 Edward Ly
            </p>
            <p class="text-body2">
              Permission is hereby granted, free of charge, to any person obtaining a
              copy of this software and associated documentation files (the
              "Software"), to deal in the Software without restriction, including
              without limitation the rights to use, copy, modify, merge, publish,
              distribute, sublicense, and/or sell copies of the Software, and to
              permit persons to whom the Software is furnished to do so, subject to
              the following conditions:
            </p>
            <p class="text-body2">
              The above copyright notice and this permission notice shall be included
              in all copies or substantial portions of the Software.
            </p>
            <p class="text-body2">
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
              OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
              IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
              CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
              TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
              SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>
          </div>
        </div>
      </q-scroll-area>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue'
import thumbScrollStyle from 'components/thumbScrollStyle'
import { version } from '../../version'

export default defineComponent({
  setup () {
    function openUrl (url) {
      window.electron.openExternal(url)
    }

    return {
      thumbScrollStyle,
      version,
      openUrl,
      appGitHub: 'https://github.com/edward-ly/stepmania-song-manager',
      personalEmail: 'edward.ly@pm.me',
      // personalGitHub: 'https://github.com/edward-ly',
      personalTwitter1: 'https://twitter.com/_edward_ly',
      personalTwitter2: 'https://twitter.com/_led_light',
      // personalTwitch: 'https://www.twitch.tv/led_light7',
      personalDiscord: 'https://discord.gg/FYHvtEP',
      personalKofi: 'https://ko-fi.com/Z8Z42UJNY',
      // personalStreamlabs: 'https://streamlabs.com/led_light7',
      personalPayPal:
        'https://www.paypal.com/donate?hosted_button_id=R3F883NUQFLP2',
    }
  },
})
</script>
