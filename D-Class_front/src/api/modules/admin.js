/**
 * 관리자 관련 API
 */

import apiClient from '../axios'

/**
 * 대시보드 통계 조회
 * @returns {Promise} 통계 정보
 */
export const getDashboardStats = () => {
  return apiClient.get('/admin/dashboard/stats')
}

/**
 * 회원 관리 목록 조회
 * @param {Object} params - 쿼리 파라미터
 * @param {string} params.role - 역할 필터 (instructor | academy | all)
 * @param {string} params.status - 상태 필터 (active | suspended | all)
 * @param {number} params.page - 페이지 번호
 * @param {number} params.limit - 페이지당 개수
 * @returns {Promise} 회원 목록
 */
export const getUsers = (params = {}) => {
  return apiClient.get('/admin/users', { params })
}

/**
 * 회원 상세 조회
 * @param {string} userId - 회원 ID
 * @returns {Promise} 회원 상세 정보
 */
export const getUserDetail = (userId) => {
  return apiClient.get(`/admin/users/${userId}`)
}

/**
 * 회원 정지
 * @param {string} userId - 회원 ID
 * @param {Object} data - 정지 정보
 * @param {string} data.reason - 정지 사유
 * @param {string} data.duration - 정지 기간
 * @returns {Promise}
 */
export const suspendUser = (userId, data) => {
  return apiClient.patch(`/admin/users/${userId}/suspend`, data)
}

/**
 * 회원 정지 해제
 * @param {string} userId - 회원 ID
 * @returns {Promise}
 */
export const unsuspendUser = (userId) => {
  return apiClient.patch(`/admin/users/${userId}/unsuspend`)
}

/**
 * 인증 심사 목록 조회
 * @param {Object} params - 쿼리 파라미터
 * @param {string} params.status - 상태 필터 (pending | approved | rejected)
 * @returns {Promise} 인증 심사 목록
 */
export const getVerifications = (params = {}) => {
  return apiClient.get('/admin/verifications', { params })
}

/**
 * 인증 상세 조회
 * @param {string} verificationId - 인증 ID
 * @returns {Promise} 인증 상세 정보
 */
export const getVerificationDetail = (verificationId) => {
  return apiClient.get(`/admin/verifications/${verificationId}`)
}

/**
 * 인증 승인
 * @param {string} verificationId - 인증 ID
 * @returns {Promise}
 */
export const approveVerification = (verificationId) => {
  return apiClient.patch(`/admin/verifications/${verificationId}/approve`)
}

/**
 * 인증 반려
 * @param {string} verificationId - 인증 ID
 * @param {Object} data - 반려 정보
 * @param {string} data.message - 반려 사유
 * @returns {Promise}
 */
export const rejectVerification = (verificationId, data) => {
  return apiClient.patch(`/admin/verifications/${verificationId}/reject`, data)
}

/**
 * 공고 관리 목록 조회
 * @param {Object} params - 쿼리 파라미터
 * @param {string} params.status - 상태 필터
 * @param {number} params.page - 페이지 번호
 * @param {number} params.limit - 페이지당 개수
 * @returns {Promise} 공고 목록
 */
export const getJobsForAdmin = (params = {}) => {
  return apiClient.get('/admin/jobs', { params })
}

/**
 * 공고 승인
 * @param {string} jobId - 공고 ID
 * @returns {Promise}
 */
export const approveJob = (jobId) => {
  return apiClient.patch(`/admin/jobs/${jobId}/approve`)
}

/**
 * 공고 반려
 * @param {string} jobId - 공고 ID
 * @param {Object} data - 반려 정보
 * @param {string} data.message - 반려 사유
 * @returns {Promise}
 */
export const rejectJob = (jobId, data) => {
  return apiClient.patch(`/admin/jobs/${jobId}/reject`, data)
}

/**
 * 공고 삭제 (관리자)
 * @param {string} jobId - 공고 ID
 * @returns {Promise}
 */
export const deleteJobByAdmin = (jobId) => {
  return apiClient.delete(`/admin/jobs/${jobId}`)
}

/**
 * 리뷰 관리 목록 조회
 * @param {Object} params - 쿼리 파라미터
 * @returns {Promise} 리뷰 목록
 */
export const getReviewsForAdmin = (params = {}) => {
  return apiClient.get('/admin/reviews', { params })
}

/**
 * 리뷰 삭제 (관리자)
 * @param {string} reviewId - 리뷰 ID
 * @returns {Promise}
 */
export const deleteReviewByAdmin = (reviewId) => {
  return apiClient.delete(`/admin/reviews/${reviewId}`)
}

/**
 * 문의 목록 조회
 * @param {Object} params - 쿼리 파라미터
 * @returns {Promise} 문의 목록
 */
export const getInquiries = (params = {}) => {
  return apiClient.get('/admin/inquiries', { params })
}

/**
 * 문의 답변 작성
 * @param {string} inquiryId - 문의 ID
 * @param {Object} data - 답변 정보
 * @param {string} data.answer - 답변 내용
 * @returns {Promise}
 */
export const answerInquiry = (inquiryId, data) => {
  return apiClient.post(`/admin/inquiries/${inquiryId}/answer`, data)
}

