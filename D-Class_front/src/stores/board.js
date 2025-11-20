import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'

export const useBoardStore = defineStore('board', () => {
  const posts = ref([])
  const currentPost = ref(null)
  const loading = ref(false)
  const pagination = ref({
    count: 0,
    next: null,
    previous: null,
  })

  // 게시글 목록 조회
  const fetchPosts = async (params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.BOARDS.POSTS.LIST, { params })
      posts.value = response.data.results || response.data
      if (response.data.count !== undefined) {
        pagination.value = {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        }
      }
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // 게시글 상세 조회
  const fetchPostDetail = async (id) => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.BOARDS.POSTS.DETAIL(id))
      currentPost.value = response.data
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // 게시글 작성
  const createPost = async (formData) => {
    loading.value = true
    try {
      const response = await apiClient.post(API_ENDPOINTS.BOARDS.POSTS.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return { success: true, data: response.data }
    } catch (error) {
      let errorMessage = '게시글 작성에 실패했습니다'
      
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail)
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (typeof errorData === 'object') {
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

  // 게시글 수정
  const updatePost = async (id, formData) => {
    loading.value = true
    try {
      const response = await apiClient.patch(API_ENDPOINTS.BOARDS.POSTS.UPDATE(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return { success: true, data: response.data }
    } catch (error) {
      let errorMessage = '게시글 수정에 실패했습니다'
      
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail)
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (typeof errorData === 'object') {
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

  // 게시글 삭제
  const deletePost = async (id) => {
    loading.value = true
    try {
      await apiClient.delete(API_ENDPOINTS.BOARDS.POSTS.DELETE(id))
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || '게시글 삭제에 실패했습니다',
      }
    } finally {
      loading.value = false
    }
  }

  // 조회수 증가
  const incrementViews = async (id) => {
    try {
      await apiClient.post(API_ENDPOINTS.BOARDS.POSTS.INCREMENT_VIEWS(id))
    } catch (error) {
      console.error('Failed to increment views:', error)
    }
  }

  return {
    posts,
    currentPost,
    loading,
    pagination,
    fetchPosts,
    fetchPostDetail,
    createPost,
    updatePost,
    deletePost,
    incrementViews,
  }
})

