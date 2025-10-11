import axios from 'axios'
import router from '@/router'

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 에러 처리
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 인증 실패 - 로그인 페이지로 리다이렉트
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          router.push('/login')
          break
        case 403:
          // 권한 없음
          console.error('접근 권한이 없습니다.')
          break
        case 404:
          // 리소스를 찾을 수 없음
          console.error('요청한 리소스를 찾을 수 없습니다.')
          break
        case 500:
          // 서버 오류
          console.error('서버 오류가 발생했습니다.')
          break
        default:
          console.error('알 수 없는 오류가 발생했습니다.')
      }
    } else if (error.request) {
      // 네트워크 오류
      console.error('네트워크 연결을 확인해주세요.')
    }
    return Promise.reject(error)
  },
)

export default apiClient

