/**
 * 리뷰 관련 API
 */

import apiClient from '../axios'

/**
 * 리뷰 작성 (강사 → 학원)
 * @param {Object} reviewData - 리뷰 정보
 * @param {string} reviewData.academyId - 학원 ID
 * @param {string} reviewData.jobId - 공고 ID
 * @param {number} reviewData.rating - 평점 (1-5)
 * @param {string} reviewData.content - 리뷰 내용
 * @param {string[]} reviewData.pros - 장점
 * @param {string[]} reviewData.cons - 단점
 * @returns {Promise} 작성된 리뷰 정보
 */
export const createReview = (reviewData) => {
  return apiClient.post('/reviews', reviewData)
}

/**
 * 학원 리뷰 목록 조회
 * @param {string} academyId - 학원 ID
 * @param {Object} params - 쿼리 파라미터
 * @param {number} params.page - 페이지 번호
 * @param {number} params.limit - 페이지당 개수
 * @param {string} params.sortBy - 정렬 기준 (latest | rating)
 * @returns {Promise} 리뷰 목록 및 통계
 */
export const getAcademyReviews = (academyId, params = {}) => {
  return apiClient.get(`/academies/${academyId}/reviews`, { params })
}

/**
 * 내가 작성한 리뷰 목록 조회 (강사)
 * @returns {Promise} 내 리뷰 목록
 */
export const getMyReviews = () => {
  return apiClient.get('/reviews/me')
}

/**
 * 리뷰 상세 조회
 * @param {string} reviewId - 리뷰 ID
 * @returns {Promise} 리뷰 상세 정보
 */
export const getReviewDetail = (reviewId) => {
  return apiClient.get(`/reviews/${reviewId}`)
}

/**
 * 리뷰 수정 (강사)
 * @param {string} reviewId - 리뷰 ID
 * @param {Object} reviewData - 수정할 리뷰 정보
 * @returns {Promise} 수정된 리뷰 정보
 */
export const updateReview = (reviewId, reviewData) => {
  return apiClient.put(`/reviews/${reviewId}`, reviewData)
}

/**
 * 리뷰 삭제 (강사)
 * @param {string} reviewId - 리뷰 ID
 * @returns {Promise}
 */
export const deleteReview = (reviewId) => {
  return apiClient.delete(`/reviews/${reviewId}`)
}

/**
 * 리뷰 신고
 * @param {string} reviewId - 리뷰 ID
 * @param {Object} reportData - 신고 정보
 * @param {string} reportData.reason - 신고 사유
 * @param {string} reportData.description - 상세 설명
 * @returns {Promise}
 */
export const reportReview = (reviewId, reportData) => {
  return apiClient.post(`/reviews/${reviewId}/report`, reportData)
}

