import axios from 'axios'
import router from '@/router'
import env, { isDebugMode } from '@/utils/env'

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: env.api.baseUrl,
  timeout: env.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem(env.auth.tokenKey)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 디버그 모드에서 API 요청 로깅
    if (env.debug.logApi) {
      console.log(`🔵 API 요청: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      })
    }

    return config
  },
  (error) => {
    if (env.debug.logApi) {
      console.error('❌ API 요청 에러:', error)
    }
    return Promise.reject(error)
  },
)

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    // 디버그 모드에서 API 응답 로깅
    if (env.debug.logApi) {
      console.log(`🟢 API 응답: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      })
    }
    return response
  },
  async (error) => {
    const { response, request, config } = error

    // API 에러 로깅
    if (env.debug.logApi) {
      console.error('🔴 API 에러:', {
        url: config?.url,
        method: config?.method,
        status: response?.status,
        message: error.message,
      })
    }

    // 에러 처리
    if (response) {
      switch (response.status) {
        case 401:
          // 인증 실패 - 로그인 페이지로 리다이렉트
          localStorage.removeItem(env.auth.tokenKey)
          localStorage.removeItem(env.auth.refreshTokenKey)
          
          // 현재 페이지가 로그인 페이지가 아닐 때만 리다이렉트
          if (router.currentRoute.value.path !== '/login') {
            router.push({
              path: '/login',
              query: { redirect: router.currentRoute.value.fullPath },
            })
          }
          break
        case 403:
          // 권한 없음
          if (isDebugMode()) {
            console.error('접근 권한이 없습니다.')
          }
          break
        case 404:
          // 리소스를 찾을 수 없음
          if (isDebugMode()) {
            console.error('요청한 리소스를 찾을 수 없습니다.')
          }
          break
        case 500:
          // 서버 오류
          if (isDebugMode()) {
            console.error('서버 오류가 발생했습니다.')
          }
          break
        default:
          if (isDebugMode()) {
            console.error('알 수 없는 오류가 발생했습니다.')
          }
      }
    } else if (request) {
      // 네트워크 오류
      if (isDebugMode()) {
        console.error('네트워크 연결을 확인해주세요.')
      }
    }
    
    return Promise.reject(error)
  },
)

export default apiClient

