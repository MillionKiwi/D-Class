/**
 * 공고 관련 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/api'
import { useToast } from '@/composables/useToast'

export const useJobStore = defineStore('job', () => {
  const { success, error: showError } = useToast()

  // State
  const jobs = ref([])
  const currentJob = ref(null)
  const favoriteJobs = ref([])
  const filters = ref({
    region: null,
    genres: [],
    workTimes: [],
    sortBy: 'latest', // latest, salary
  })
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  })
  const isLoading = ref(false)

  // Getters
  const filteredJobs = computed(() => {
    let result = [...jobs.value]

    // 지역 필터
    if (filters.value.region) {
      result = result.filter((job) => job.region === filters.value.region)
    }

    // 장르 필터
    if (filters.value.genres.length > 0) {
      result = result.filter((job) => filters.value.genres.some((genre) => job.genres.includes(genre)))
    }

    // 근무 시간 필터
    if (filters.value.workTimes.length > 0) {
      result = result.filter((job) =>
        filters.value.workTimes.some((time) => job.workTimes.includes(time)),
      )
    }

    // 정렬
    if (filters.value.sortBy === 'salary') {
      result.sort((a, b) => b.salary - a.salary)
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    return result
  })

  const favoriteJobIds = computed(() => favoriteJobs.value.map((job) => job.id))

  const isFavorite = (jobId) => favoriteJobIds.value.includes(jobId)

  // Actions

  /**
   * 공고 목록 조회
   */
  const fetchJobs = async (params = {}) => {
    isLoading.value = true
    try {
      const response = await apiClient.get('/jobs', {
        params: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          ...params,
        },
      })

      const { data, total, page, hasMore } = response.data

      if (page === 1) {
        jobs.value = data
      } else {
        jobs.value = [...jobs.value, ...data]
      }

      pagination.value.total = total
      pagination.value.page = page
      pagination.value.hasMore = hasMore

      return { success: true }
    } catch (err) {
      showError('공고 목록을 불러오는데 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 공고 상세 조회
   */
  const fetchJobDetail = async (jobId) => {
    isLoading.value = true
    try {
      const response = await apiClient.get(`/jobs/${jobId}`)
      currentJob.value = response.data
      return { success: true, data: response.data }
    } catch (err) {
      showError('공고 정보를 불러오는데 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 공고 등록 (학원)
   */
  const createJob = async (jobData) => {
    isLoading.value = true
    try {
      const response = await apiClient.post('/jobs', jobData)
      success('공고가 등록되었습니다. 관리자 검토 후 게시됩니다.')
      return { success: true, data: response.data }
    } catch (err) {
      showError('공고 등록에 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 공고 수정 (학원)
   */
  const updateJob = async (jobId, jobData) => {
    isLoading.value = true
    try {
      const response = await apiClient.put(`/jobs/${jobId}`, jobData)
      success('공고가 수정되었습니다.')
      return { success: true, data: response.data }
    } catch (err) {
      showError('공고 수정에 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 공고 삭제 (학원)
   */
  const deleteJob = async (jobId) => {
    try {
      await apiClient.delete(`/jobs/${jobId}`)
      jobs.value = jobs.value.filter((job) => job.id !== jobId)
      success('공고가 삭제되었습니다.')
      return { success: true }
    } catch (err) {
      showError('공고 삭제에 실패했습니다.')
      return { success: false, error: err }
    }
  }

  /**
   * 공고 마감 (학원)
   */
  const closeJob = async (jobId) => {
    try {
      await apiClient.patch(`/jobs/${jobId}/close`)
      const job = jobs.value.find((j) => j.id === jobId)
      if (job) {
        job.status = 'closed'
      }
      success('공고가 마감되었습니다.')
      return { success: true }
    } catch (err) {
      showError('공고 마감에 실패했습니다.')
      return { success: false, error: err }
    }
  }

  /**
   * 찜하기 추가
   */
  const addFavorite = async (jobId) => {
    try {
      await apiClient.post(`/jobs/${jobId}/favorite`)
      const job = jobs.value.find((j) => j.id === jobId)
      if (job && !favoriteJobs.value.find((f) => f.id === jobId)) {
        favoriteJobs.value.push(job)
      }
      success('찜 목록에 추가되었습니다.')
      return { success: true }
    } catch (err) {
      showError('찜하기에 실패했습니다.')
      return { success: false, error: err }
    }
  }

  /**
   * 찜하기 제거
   */
  const removeFavorite = async (jobId) => {
    try {
      await apiClient.delete(`/jobs/${jobId}/favorite`)
      favoriteJobs.value = favoriteJobs.value.filter((job) => job.id !== jobId)
      success('찜 목록에서 제거되었습니다.')
      return { success: true }
    } catch (err) {
      showError('찜 해제에 실패했습니다.')
      return { success: false, error: err }
    }
  }

  /**
   * 찜한 공고 목록 조회
   */
  const fetchFavoriteJobs = async () => {
    try {
      const response = await apiClient.get('/jobs/favorites')
      favoriteJobs.value = response.data
      return { success: true }
    } catch (err) {
      showError('찜한 공고 목록을 불러오는데 실패했습니다.')
      return { success: false, error: err }
    }
  }

  /**
   * 필터 설정
   */
  const setFilter = (key, value) => {
    filters.value[key] = value
    pagination.value.page = 1
  }

  /**
   * 필터 초기화
   */
  const resetFilters = () => {
    filters.value = {
      region: null,
      genres: [],
      workTimes: [],
      sortBy: 'latest',
    }
    pagination.value.page = 1
  }

  /**
   * 다음 페이지 로드
   */
  const loadMore = async () => {
    if (!pagination.value.hasMore || isLoading.value) return

    pagination.value.page += 1
    await fetchJobs()
  }

  return {
    // State
    jobs,
    currentJob,
    favoriteJobs,
    filters,
    pagination,
    isLoading,
    // Getters
    filteredJobs,
    favoriteJobIds,
    isFavorite,
    // Actions
    fetchJobs,
    fetchJobDetail,
    createJob,
    updateJob,
    deleteJob,
    closeJob,
    addFavorite,
    removeFavorite,
    fetchFavoriteJobs,
    setFilter,
    resetFilters,
    loadMore,
  }
})

