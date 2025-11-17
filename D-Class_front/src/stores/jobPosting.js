import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'

export const useJobPostingStore = defineStore('jobPosting', () => {
  const postings = ref([])
  const currentPosting = ref(null)
  const myPostings = ref([])
  const loading = ref(false)
  const pagination = ref({
    count: 0,
    next: null,
    previous: null,
  })

  // 공고 목록 조회
  const fetchPostings = async (params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.JOB_POSTINGS.LIST, { params })
      postings.value = response.data.results
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

  // 공고 상세 조회
  const fetchPostingDetail = async (id) => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.JOB_POSTINGS.DETAIL(id))
      currentPosting.value = response.data
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // 공고 등록
  const createPosting = async (formData) => {
    loading.value = true
    try {
      const response = await apiClient.post(API_ENDPOINTS.JOB_POSTINGS.LIST, formData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || '공고 등록에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 공고 수정
  const updatePosting = async (id, formData) => {
    loading.value = true
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.JOB_POSTINGS.DETAIL(id),
        formData
      )
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || '공고 수정에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 공고 삭제
  const deletePosting = async (id) => {
    loading.value = true
    try {
      await apiClient.delete(API_ENDPOINTS.JOB_POSTINGS.DETAIL(id))
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || '공고 삭제에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 공고 마감
  const closePosting = async (id) => {
    loading.value = true
    try {
      const response = await apiClient.post(API_ENDPOINTS.JOB_POSTINGS.CLOSE(id))
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || '공고 마감에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 내 공고 목록 조회
  const fetchMyPostings = async (params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.JOB_POSTINGS.MY, { params })
      myPostings.value = response.data.results
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

  // 찜 토글
  const toggleFavorite = async (jobPostingId) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.FAVORITES.TOGGLE, {
        job_posting: jobPostingId,
      })
      return { success: true, is_favorited: response.data.is_favorited }
    } catch (error) {
      return { success: false, error }
    }
  }

  return {
    postings,
    currentPosting,
    myPostings,
    loading,
    pagination,
    fetchPostings,
    fetchPostingDetail,
    createPosting,
    updatePosting,
    deletePosting,
    closePosting,
    fetchMyPostings,
    toggleFavorite,
  }
})
