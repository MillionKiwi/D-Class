/**
 * 인증 관련 API
 */

import apiClient from '../axios'

/**
 * 로그인
 * @param {Object} credentials - 로그인 정보
 * @param {string} credentials.email - 이메일
 * @param {string} credentials.password - 비밀번호
 * @returns {Promise} 사용자 정보 및 토큰
 */
export const login = (credentials) => {
  return apiClient.post('/auth/login', credentials)
}

/**
 * 회원가입
 * @param {Object} signupData - 회원가입 정보
 * @param {string} signupData.email - 이메일
 * @param {string} signupData.password - 비밀번호
 * @param {string} signupData.name - 이름
 * @param {string} signupData.role - 역할 (instructor | academy)
 * @param {string} signupData.phone - 전화번호
 * @param {boolean} signupData.agreedToTerms - 이용약관 동의
 * @param {boolean} signupData.agreedToPrivacy - 개인정보처리방침 동의
 * @returns {Promise}
 */
export const signup = (signupData) => {
  return apiClient.post('/auth/signup', signupData)
}

/**
 * 로그아웃
 * @returns {Promise}
 */
export const logout = () => {
  return apiClient.post('/auth/logout')
}

/**
 * 토큰 갱신
 * @param {string} refreshToken - 리프레시 토큰
 * @returns {Promise} 새로운 액세스 토큰
 */
export const refreshAccessToken = (refreshToken) => {
  return apiClient.post('/auth/refresh', { refreshToken })
}

/**
 * 현재 사용자 정보 조회
 * @returns {Promise} 사용자 정보
 */
export const getCurrentUser = () => {
  return apiClient.get('/auth/me')
}

