/**
 * MSW 핸들러 통합
 */

import { authHandlers } from './auth'
import { jobsHandlers } from './jobs'
import { applicationsHandlers } from './applications'
import { reviewsHandlers } from './reviews'

export const handlers = [
  ...authHandlers,
  ...jobsHandlers,
  ...applicationsHandlers,
  ...reviewsHandlers,
]

