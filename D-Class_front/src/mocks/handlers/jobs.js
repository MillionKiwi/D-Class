/**
 * 공고 관련 Mock API 핸들러
 */

import { http, HttpResponse } from 'msw'
import {
  jobs,
  findJobById,
  findJobsByAcademyId,
  findJobsByStatus,
  getActiveJobs,
  filterJobs,
} from '../data/jobs'
import env from '@/utils/env'

const API_URL = env.api.baseUrl

export const jobHandlers = [
  // 공고 목록 조회 (필터링 포함)
  http.get(`${API_URL}/jobs`, ({ request }) => {
    const url = new URL(request.url)
    
    const region = url.searchParams.get('region')
    const district = url.searchParams.get('district')
    const genres = url.searchParams.get('genres')?.split(',').filter(Boolean)
    const sortBy = url.searchParams.get('sortBy') || 'latest'
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    // 필터링
    let filteredJobs = filterJobs({ region, district, genres, sortBy })

    // 페이지네이션
    const total = filteredJobs.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

    return HttpResponse.json({
      success: true,
      data: {
        jobs: paginatedJobs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  }),

  // 공고 상세 조회
  http.get(`${API_URL}/jobs/:id`, ({ params }) => {
    const { id } = params
    const job = findJobById(id)

    if (!job) {
      return HttpResponse.json(
        {
          success: false,
          message: '공고를 찾을 수 없습니다.',
        },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        job,
      },
    })
  }),

  // 학원의 공고 목록 조회
  http.get(`${API_URL}/academies/:academyId/jobs`, ({ params, request }) => {
    const { academyId } = params
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    let academyJobs = findJobsByAcademyId(academyId)

    if (status) {
      academyJobs = academyJobs.filter((job) => job.status === status)
    }

    return HttpResponse.json({
      success: true,
      data: {
        jobs: academyJobs,
      },
    })
  }),

  // 공고 등록 (학원)
  http.post(`${API_URL}/jobs`, async ({ request }) => {
    const data = await request.json()

    // 새 공고 생성
    const newJob = {
      id: `job-${Date.now()}`,
      ...data,
      applicantCount: 0,
      views: 0,
      status: 'pending', // 관리자 검토 대기
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    jobs.push(newJob)

    return HttpResponse.json(
      {
        success: true,
        message: '공고가 등록되었습니다. 관리자 검토 후 게시됩니다.',
        data: {
          job: newJob,
        },
      },
      { status: 201 },
    )
  }),

  // 공고 수정
  http.put(`${API_URL}/jobs/:id`, async ({ params, request }) => {
    const { id } = params
    const data = await request.json()

    const job = findJobById(id)

    if (!job) {
      return HttpResponse.json(
        {
          success: false,
          message: '공고를 찾을 수 없습니다.',
        },
        { status: 404 },
      )
    }

    // 공고 업데이트
    Object.assign(job, data, {
      updatedAt: new Date().toISOString(),
    })

    return HttpResponse.json({
      success: true,
      message: '공고가 수정되었습니다.',
      data: {
        job,
      },
    })
  }),

  // 공고 삭제
  http.delete(`${API_URL}/jobs/:id`, ({ params }) => {
    const { id } = params
    const index = jobs.findIndex((job) => job.id === id)

    if (index === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: '공고를 찾을 수 없습니다.',
        },
        { status: 404 },
      )
    }

    jobs.splice(index, 1)

    return HttpResponse.json({
      success: true,
      message: '공고가 삭제되었습니다.',
    })
  }),

  // 공고 마감
  http.post(`${API_URL}/jobs/:id/close`, ({ params }) => {
    const { id } = params
    const job = findJobById(id)

    if (!job) {
      return HttpResponse.json(
        {
          success: false,
          message: '공고를 찾을 수 없습니다.',
        },
        { status: 404 },
      )
    }

    job.status = 'closed'
    job.updatedAt = new Date().toISOString()

    return HttpResponse.json({
      success: true,
      message: '공고가 마감되었습니다.',
      data: {
        job,
      },
    })
  }),

  // 공고 검색
  http.get(`${API_URL}/jobs/search`, ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('q')

    if (!keyword) {
      return HttpResponse.json({
        success: true,
        data: {
          jobs: [],
        },
      })
    }

    // 제목 또는 설명에서 검색
    const searchResults = getActiveJobs().filter(
      (job) =>
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(keyword.toLowerCase()) ||
        job.academy.academyName.toLowerCase().includes(keyword.toLowerCase()),
    )

    return HttpResponse.json({
      success: true,
      data: {
        jobs: searchResults,
      },
    })
  }),
]

