import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router'
import { useAuthStore } from './stores/auth'
import { installMarkdownCodeCopy } from './utils/markdownCodeCopy'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css'
import './styles/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore(pinia)
authStore.restoreSession()
installMarkdownCodeCopy()

app.use(router)

void router.isReady().then(() => {
  app.mount('#app')
})
