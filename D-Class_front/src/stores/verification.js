import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'

export const useVerificationStore = defineStore('verification', () => {
  const verification = ref(null)
  const loading = ref(false)

  // 인증 서류 제출 (강사)
  const submitInstructorVerification = async (files) => {
    loading.value = true
    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })

      const response = await apiClient.post(API_ENDPOINTS.VERIFICATIONS.INSTRUCTOR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || '인증 서류 제출에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 인증 상태 조회 (강사)
  const fetchInstructorVerification = async () => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.VERIFICATIONS.INSTRUCTOR_ME)
      verification.value = response.data
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // 인증 서류 재제출 (강사)
  const resubmitInstructorVerification = async (files) => {
    loading.value = true
    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })

      const response = await apiClient.post(
        API_ENDPOINTS.VERIFICATIONS.INSTRUCTOR_RESUBMIT,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || '인증 서류 재제출에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 인증 서류 제출 (학원)
  const submitAcademyVerification = async (file) => {
    loading.value = true
    try {
      const formData = new FormData()
      formData.append('files', file)

      const response = await apiClient.post(API_ENDPOINTS.VERIFICATIONS.ACADEMY, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || '인증 서류 제출에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 인증 상태 조회 (학원)
  const fetchAcademyVerification = async () => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.VERIFICATIONS.ACADEMY_ME)
      verification.value = response.data
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    verification,
    loading,
    submitInstructorVerification,
    fetchInstructorVerification,
    resubmitInstructorVerification,
    submitAcademyVerification,
    fetchAcademyVerification,
  }
})
