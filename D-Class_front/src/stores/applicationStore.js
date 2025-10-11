/**
 * 지원 관련 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/api'
import { useToast } from '@/composables/useToast'
import { APPLICATION_STATUS } from '@/utils/constants'

export const useApplicationStore = defineStore('application', () => {
  const { success, error: showError } = useToast()

  // State
  const applications = ref([])
  const currentApplication = ref(null)
  const applicants = ref([]) // 학원에서 보는 지원자 목록
  const isLoading = ref(false)

  // Getters
  const applicationsByStatus = computed(() => {
    return (status) => {
      if (!status) return applications.value
      return applications.value.filter((app) => app.status === status)
    }
  })

  const applicationCount = computed(() => applications.value.length)

  const applicantsByStatus = computed(() => {
    return (status) => {
      if (!status) return applicants.value
      return applicants.value.filter((applicant) => applicant.status === status)
    }
  })

  const newApplicantsCount = computed(() => {
    return applicants.value.filter((applicant) => applicant.status === APPLICATION_STATUS.APPLIED)
      .length
  })

  // Actions

  /**
   * 공고 지원하기 (강사)
   */
  const applyToJob = async (jobId) => {
    isLoading.value = true
    try {
      const response = await apiClient.post(`/jobs/${jobId}/apply`)
      applications.value.push(response.data)
      success('지원이 완료되었습니다.')
      return { success: true, data: response.data }
    } catch (err) {
      showError(err.response?.data?.message || '지원 처리 중 오류가 발생했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 지원 현황 조회 (강사)
   */
  const fetchMyApplications = async () => {
    isLoading.value = true
    try {
      const response = await apiClient.get('/applications/me')
      applications.value = response.data
      return { success: true }
    } catch (err) {
      showError('지원 현황을 불러오는데 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 지원 상세 조회 (강사)
   */
  const fetchApplicationDetail = async (applicationId) => {
    isLoading.value = true
    try {
      const response = await apiClient.get(`/applications/${applicationId}`)
      currentApplication.value = response.data
      return { success: true, data: response.data }
    } catch (err) {
      showError('지원 정보를 불러오는데 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 지원자 목록 조회 (학원)
   */
  const fetchApplicants = async (jobId = null) => {
    isLoading.value = true
    try {
      const params = jobId ? { jobId } : {}
      const response = await apiClient.get('/applicants', { params })
      applicants.value = response.data
      return { success: true }
    } catch (err) {
      showError('지원자 목록을 불러오는데 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 지원자 상세 조회 (학원)
   */
  const fetchApplicantDetail = async (applicantId) => {
    isLoading.value = true
    try {
      const response = await apiClient.get(`/applicants/${applicantId}`)
      return { success: true, data: response.data }
    } catch (err) {
      showError('지원자 정보를 불러오는데 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 채용 확정 (학원)
   */
  const acceptApplicant = async (applicantId) => {
    isLoading.value = true
    try {
      await apiClient.patch(`/applicants/${applicantId}/accept`)
      
      // 상태 업데이트
      const applicant = applicants.value.find((a) => a.id === applicantId)
      if (applicant) {
        applicant.status = APPLICATION_STATUS.ACCEPTED
      }

      success('채용이 확정되었습니다.')
      return { success: true }
    } catch (err) {
      showError('채용 확정에 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 불합격 처리 (학원)
   */
  const rejectApplicant = async (applicantId) => {
    isLoading.value = true
    try {
      await apiClient.patch(`/applicants/${applicantId}/reject`)
      
      // 상태 업데이트
      const applicant = applicants.value.find((a) => a.id === applicantId)
      if (applicant) {
        applicant.status = APPLICATION_STATUS.REJECTED
      }

      success('불합격 처리되었습니다.')
      return { success: true }
    } catch (err) {
      showError('불합격 처리에 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 채용 확정 목록 조회 (학원)
   */
  const fetchHiredList = async () => {
    try {
      const response = await apiClient.get('/applicants/hired')
      return { success: true, data: response.data }
    } catch (err) {
      showError('채용 현황을 불러오는데 실패했습니다.')
      return { success: false, error: err }
    }
  }

  return {
    // State
    applications,
    currentApplication,
    applicants,
    isLoading,
    // Getters
    applicationsByStatus,
    applicationCount,
    applicantsByStatus,
    newApplicantsCount,
    // Actions
    applyToJob,
    fetchMyApplications,
    fetchApplicationDetail,
    fetchApplicants,
    fetchApplicantDetail,
    acceptApplicant,
    rejectApplicant,
    fetchHiredList,
  }
})

