/**
 * 인증 관련 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/api'
import { USER_ROLES, STORAGE_KEYS } from '@/utils/constants'
import { storage } from '@/utils/helpers'
import { useToast } from '@/composables/useToast'

export const useAuthStore = defineStore('auth', () => {
  const { success, error: showError } = useToast()

  // State
  const user = ref(null)
  const accessToken = ref(null)
  const refreshToken = ref(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value)
  const userRole = computed(() => user.value?.role || null)
  const isInstructor = computed(() => userRole.value === USER_ROLES.INSTRUCTOR)
  const isAcademy = computed(() => userRole.value === USER_ROLES.ACADEMY)
  const isAdmin = computed(() => userRole.value === USER_ROLES.ADMIN)
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')

  // Actions

  /**
   * 로그인
   */
  const login = async (credentials) => {
    isLoading.value = true
    try {
      const response = await apiClient.post('/auth/login', credentials)
      const { user: userData, accessToken: token, refreshToken: refresh } = response.data

      // 상태 업데이트
      user.value = userData
      accessToken.value = token
      refreshToken.value = refresh

      // 로컬 스토리지에 저장
      storage.set(STORAGE_KEYS.USER_INFO, userData)
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, token)
      storage.set(STORAGE_KEYS.REFRESH_TOKEN, refresh)

      success('로그인되었습니다.')

      return { success: true, redirectPath: getRedirectPath(userData.role) }
    } catch (err) {
      showError(err.response?.data?.message || '로그인에 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 회원가입
   */
  const signup = async (signupData) => {
    isLoading.value = true
    try {
      await apiClient.post('/auth/signup', signupData)
      success('회원가입이 완료되었습니다. 로그인해주세요.')
      return { success: true, shouldRedirect: '/login' }
    } catch (err) {
      showError(err.response?.data?.message || '회원가입에 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 로그아웃
   */
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // 상태 초기화
      user.value = null
      accessToken.value = null
      refreshToken.value = null

      // 로컬 스토리지 클리어
      storage.remove(STORAGE_KEYS.USER_INFO)
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN)

      success('로그아웃되었습니다.')
    }
  }

  /**
   * 토큰 갱신
   */
  const refreshAccessToken = async () => {
    try {
      const response = await apiClient.post('/auth/refresh', {
        refreshToken: refreshToken.value,
      })
      const { accessToken: newToken } = response.data

      accessToken.value = newToken
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, newToken)

      return { success: true }
    } catch (err) {
      // 리프레시 실패 시 로그아웃
      await logout()
      return { success: false, error: err }
    }
  }

  /**
   * 현재 사용자 정보 가져오기
   */
  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get('/auth/me')
      user.value = response.data
      storage.set(STORAGE_KEYS.USER_INFO, response.data)
      return { success: true }
    } catch (err) {
      console.error('Failed to fetch current user:', err)
      return { success: false, error: err }
    }
  }

  /**
   * 로컬 스토리지에서 인증 정보 복원
   */
  const restoreAuth = () => {
    const storedUser = storage.get(STORAGE_KEYS.USER_INFO)
    const storedAccessToken = storage.get(STORAGE_KEYS.ACCESS_TOKEN)
    const storedRefreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN)

    if (storedUser && storedAccessToken) {
      user.value = storedUser
      accessToken.value = storedAccessToken
      refreshToken.value = storedRefreshToken
    }
  }

  /**
   * 역할에 따른 리다이렉트 경로
   */
  const getRedirectPath = (role) => {
    const paths = {
      [USER_ROLES.INSTRUCTOR]: '/instructor/jobs',
      [USER_ROLES.ACADEMY]: '/academy/jobs',
      [USER_ROLES.ADMIN]: '/admin/dashboard',
    }
    return paths[role] || '/'
  }

  // 초기화 시 인증 정보 복원
  restoreAuth()

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    // Getters
    isAuthenticated,
    userRole,
    isInstructor,
    isAcademy,
    isAdmin,
    userName,
    userEmail,
    // Actions
    login,
    signup,
    logout,
    refreshAccessToken,
    fetchCurrentUser,
    restoreAuth,
    getRedirectPath,
  }
})

