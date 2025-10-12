/**
 * 알림 관련 API
 */

import apiClient from '../axios'

/**
 * 알림 목록 조회
 * @returns {Promise} 알림 목록 및 읽지 않은 개수
 */
export const getNotifications = () => {
  return apiClient.get('/notifications')
}

/**
 * 알림 읽음 처리
 * @param {string} notificationId - 알림 ID
 * @returns {Promise}
 */
export const markAsRead = (notificationId) => {
  return apiClient.patch(`/notifications/${notificationId}/read`)
}

/**
 * 모든 알림 읽음 처리
 * @returns {Promise}
 */
export const markAllAsRead = () => {
  return apiClient.patch('/notifications/read-all')
}

/**
 * 알림 삭제
 * @param {string} notificationId - 알림 ID
 * @returns {Promise}
 */
export const deleteNotification = (notificationId) => {
  return apiClient.delete(`/notifications/${notificationId}`)
}

/**
 * 알림 설정 조회
 * @returns {Promise} 알림 설정 정보
 */
export const getNotificationSettings = () => {
  return apiClient.get('/notifications/settings')
}

/**
 * 알림 설정 저장
 * @param {Object} settings - 알림 설정
 * @param {boolean} settings.applicationResult - 지원 결과 알림
 * @param {boolean} settings.verificationResult - 인증 결과 알림
 * @param {boolean} settings.newJob - 새 공고 알림
 * @param {boolean} settings.events - 이벤트/혜택 알림
 * @returns {Promise}
 */
export const updateNotificationSettings = (settings) => {
  return apiClient.put('/notifications/settings', settings)
}

