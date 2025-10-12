/**
 * 인증 서류 관련 API
 */

import apiClient from '../axios'

/**
 * 인증 서류 제출
 * @param {File[]} files - 서류 파일 배열
 * @returns {Promise} 제출 결과
 */
export const submitVerification = (files) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('documents', file)
  })

  return apiClient.post('/verification/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 인증 상태 조회
 * @returns {Promise} 인증 상태 정보
 */
export const getVerificationStatus = () => {
  return apiClient.get('/verification/status')
}

/**
 * 인증 서류 재제출
 * @param {File[]} files - 서류 파일 배열
 * @returns {Promise} 제출 결과
 */
export const resubmitVerification = (files) => {
  return submitVerification(files)
}

