/**
 * MSW Applications 핸들러
 */

import { http, HttpResponse } from 'msw'
import {
  mockApplications,
  generateApplicationId,
  findApplicationById,
  getApplicationsByInstructor,
  getApplicationsByJob,
  getApplicationsByAcademy,
  hasApplied,
  getHiredApplications,
} from '../data/applications'
import { findJobById } from '../data/jobs'
import { findUserById } from '../data/users'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// 토큰에서 사용자 ID 추출 (Mock용)
const getUserIdFromToken = (token) => {
  if (!token) return null
  const match = token.match(/mock-token-([^-]+)/)
  return match ? match[1] : null
}

export const applicationsHandlers = [
  // 공고 지원하기 (강사)
  http.post(`${BASE_URL}/jobs/:id/apply`, ({ request, params }) => {
    const { id: jobId } = params
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const userId = getUserIdFromToken(token)

    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다.',
          },
        },
        { status: 401 },
      )
    }

    const job = findJobById(jobId)
    if (!job) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '공고를 찾을 수 없습니다.',
          },
        },
        { status: 404 },
      )
    }

    // 이미 지원했는지 확인
    if (hasApplied(userId, jobId)) {
      return HttpResponse.json(
        {
          error: {
            code: 'DUPLICATE',
            message: '이미 지원한 공고입니다.',
          },
        },
        { status: 400 },
      )
    }

    // 지원 생성
    const instructor = findUserById(userId)
    const newApplication = {
      id: generateApplicationId(),
      instructor,
      job,
      status: 'applied',
      appliedAt: new Date().toISOString(),
      reviewedAt: null,
      message: null,
    }

    mockApplications.push(newApplication)

    // 공고의 지원자 수 증가
    job.applicationCount++

    return HttpResponse.json(
      {
        id: newApplication.id,
        message: '지원이 완료되었습니다.',
        application: {
          id: newApplication.id,
          jobId: job.id,
          status: newApplication.status,
          appliedAt: newApplication.appliedAt,
        },
      },
      { status: 201 },
    )
  }),

  // 내 지원 현황 조회 (강사)
  http.get(`${BASE_URL}/applications/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const userId = getUserIdFromToken(token)

    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다.',
          },
        },
        { status: 401 },
      )
    }

    const applications = getApplicationsByInstructor(userId)

    const data = applications.map((app) => ({
      id: app.id,
      job: {
        id: app.job.id,
        title: app.job.title,
        academy: {
          id: app.job.academy.id,
          name: app.job.academy.name,
          profileImage: app.job.academy.profileImage,
        },
        salary: app.job.salary,
        salaryType: app.job.salaryType,
      },
      status: app.status,
      appliedAt: app.appliedAt,
      updatedAt: app.reviewedAt || app.appliedAt,
    }))

    return HttpResponse.json({
      data,
      total: data.length,
    })
  }),

  // 지원 상세 조회
  http.get(`${BASE_URL}/applications/:id`, ({ params }) => {
    const { id } = params
    const application = findApplicationById(id)

    if (!application) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '지원 정보를 찾을 수 없습니다.',
          },
        },
        { status: 404 },
      )
    }

    return HttpResponse.json(application)
  }),

  // 지원자 목록 조회 (학원)
  http.get(`${BASE_URL}/applicants`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const userId = getUserIdFromToken(token)

    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다.',
          },
        },
        { status: 401 },
      )
    }

    const url = new URL(request.url)
    const jobId = url.searchParams.get('jobId')
    const status = url.searchParams.get('status')

    let applicants = getApplicationsByAcademy(userId)

    // 공고별 필터
    if (jobId) {
      applicants = applicants.filter((app) => app.job.id === jobId)
    }

    // 상태별 필터
    if (status) {
      applicants = applicants.filter((app) => app.status === status)
    }

    const data = applicants.map((app) => ({
      id: app.id,
      instructor: {
        id: app.instructor.id,
        name: app.instructor.name,
        profileImage: app.instructor.profileImage,
        isVerified: app.instructor.isVerified,
        genres: app.instructor.genres,
        experience: app.instructor.experience,
      },
      job: {
        id: app.job.id,
        title: app.job.title,
      },
      status: app.status,
      appliedAt: app.appliedAt,
    }))

    return HttpResponse.json({
      data,
      total: data.length,
    })
  }),

  // 지원자 상세 조회 (학원)
  http.get(`${BASE_URL}/applicants/:id`, ({ params }) => {
    const { id } = params
    const application = findApplicationById(id)

    if (!application) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '지원자 정보를 찾을 수 없습니다.',
          },
        },
        { status: 404 },
      )
    }

    return HttpResponse.json(application)
  }),

  // 채용 확정 (학원)
  http.patch(`${BASE_URL}/applicants/:id/accept`, ({ params }) => {
    const { id } = params
    const application = findApplicationById(id)

    if (!application) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '지원자 정보를 찾을 수 없습니다.',
          },
        },
        { status: 404 },
      )
    }

    const acceptedAt = new Date().toISOString()
    application.status = 'accepted'
    application.reviewedAt = acceptedAt

    return HttpResponse.json({
      message: '채용이 확정되었습니다.',
      status: 'accepted',
      acceptedAt,
    })
  }),

  // 불합격 처리 (학원)
  http.patch(`${BASE_URL}/applicants/:id/reject`, async ({ request, params }) => {
    const { id } = params
    const body = await request.json()
    const application = findApplicationById(id)

    if (!application) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '지원자 정보를 찾을 수 없습니다.',
          },
        },
        { status: 404 },
      )
    }

    const rejectedAt = new Date().toISOString()
    application.status = 'rejected'
    application.reviewedAt = rejectedAt
    if (body.message) {
      application.message = body.message
    }

    return HttpResponse.json({
      message: '불합격 처리되었습니다.',
      status: 'rejected',
      rejectedAt,
    })
  }),

  // 채용 확정 목록 조회 (학원)
  http.get(`${BASE_URL}/applicants/hired`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const userId = getUserIdFromToken(token)

    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다.',
          },
        },
        { status: 401 },
      )
    }

    const hiredList = getHiredApplications(userId)

    const data = hiredList.map((app) => ({
      id: app.id,
      instructor: {
        id: app.instructor.id,
        name: app.instructor.name,
        profileImage: app.instructor.profileImage,
        phone: app.instructor.phone,
        email: app.instructor.email,
      },
      job: {
        id: app.job.id,
        title: app.job.title,
      },
      acceptedAt: app.reviewedAt,
      startDate: null,
    }))

    return HttpResponse.json({
      data,
      total: data.length,
    })
  }),
]

