import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

// PWA 업데이트 알림을 위한 Service Worker 등록 (개발 모드에서는 vite-plugin-pwa가 자동 처리)
if (import.meta.env.PROD) {
  import('./registerSW')
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')