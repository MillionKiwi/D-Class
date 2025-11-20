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
      // 페이지가 1이면 기존 목록을 교체, 아니면 추가
      const page = params.page || 1
      if (page === 1) {
        postings.value = response.data.results
      } else {
        postings.value = [...postings.value, ...response.data.results]
      }
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
      // 백엔드 응답에서 에러 메시지 추출
      let errorMessage = '공고 등록에 실패했습니다'
      
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail)
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
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
      // 백엔드 응답에서 에러 메시지 추출
      let errorMessage = '공고 수정에 실패했습니다'
      
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail)
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
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
      // 401 에러는 토큰 갱신 후 재시도되므로, 여기서는 다른 에러만 처리
      if (error.response?.status === 401) {
        // 토큰 갱신 후 재시도는 인터셉터에서 처리되므로, 여기서는 에러 반환
        return { 
          success: false, 
          error: '인증이 필요합니다. 다시 시도해주세요.',
          status: 401
        }
      }
      return { 
        success: false, 
        error: error.response?.data?.detail || '찜하기 처리 중 오류가 발생했습니다'
      }
    }
  }

  // 지도용 공고 목록 조회
  const fetchMapPostings = async (params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.JOB_POSTINGS.MAP, { params })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
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
    fetchMapPostings,
  }
})
