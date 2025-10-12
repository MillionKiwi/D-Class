/**
 * 지원 관련 API
 */

import apiClient from '../axios'

/**
 * 내 지원 현황 조회 (강사)
 * @returns {Promise} 지원 목록
 */
export const getMyApplications = () => {
  return apiClient.get('/applications/me')
}

/**
 * 지원 상세 조회
 * @param {string} applicationId - 지원 ID
 * @returns {Promise} 지원 상세 정보
 */
export const getApplicationDetail = (applicationId) => {
  return apiClient.get(`/applications/${applicationId}`)
}

/**
 * 지원자 목록 조회 (학원)
 * @param {Object} params - 쿼리 파라미터
 * @param {string} params.jobId - 공고 ID (선택)
 * @param {string} params.status - 상태 필터 (선택)
 * @returns {Promise} 지원자 목록
 */
export const getApplicants = (params = {}) => {
  return apiClient.get('/applicants', { params })
}

/**
 * 지원자 상세 조회 (학원)
 * @param {string} applicantId - 지원자 ID
 * @returns {Promise} 지원자 상세 정보
 */
export const getApplicantDetail = (applicantId) => {
  return apiClient.get(`/applicants/${applicantId}`)
}

/**
 * 채용 확정 (학원)
 * @param {string} applicantId - 지원자 ID
 * @returns {Promise}
 */
export const acceptApplicant = (applicantId) => {
  return apiClient.patch(`/applicants/${applicantId}/accept`)
}

/**
 * 불합격 처리 (학원)
 * @param {string} applicantId - 지원자 ID
 * @param {string} message - 불합격 메시지 (선택)
 * @returns {Promise}
 */
export const rejectApplicant = (applicantId, message = null) => {
  return apiClient.patch(`/applicants/${applicantId}/reject`, 
    message ? { message } : {}
  )
}

/**
 * 채용 확정 목록 조회 (학원)
 * @returns {Promise} 채용 확정 목록
 */
export const getHiredList = () => {
  return apiClient.get('/applicants/hired')
}

