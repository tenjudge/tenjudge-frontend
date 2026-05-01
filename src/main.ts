import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router'
import { useAuthStore } from './stores/auth'
import 'katex/dist/katex.min.css'
import './styles/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore(pinia)
authStore.restoreSession()

app.use(router)

void router.isReady().then(() => {
  app.mount('#app')
})
