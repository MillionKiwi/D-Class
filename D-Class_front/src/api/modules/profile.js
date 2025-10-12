/**
 * 프로필 관련 API
 */

import apiClient from '../axios'

/**
 * 프로필 조회
 * @returns {Promise} 프로필 정보
 */
export const getProfile = () => {
  return apiClient.get('/profile')
}

/**
 * 프로필 업데이트
 * @param {Object} profileData - 프로필 정보
 * @returns {Promise} 업데이트된 프로필 정보
 */
export const updateProfile = (profileData) => {
  return apiClient.put('/profile', profileData)
}

/**
 * 프로필 이미지 업로드
 * @param {File} file - 이미지 파일
 * @returns {Promise} 업로드된 이미지 URL
 */
export const uploadProfileImage = (file) => {
  const formData = new FormData()
  formData.append('image', file)

  return apiClient.post('/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 경력 추가 (강사)
 * @param {Object} careerData - 경력 정보
 * @returns {Promise} 추가된 경력 정보
 */
export const addCareer = (careerData) => {
  return apiClient.post('/profile/careers', careerData)
}

/**
 * 경력 수정 (강사)
 * @param {string} careerId - 경력 ID
 * @param {Object} careerData - 수정할 경력 정보
 * @returns {Promise} 수정된 경력 정보
 */
export const updateCareer = (careerId, careerData) => {
  return apiClient.put(`/profile/careers/${careerId}`, careerData)
}

/**
 * 경력 삭제 (강사)
 * @param {string} careerId - 경력 ID
 * @returns {Promise}
 */
export const deleteCareer = (careerId) => {
  return apiClient.delete(`/profile/careers/${careerId}`)
}

/**
 * 학력 추가 (강사)
 * @param {Object} educationData - 학력 정보
 * @returns {Promise} 추가된 학력 정보
 */
export const addEducation = (educationData) => {
  return apiClient.post('/profile/educations', educationData)
}

/**
 * 학력 수정 (강사)
 * @param {string} educationId - 학력 ID
 * @param {Object} educationData - 수정할 학력 정보
 * @returns {Promise} 수정된 학력 정보
 */
export const updateEducation = (educationId, educationData) => {
  return apiClient.put(`/profile/educations/${educationId}`, educationData)
}

/**
 * 학력 삭제 (강사)
 * @param {string} educationId - 학력 ID
 * @returns {Promise}
 */
export const deleteEducation = (educationId) => {
  return apiClient.delete(`/profile/educations/${educationId}`)
}

/**
 * 다른 사용자 프로필 조회 (공개 프로필)
 * @param {string} userId - 사용자 ID
 * @returns {Promise} 프로필 정보
 */
export const getUserProfile = (userId) => {
  return apiClient.get(`/profiles/${userId}`)
}

/**
 * 학원 프로필 조회
 * @param {string} academyId - 학원 ID
 * @returns {Promise} 학원 프로필 정보
 */
export const getAcademyProfile = (academyId) => {
  return apiClient.get(`/academies/${academyId}/profile`)
}

