import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 전역 스타일 import
import './assets/styles/global.scss'

// 환경변수 검증
import { validateEnv } from './utils/env'

// MSW 초기화
import { startMSW } from './mocks/browser'

// 앱 시작 전 환경변수 검증
try {
  validateEnv()
} catch (error) {
  console.error('❌ 환경변수 검증 실패:', error.message)
  // 개발 환경에서는 에러를 표시하고 프로덕션에서는 조용히 실패
  if (import.meta.env.DEV) {
    alert(`환경변수 설정 오류: ${error.message}`)
  }
}

// MSW 시작 후 앱 초기화
async function initApp() {
  // 개발 환경에서 MSW 시작
  if (import.meta.env.DEV) {
    await startMSW()
  }

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
}

initApp()
