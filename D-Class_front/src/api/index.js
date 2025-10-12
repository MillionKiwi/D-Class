/**
 * API 모듈 통합 Export
 */

export { default as apiClient } from './axios'

// 도메인별 API 모듈
export * as authAPI from './modules/auth'
export * as jobsAPI from './modules/jobs'
export * as applicationsAPI from './modules/applications'
export * as profileAPI from './modules/profile'
export * as verificationAPI from './modules/verification'
export * as notificationsAPI from './modules/notifications'
export * as reviewsAPI from './modules/reviews'
export * as adminAPI from './modules/admin'

