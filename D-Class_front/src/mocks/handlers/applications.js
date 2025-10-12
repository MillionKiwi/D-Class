/**
 * 지원 관련 Mock API 핸들러
 */

import { http, HttpResponse } from 'msw'
import {
  applications,
  findApplicationById,
  findApplicationsByInstructorId,
  findApplicationsByJobId,
  findApplicationsByAcademyId,
  findApplicationsByStatus,
  createApplication,
  updateApplicationStatus,
} from '../data/applications'
import { findJobById } from '../data/jobs'
import { createNotification } from '../data/notifications'
import env from '@/utils/env'

const API_URL = env.api.baseUrl

export const applicationHandlers = [
  // 지원하기
  http.post(`${API_URL}/applications`, async ({ request }) => {
    const { jobId, instructorId } = await request.json()

    // 공고 확인
    const job = findJobById(jobId)
    if (!job) {
      return HttpResponse.json(
        {
          success: false,
          message: '공고를 찾을 수 없습니다.',
        },
        { status: 404 },
      )
    }

    // 중복 지원 확인
    const existingApp = applications.find(
      (app) => app.jobId === jobId && app.instructorId === instructorId,
    )

    if (existingApp) {
      return HttpResponse.json(
        {
          success: false,
          message: '이미 지원한 공고입니다.',
        },
        { status: 409 },
      )
    }

    // 지원 생성
    const newApplication = createApplication(jobId, instructorId)

    // 학원에게 알림 생성
    createNotification({
      userId: job.academyId,
      type: 'new_applicant',
      title: '새로운 지원자',
      message: `"${job.title}" 공고에 새로운 지원자가 있습니다.`,
      relatedId: newApplication.id,
      relatedType: 'application',
    })

    return HttpResponse.json(
      {
        success: true,
        message: '지원이 완료되었습니다.',
        data: {
          application: newApplication,
        },
      },
      { status: 201 },
    )
  }),

  // 내 지원 현황 조회 (강사)
  http.get(`${API_URL}/instructors/:instructorId/applications`, ({ params, request }) => {
    const { instructorId } = params
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    let instructorApps = findApplicationsByInstructorId(instructorId)

    if (status) {
      instructorApps = instructorApps.filter((app) => app.status === status)
    }

    // 최신순 정렬
    instructorApps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))

    return HttpResponse.json({
      success: true,
      data: {
        applications: instructorApps,
      },
    })
  }),

  // 공고별 지원자 목록 조회 (학원)
  http.get(`${API_URL}/jobs/:jobId/applications`, ({ params, request }) => {
    const { jobId } = params
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    let jobApps = findApplicationsByJobId(jobId)

    if (status) {
      jobApps = jobApps.filter((app) => app.status === status)
    }

    // 최신순 정렬
    jobApps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))

    return HttpResponse.json({
      success: true,
      data: {
        applications: jobApps,
      },
    })
  }),

  // 학원의 전체 지원자 조회
  http.get(`${API_URL}/academies/:academyId/applications`, ({ params, request }) => {
    const { academyId } = params
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const jobId = url.searchParams.get('jobId')

    let academyApps = findApplicationsByAcademyId(academyId)

    if (status) {
      academyApps = academyApps.filter((app) => app.status === status)
    }

    if (jobId) {
      academyApps = academyApps.filter((app) => app.jobId === jobId)
    }

    // 최신순 정렬
    academyApps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))

    return HttpResponse.json({
      success: true,
      data: {
        applications: academyApps,
      },
    })
  }),

  // 지원 상세 조회
  http.get(`${API_URL}/applications/:id`, ({ params }) => {
    const { id } = params
    const application = findApplicationById(id)

    if (!application) {
      return HttpResponse.json(
        {
          success: false,
          message: '지원 내역을 찾을 수 없습니다.',
        },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        application,
      },
    })
  }),

  // 지원 상태 변경 (학원: 채용 확정/불합격)
  http.patch(`${API_URL}/applications/:id/status`, async ({ params, request }) => {
    const { id } = params
    const { status } = await request.json()

    const application = findApplicationById(id)

    if (!application) {
      return HttpResponse.json(
        {
          success: false,
          message: '지원 내역을 찾을 수 없습니다.',
        },
        { status: 404 },
      )
    }

    // 상태 업데이트
    updateApplicationStatus(id, status)

    // 강사에게 알림
    let notiMessage = ''
    let notiType = ''

    if (status === 'accepted') {
      notiMessage = `"${application.job.title}" 공고에 최종 합격하셨습니다! 축하드립니다.`
      notiType = 'application_accepted'
    } else if (status === 'rejected') {
      notiMessage = `"${application.job.title}" 공고가 아쉽게도 불합격 되었습니다.`
      notiType = 'application_rejected'
    }

    if (notiMessage) {
      createNotification({
        userId: application.instructorId,
        type: notiType,
        title: '지원 결과 안내',
        message: notiMessage,
        relatedId: id,
        relatedType: 'application',
      })
    }

    return HttpResponse.json({
      success: true,
      message: '지원 상태가 변경되었습니다.',
      data: {
        application,
      },
    })
  }),

  // 지원 취소 (강사)
  http.delete(`${API_URL}/applications/:id`, ({ params }) => {
    const { id } = params
    const index = applications.findIndex((app) => app.id === id)

    if (index === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: '지원 내역을 찾을 수 없습니다.',
        },
        { status: 404 },
      )
    }

    applications.splice(index, 1)

    return HttpResponse.json({
      success: true,
      message: '지원이 취소되었습니다.',
    })
  }),
]

