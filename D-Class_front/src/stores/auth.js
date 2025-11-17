import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)

  // 로그인
  const login = async (email, password) => {
    loading.value = true
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      })

      const { access, refresh, user: userData } = response.data
      
      localStorage.setItem('access_token', access)
      if (refresh) {
        localStorage.setItem('refresh_token', refresh)
      }

      user.value = userData
      isAuthenticated.value = true

      return { success: true, user: userData }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || '로그인에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 회원가입
  const register = async (formData) => {
    loading.value = true
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, formData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || '회원가입에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 이메일 중복 확인
  const checkEmail = async (email) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.CHECK_EMAIL, {
        params: { email },
      })
      return { success: true, available: response.data.available }
    } catch (error) {
      return {
        success: false,
        available: false,
        error: error.response?.data?.message || '이메일 확인에 실패했습니다',
      }
    }
  }

  // 로그아웃
  const logout = async () => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      user.value = null
      isAuthenticated.value = false
    }
  }

  // 현재 사용자 정보 조회
  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.ME)
      user.value = response.data
      isAuthenticated.value = true
      return { success: true, user: response.data }
    } catch (error) {
      isAuthenticated.value = false
      return { success: false, error }
    }
  }

  // 초기화: 저장된 토큰 확인
  const init = async () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      await fetchCurrentUser()
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    checkEmail,
    logout,
    fetchCurrentUser,
    init,
  }
})
