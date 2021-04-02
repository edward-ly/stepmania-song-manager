import { Quasar, LocalStorage } from 'quasar'
import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'
import _ from 'lodash'

if (!LocalStorage.has('Locale')) {
  const userLocale = Quasar.lang.getLocale()
  if (_.has(messages, userLocale)) {
    LocalStorage.set('Locale', userLocale)
  } else {
    LocalStorage.set('Locale', 'en-US')
  }
}

const i18n = createI18n({
  locale: LocalStorage.getItem('Locale'),
  messages
})

export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)
})

export { i18n }
