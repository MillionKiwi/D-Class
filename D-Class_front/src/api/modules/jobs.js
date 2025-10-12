/**
 * 공고 관련 API
 */

import apiClient from '../axios'

/**
 * 공고 목록 조회
 * @param {Object} params - 쿼리 파라미터
 * @param {number} params.page - 페이지 번호
 * @param {number} params.limit - 페이지당 개수
 * @param {string} params.region - 지역 필터
 * @param {string[]} params.genres - 장르 필터
 * @param {string[]} params.workTimes - 근무시간 필터
 * @param {string} params.sortBy - 정렬 기준 (latest | salary)
 * @returns {Promise} 공고 목록
 */
export const getJobs = (params) => {
  return apiClient.get('/jobs', { params })
}

/**
 * 공고 상세 조회
 * @param {string} jobId - 공고 ID
 * @returns {Promise} 공고 상세 정보
 */
export const getJobDetail = (jobId) => {
  return apiClient.get(`/jobs/${jobId}`)
}

/**
 * 공고 등록 (학원)
 * @param {Object} jobData - 공고 정보
 * @returns {Promise} 등록된 공고 정보
 */
export const createJob = (jobData) => {
  return apiClient.post('/jobs', jobData)
}

/**
 * 공고 수정 (학원)
 * @param {string} jobId - 공고 ID
 * @param {Object} jobData - 수정할 공고 정보
 * @returns {Promise} 수정된 공고 정보
 */
export const updateJob = (jobId, jobData) => {
  return apiClient.put(`/jobs/${jobId}`, jobData)
}

/**
 * 공고 삭제 (학원)
 * @param {string} jobId - 공고 ID
 * @returns {Promise}
 */
export const deleteJob = (jobId) => {
  return apiClient.delete(`/jobs/${jobId}`)
}

/**
 * 공고 마감 (학원)
 * @param {string} jobId - 공고 ID
 * @returns {Promise}
 */
export const closeJob = (jobId) => {
  return apiClient.patch(`/jobs/${jobId}/close`)
}

/**
 * 공고 지원하기 (강사)
 * @param {string} jobId - 공고 ID
 * @returns {Promise} 지원 정보
 */
export const applyToJob = (jobId) => {
  return apiClient.post(`/jobs/${jobId}/apply`)
}

/**
 * 찜하기 추가 (강사)
 * @param {string} jobId - 공고 ID
 * @returns {Promise}
 */
export const addFavorite = (jobId) => {
  return apiClient.post(`/jobs/${jobId}/favorite`)
}

/**
 * 찜하기 제거 (강사)
 * @param {string} jobId - 공고 ID
 * @returns {Promise}
 */
export const removeFavorite = (jobId) => {
  return apiClient.delete(`/jobs/${jobId}/favorite`)
}

/**
 * 찜한 공고 목록 조회 (강사)
 * @returns {Promise} 찜한 공고 목록
 */
export const getFavoriteJobs = () => {
  return apiClient.get('/jobs/favorites')
}

/**
 * 공고 검색
 * @param {string} keyword - 검색 키워드
 * @param {Object} params - 추가 필터 파라미터
 * @returns {Promise} 검색 결과
 */
export const searchJobs = (keyword, params = {}) => {
  return apiClient.get('/jobs/search', {
    params: { keyword, ...params },
  })
}

