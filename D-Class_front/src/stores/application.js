import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'

export const useApplicationStore = defineStore('application', () => {
  const applications = ref([])
  const currentApplication = ref(null)
  const loading = ref(false)
  const pagination = ref({
    count: 0,
    next: null,
    previous: null,
  })

  // 내 지원 현황 조회
  const fetchMyApplications = async (params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.APPLICATIONS.MY, { params })
      applications.value = response.data.results
      pagination.value = {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      }
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // 지원하기
  const createApplication = async (jobPostingId) => {
    loading.value = true
    try {
      const response = await apiClient.post(API_ENDPOINTS.APPLICATIONS.CREATE, {
        job_posting: jobPostingId,
      })
      return { success: true, data: response.data }
    } catch (error) {
      // 백엔드 응답에서 에러 메시지 추출
      let errorMessage = '지원에 실패했습니다'
      
      if (error.response?.data) {
        const errorData = error.response.data
        // detail 필드가 있으면 사용
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail)
        }
        // message 필드가 있으면 사용
        else if (errorData.message) {
          errorMessage = errorData.message
        }
        // 객체 형태의 에러인 경우
        else if (typeof errorData === 'object') {
          // 첫 번째 에러 메시지를 찾음
          const firstError = Object.values(errorData)[0]
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0]
          } else if (typeof firstError === 'string') {
            errorMessage = firstError
          }
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return {
        success: false,
        error: errorMessage,
        status: error.response?.status,
      }
    } finally {
      loading.value = false
    }
  }

  // 지원자 목록 조회 (학원)
  const fetchApplications = async (params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.APPLICATIONS.LIST, { params })
      applications.value = response.data.results
      pagination.value = {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      }
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // 지원자 상세 조회
  const fetchApplicationDetail = async (id) => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.APPLICATIONS.DETAIL(id))
      currentApplication.value = response.data
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // 채용 확정
  const acceptApplication = async (id) => {
    loading.value = true
    try {
      const response = await apiClient.post(API_ENDPOINTS.APPLICATIONS.ACCEPT(id))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || '채용 확정에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 불합격 처리
  const rejectApplication = async (id, reason = '') => {
    loading.value = true
    try {
      const response = await apiClient.post(API_ENDPOINTS.APPLICATIONS.REJECT(id), {
        reason,
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || '처리에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 지원 취소
  const cancelApplication = async (id) => {
    loading.value = true
    try {
      const response = await apiClient.post(API_ENDPOINTS.APPLICATIONS.CANCEL(id))
      // 취소된 지원을 목록에서 제거
      applications.value = applications.value.filter((app) => app.id !== id)
      return { success: true, data: response.data }
    } catch (error) {
      // 백엔드 응답에서 에러 메시지 추출
      let errorMessage = '지원 취소에 실패했습니다'
      
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail)
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return {
        success: false,
        error: errorMessage,
        status: error.response?.status,
      }
    } finally {
      loading.value = false
    }
  }

  return {
    applications,
    currentApplication,
    loading,
    pagination,
    fetchMyApplications,
    createApplication,
    fetchApplications,
    fetchApplicationDetail,
    acceptApplication,
    rejectApplication,
    cancelApplication,
  }
})
