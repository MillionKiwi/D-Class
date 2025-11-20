import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터: 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('[API Client] Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
    })
    return config
  },
  (error) => {
    console.error('[API Client] Request error:', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터: 토큰 갱신 처리
apiClient.interceptors.response.use(
  (response) => {
    console.log('[API Client] Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    })
    return response
  },
  async (error) => {
    const status = error.response?.status
    const data = error.response?.data
    const url = error.config?.url || ''

    const isDuplicateEmailCheck =
      status === 400 &&
      data?.available === false &&
      url.includes('/auth/check-email')

    if (!isDuplicateEmailCheck) {
      console.error('[API Client] Response error:', {
        message: error.message,
        status,
        statusText: error.response?.statusText,
        data,
        url,
        baseURL: error.config?.baseURL,
      })
    }

    const originalRequest = error.config

    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const { access } = response.data
        localStorage.setItem('access_token', access)

        originalRequest.headers.Authorization = `Bearer ${access}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
