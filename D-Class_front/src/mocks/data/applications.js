/**
 * Mock 지원 데이터
 */

import { APPLICATION_STATUS } from '@/utils/constants'
import { instructors } from './users'
import { jobs } from './jobs'

export const applications = [
  {
    id: 'app-1',
    jobId: 'job-1',
    job: jobs[0],
    instructorId: 'instructor-1',
    instructor: instructors[0],
    status: APPLICATION_STATUS.REVIEWING,
    appliedAt: '2024-10-03T10:30:00Z',
    updatedAt: '2024-10-03T10:30:00Z',
  },
  {
    id: 'app-2',
    jobId: 'job-2',
    job: jobs[1],
    instructorId: 'instructor-1',
    instructor: instructors[0],
    status: APPLICATION_STATUS.ACCEPTED,
    appliedAt: '2024-09-26T14:20:00Z',
    updatedAt: '2024-09-28T09:15:00Z',
    acceptedAt: '2024-09-28T09:15:00Z',
  },
  {
    id: 'app-3',
    jobId: 'job-3',
    job: jobs[2],
    instructorId: 'instructor-1',
    instructor: instructors[0],
    status: APPLICATION_STATUS.REJECTED,
    appliedAt: '2024-09-21T16:45:00Z',
    updatedAt: '2024-09-23T11:00:00Z',
    rejectedAt: '2024-09-23T11:00:00Z',
  },
  {
    id: 'app-4',
    jobId: 'job-1',
    job: jobs[0],
    instructorId: 'instructor-2',
    instructor: instructors[1],
    status: APPLICATION_STATUS.APPLIED,
    appliedAt: '2024-10-02T09:15:00Z',
    updatedAt: '2024-10-02T09:15:00Z',
  },
  {
    id: 'app-5',
    jobId: 'job-4',
    job: jobs[3],
    instructorId: 'instructor-2',
    instructor: instructors[1],
    status: APPLICATION_STATUS.REVIEWING,
    appliedAt: '2024-10-06T11:30:00Z',
    updatedAt: '2024-10-06T11:30:00Z',
  },
]

// 지원 ID로 찾기
export const findApplicationById = (id) => {
  return applications.find((app) => app.id === id)
}

// 강사 ID로 지원 목록 찾기
export const findApplicationsByInstructorId = (instructorId) => {
  return applications.filter((app) => app.instructorId === instructorId)
}

// 공고 ID로 지원자 목록 찾기
export const findApplicationsByJobId = (jobId) => {
  return applications.filter((app) => app.jobId === jobId)
}

// 학원의 모든 지원자 찾기
export const findApplicationsByAcademyId = (academyId) => {
  return applications.filter((app) => app.job.academyId === academyId)
}

// 상태별 지원 찾기
export const findApplicationsByStatus = (instructorId, status) => {
  return applications.filter(
    (app) => app.instructorId === instructorId && app.status === status,
  )
}

// 새 지원 생성
export const createApplication = (jobId, instructorId) => {
  const job = jobs.find((j) => j.id === jobId)
  const instructor = instructors.find((i) => i.id === instructorId)

  const newApp = {
    id: `app-${Date.now()}`,
    jobId,
    job,
    instructorId,
    instructor,
    status: APPLICATION_STATUS.APPLIED,
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  applications.push(newApp)
  return newApp
}

// 지원 상태 업데이트
export const updateApplicationStatus = (applicationId, status) => {
  const app = applications.find((a) => a.id === applicationId)
  if (app) {
    app.status = status
    app.updatedAt = new Date().toISOString()

    if (status === APPLICATION_STATUS.ACCEPTED) {
      app.acceptedAt = new Date().toISOString()
    } else if (status === APPLICATION_STATUS.REJECTED) {
      app.rejectedAt = new Date().toISOString()
    }
  }
  return app
}

