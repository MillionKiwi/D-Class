/**
 * MSW 브라우저 설정
 * 개발 환경에서 Mock API를 활성화
 */

import { setupWorker } from 'msw/browser'
import handlers from './handlers'

// Service Worker 설정
export const worker = setupWorker(...handlers)

/**
 * Mock API 초기화
 * 개발 환경에서만 활성화
 */
export const initMockAPI = async () => {
  // 개발 환경이 아니면 Mock API 비활성화
  if (import.meta.env.PROD) {
    return
  }

  try {
    await worker.start({
      onUnhandledRequest: 'bypass', // 처리되지 않은 요청은 실제 서버로 전달
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    })

    console.log('🎭 Mock API가 활성화되었습니다!')
    console.log('📋 사용 가능한 Mock 계정:')
    console.log('  강사1: instructor1@test.com / password123')
    console.log('  강사2: instructor2@test.com / password123')
    console.log('  학원1: academy1@test.com / password123')
    console.log('  학원2: academy2@test.com / password123')
    console.log('  관리자: admin@d-class.com / admin123!@#')
  } catch (error) {
    console.error('❌ Mock API 초기화 실패:', error)
  }
}

export default worker

