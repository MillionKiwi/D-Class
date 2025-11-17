import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'

export const useReviewStore = defineStore('review', () => {
  const reviews = ref([])
  const currentReview = ref(null)
  const loading = ref(false)
  const pagination = ref({
    count: 0,
    next: null,
    previous: null,
  })

  // 리뷰 작성
  const createReview = async (formData) => {
    loading.value = true
    try {
      const response = await apiClient.post(API_ENDPOINTS.REVIEWS.CREATE, formData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || '리뷰 작성에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 리뷰 수정
  const updateReview = async (id, formData) => {
    loading.value = true
    try {
      const response = await apiClient.patch(API_ENDPOINTS.REVIEWS.UPDATE(id), formData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || '리뷰 수정에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 리뷰 삭제
  const deleteReview = async (id) => {
    loading.value = true
    try {
      await apiClient.delete(API_ENDPOINTS.REVIEWS.DELETE(id))
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || '리뷰 삭제에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 내가 작성한 리뷰 목록
  const fetchMyReviews = async (params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.REVIEWS.MY, { params })
      reviews.value = response.data.results
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

  // 학원 리뷰 목록
  const fetchAcademyReviews = async (academyId, params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.REVIEWS.ACADEMY(academyId), { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // 강사 리뷰 목록
  const fetchInstructorReviews = async (instructorId, params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.REVIEWS.INSTRUCTOR(instructorId), {
        params,
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    reviews,
    currentReview,
    loading,
    pagination,
    createReview,
    updateReview,
    deleteReview,
    fetchMyReviews,
    fetchAcademyReviews,
    fetchInstructorReviews,
  }
})
