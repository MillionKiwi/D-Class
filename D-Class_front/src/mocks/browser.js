/**
 * MSW 브라우저 설정
 */

import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Service Worker 설정
export const worker = setupWorker(...handlers)

// 개발 환경에서만 MSW 시작
export const startMSW = async () => {
  if (import.meta.env.MODE === 'development') {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass', // 처리되지 않은 요청은 그대로 통과
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      })
      console.log('✅ MSW가 활성화되었습니다.')
      console.log('🔧 개발 모드: Mock API 사용 중')
    } catch (error) {
      console.error('❌ MSW 시작 실패:', error)
    }
  }
}

// MSW 중지
export const stopMSW = () => {
  if (worker) {
    worker.stop()
    console.log('⏹️ MSW가 중지되었습니다.')
  }
}

