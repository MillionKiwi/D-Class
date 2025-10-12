/**
 * Mock API 핸들러 통합
 */

import { authHandlers } from './auth'
import { jobHandlers } from './jobs'
import { applicationHandlers } from './applications'
import { reviewHandlers } from './reviews'
import { notificationHandlers } from './notifications'

// 모든 핸들러 통합
export const handlers = [
  ...authHandlers,
  ...jobHandlers,
  ...applicationHandlers,
  ...reviewHandlers,
  ...notificationHandlers,
]

export default handlers

