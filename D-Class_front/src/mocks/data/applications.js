/**
 * Mock 지원 데이터
 */

import { mockInstructors } from './users'
import { mockJobs } from './jobs'

export const mockApplications = [
  {
    id: 'app-1',
    instructor: mockInstructors[0],
    job: mockJobs[0],
    status: 'applied',
    appliedAt: '2024-10-02T10:30:00Z',
    reviewedAt: null,
    message: null,
  },
  {
    id: 'app-2',
    instructor: mockInstructors[0],
    job: mockJobs[1],
    status: 'reviewing',
    appliedAt: '2024-10-06T15:20:00Z',
    reviewedAt: '2024-10-07T09:00:00Z',
    message: null,
  },
  {
    id: 'app-3',
    instructor: mockInstructors[1],
    job: mockJobs[0],
    status: 'applied',
    appliedAt: '2024-10-03T14:00:00Z',
    reviewedAt: null,
    message: null,
  },
  {
    id: 'app-4',
    instructor: mockInstructors[0],
    job: mockJobs[2],
    status: 'accepted',
    appliedAt: '2024-09-29T11:00:00Z',
    reviewedAt: '2024-09-30T16:00:00Z',
    message: '채용이 확정되었습니다. 곧 연락드리겠습니다.',
  },
]

// 다음 지원 ID 생성
let nextApplicationId = 5

export const generateApplicationId = () => {
  return `app-${nextApplicationId++}`
}

// 지원 찾기 헬퍼 함수
export const findApplicationById = (id) => {
  return mockApplications.find((app) => app.id === id)
}

export const getApplicationsByInstructor = (instructorId) => {
  return mockApplications.filter((app) => app.instructor.id === instructorId)
}

export const getApplicationsByJob = (jobId) => {
  return mockApplications.filter((app) => app.job.id === jobId)
}

export const getApplicationsByAcademy = (academyId) => {
  return mockApplications.filter((app) => app.job.academy.id === academyId)
}

export const hasApplied = (instructorId, jobId) => {
  return mockApplications.some(
    (app) => app.instructor.id === instructorId && app.job.id === jobId,
  )
}

// 채용 확정 목록 조회
export const getHiredApplications = (academyId) => {
  return mockApplications.filter(
    (app) => app.job.academy.id === academyId && app.status === 'accepted',
  )
}

