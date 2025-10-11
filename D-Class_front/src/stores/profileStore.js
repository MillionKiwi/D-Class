/**
 * 프로필 관련 Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/api'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from './authStore'

export const useProfileStore = defineStore('profile', () => {
  const { success, error: showError } = useToast()
  const authStore = useAuthStore()

  // State
  const profile = ref(null)
  const verificationStatus = ref(null)
  const isLoading = ref(false)

  // Actions

  /**
   * 프로필 조회
   */
  const fetchProfile = async () => {
    isLoading.value = true
    try {
      const response = await apiClient.get('/profile')
      profile.value = response.data
      return { success: true, data: response.data }
    } catch (err) {
      showError('프로필 정보를 불러오는데 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 프로필 업데이트 (강사/학원)
   */
  const updateProfile = async (profileData) => {
    isLoading.value = true
    try {
      const response = await apiClient.put('/profile', profileData)
      profile.value = response.data
      
      // 사용자 정보도 업데이트
      if (authStore.user) {
        authStore.user.name = response.data.name
      }

      success('프로필이 저장되었습니다.')
      return { success: true, data: response.data }
    } catch (err) {
      showError('프로필 저장에 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 프로필 사진 업로드
   */
  const uploadProfileImage = async (file) => {
    isLoading.value = true
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await apiClient.post('/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (profile.value) {
        profile.value.profileImage = response.data.imageUrl
      }

      success('프로필 사진이 업로드되었습니다.')
      return { success: true, data: response.data }
    } catch (err) {
      showError('이미지 업로드에 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 인증 서류 제출
   */
  const submitVerification = async (files) => {
    isLoading.value = true
    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('documents', file)
      })

      const response = await apiClient.post('/verification/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      verificationStatus.value = response.data.status
      success('인증 신청이 완료되었습니다. 검토까지 1-2일 소요됩니다.')
      return { success: true, data: response.data }
    } catch (err) {
      showError('인증 신청에 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 인증 상태 조회
   */
  const fetchVerificationStatus = async () => {
    try {
      const response = await apiClient.get('/verification/status')
      verificationStatus.value = response.data
      return { success: true, data: response.data }
    } catch (err) {
      console.error('Failed to fetch verification status:', err)
      return { success: false, error: err }
    }
  }

  /**
   * 경력 추가 (강사)
   */
  const addCareer = async (careerData) => {
    try {
      const response = await apiClient.post('/profile/careers', careerData)
      if (profile.value) {
        profile.value.careers = profile.value.careers || []
        profile.value.careers.push(response.data)
      }
      success('경력이 추가되었습니다.')
      return { success: true, data: response.data }
    } catch (err) {
      showError('경력 추가에 실패했습니다.')
      return { success: false, error: err }
    }
  }

  /**
   * 경력 삭제 (강사)
   */
  const deleteCareer = async (careerId) => {
    try {
      await apiClient.delete(`/profile/careers/${careerId}`)
      if (profile.value?.careers) {
        profile.value.careers = profile.value.careers.filter((c) => c.id !== careerId)
      }
      success('경력이 삭제되었습니다.')
      return { success: true }
    } catch (err) {
      showError('경력 삭제에 실패했습니다.')
      return { success: false, error: err }
    }
  }

  /**
   * 학력 추가 (강사)
   */
  const addEducation = async (educationData) => {
    try {
      const response = await apiClient.post('/profile/educations', educationData)
      if (profile.value) {
        profile.value.educations = profile.value.educations || []
        profile.value.educations.push(response.data)
      }
      success('학력이 추가되었습니다.')
      return { success: true, data: response.data }
    } catch (err) {
      showError('학력 추가에 실패했습니다.')
      return { success: false, error: err }
    }
  }

  /**
   * 학력 삭제 (강사)
   */
  const deleteEducation = async (educationId) => {
    try {
      await apiClient.delete(`/profile/educations/${educationId}`)
      if (profile.value?.educations) {
        profile.value.educations = profile.value.educations.filter((e) => e.id !== educationId)
      }
      success('학력이 삭제되었습니다.')
      return { success: true }
    } catch (err) {
      showError('학력 삭제에 실패했습니다.')
      return { success: false, error: err }
    }
  }

  return {
    // State
    profile,
    verificationStatus,
    isLoading,
    // Actions
    fetchProfile,
    updateProfile,
    uploadProfileImage,
    submitVerification,
    fetchVerificationStatus,
    addCareer,
    deleteCareer,
    addEducation,
    deleteEducation,
  }
})

