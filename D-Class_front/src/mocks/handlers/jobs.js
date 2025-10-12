/**
 * MSW Jobs 핸들러
 */

import { http, HttpResponse } from 'msw'
import {
  mockJobs,
  findJobById,
  getJobsByAcademy,
  getOpenJobs,
} from '../data/jobs'
import {
  mockFavorites,
  isFavorite,
  addFavorite,
  removeFavorite,
  getFavoritesByInstructor,
} from '../data/favorites'
import { hasApplied, mockApplications } from '../data/applications'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// 토큰에서 사용자 ID 추출 (Mock용)
const getUserIdFromToken = (token) => {
  if (!token) return null
  const match = token.match(/mock-token-([^-]+)/)
  return match ? match[1] : null
}

export const jobsHandlers = [
  // 공고 목록 조회
  http.get(`${BASE_URL}/jobs`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const region = url.searchParams.get('region')
    const genres = url.searchParams.get('genres')?.split(',').filter(Boolean)
    const workTimes = url.searchParams.get('workTimes')?.split(',').filter(Boolean)
    const sortBy = url.searchParams.get('sortBy') || 'latest'

    // 현재 사용자 ID 가져오기
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const userId = getUserIdFromToken(token)

    let filteredJobs = getOpenJobs()

    // 지역 필터
    if (region) {
      filteredJobs = filteredJobs.filter((job) => job.region.includes(region))
    }

    // 장르 필터
    if (genres && genres.length > 0) {
      filteredJobs = filteredJobs.filter((job) =>
        genres.some((genre) => job.genres.includes(genre)),
      )
    }

    // 근무시간 필터
    if (workTimes && workTimes.length > 0) {
      filteredJobs = filteredJobs.filter((job) =>
        workTimes.some((time) => job.workTimes.includes(time)),
      )
    }

    // 정렬
    if (sortBy === 'salary') {
      filteredJobs.sort((a, b) => b.salary - a.salary)
    } else {
      filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    // 페이지네이션
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

    // 각 공고에 hasApplied, isFavorite 추가
    const jobsWithStatus = paginatedJobs.map((job) => ({
      ...job,
      hasApplied: userId ? hasApplied(userId, job.id) : false,
      isFavorite: userId ? isFavorite(userId, job.id) : false,
    }))

    return HttpResponse.json({
      data: jobsWithStatus,
      total: filteredJobs.length,
      page,
      hasMore: endIndex < filteredJobs.length,
    })
  }),

  // 공고 상세 조회
  http.get(`${BASE_URL}/jobs/:id`, ({ request, params }) => {
    const { id } = params
    const job = findJobById(id)

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

    // 현재 사용자 ID 가져오기
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const userId = getUserIdFromToken(token)

    // 조회수 증가 (실제로는 서버에서 처리)
    job.viewCount++

    return HttpResponse.json({
      ...job,
      hasApplied: userId ? hasApplied(userId, job.id) : false,
      isFavorite: userId ? isFavorite(userId, job.id) : false,
    })
  }),

  // 공고 등록 (학원)
  http.post(`${BASE_URL}/jobs`, async ({ request }) => {
    const jobData = await request.json()

    // 필수 필드 검증
    const requiredFields = ['title', 'description', 'region', 'genres', 'salary']
    for (const field of requiredFields) {
      if (!jobData[field]) {
        return HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: `${field}은(는) 필수 입력 항목입니다.`,
            },
          },
          { status: 400 },
        )
      }
    }

    // 새 공고 생성
    const newJob = {
      id: `job-${mockJobs.length + 1}`,
      ...jobData,
      status: 'pending', // 관리자 승인 대기
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      closedAt: null,
      viewCount: 0,
      applicationCount: 0,
    }

    mockJobs.push(newJob)

    return HttpResponse.json(
      {
        id: newJob.id,
        message: '공고가 등록되었습니다. 관리자 검토 후 게시됩니다.',
        status: 'pending',
      },
      { status: 201 },
    )
  }),

  // 공고 수정 (학원)
  http.put(`${BASE_URL}/jobs/:id`, async ({ request, params }) => {
    const { id } = params
    const jobData = await request.json()

    const job = findJobById(id)
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

    // 공고 업데이트
    Object.assign(job, jobData, {
      updatedAt: new Date().toISOString(),
    })

    return HttpResponse.json({
      id: job.id,
      message: '공고가 수정되었습니다.',
      data: job,
    })
  }),

  // 공고 삭제 (학원)
  http.delete(`${BASE_URL}/jobs/:id`, ({ params }) => {
    const { id } = params
    const index = mockJobs.findIndex((job) => job.id === id)

    if (index === -1) {
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

    mockJobs.splice(index, 1)

    return HttpResponse.json({
      message: '공고가 삭제되었습니다.',
    })
  }),

  // 공고 마감 (학원)
  http.patch(`${BASE_URL}/jobs/:id/close`, ({ params }) => {
    const { id } = params
    const job = findJobById(id)

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

    const closedAt = new Date().toISOString()
    job.status = 'closed'
    job.closedAt = closedAt
    job.updatedAt = closedAt

    return HttpResponse.json({
      message: '공고가 마감되었습니다.',
      closedAt,
    })
  }),

  // 찜하기 추가 (강사)
  http.post(`${BASE_URL}/jobs/:id/favorite`, ({ request, params }) => {
    const { id } = params
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

    const job = findJobById(id)
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

    if (isFavorite(userId, id)) {
      return HttpResponse.json(
        {
          error: {
            code: 'DUPLICATE',
            message: '이미 찜한 공고입니다.',
          },
        },
        { status: 409 },
      )
    }

    const favorite = addFavorite(userId, id)

    return HttpResponse.json({
      message: '찜 목록에 추가되었습니다.',
      favoriteId: favorite.id,
    })
  }),

  // 찜하기 제거 (강사)
  http.delete(`${BASE_URL}/jobs/:id/favorite`, ({ request, params }) => {
    const { id } = params
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

    const removed = removeFavorite(userId, id)
    if (!removed) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '찜한 공고가 아닙니다.',
          },
        },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      message: '찜 목록에서 제거되었습니다.',
    })
  }),

  // 찜한 공고 목록 조회 (강사)
  http.get(`${BASE_URL}/jobs/favorites`, ({ request }) => {
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

    const userFavorites = getFavoritesByInstructor(userId)
    const favoriteJobs = userFavorites
      .map((fav) => findJobById(fav.jobId))
      .filter(Boolean)
      .map((job) => ({
        ...job,
        isFavorite: true,
        hasApplied: hasApplied(userId, job.id),
      }))

    return HttpResponse.json({
      data: favoriteJobs,
      total: favoriteJobs.length,
    })
  }),
]

