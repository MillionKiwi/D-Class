/**
 * MSW Reviews 핸들러
 */

import { http, HttpResponse } from 'msw'
import {
  mockReviews,
  generateReviewId,
  findReviewById,
  getReviewsByAcademy,
  getReviewsByInstructor,
  hasReviewed,
  calculateReviewStats,
} from '../data/reviews'
import { findUserById } from '../data/users'
import { findJobById } from '../data/jobs'
import { mockApplications } from '../data/applications'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// 토큰에서 사용자 ID 추출 (Mock용)
const getUserIdFromToken = (token) => {
  if (!token) return null
  const match = token.match(/mock-token-([^-]+)/)
  return match ? match[1] : null
}

export const reviewsHandlers = [
  // 리뷰 작성 (강사 → 학원)
  http.post(`${BASE_URL}/reviews`, async ({ request }) => {
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

    const reviewData = await request.json()

    // 필수 필드 검증
    if (!reviewData.academyId || !reviewData.jobId || !reviewData.rating || !reviewData.content) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '필수 입력 항목을 모두 입력해주세요.',
          },
        },
        { status: 400 },
      )
    }

    // 이미 리뷰를 작성했는지 확인
    if (hasReviewed(userId, reviewData.jobId)) {
      return HttpResponse.json(
        {
          error: {
            code: 'DUPLICATE',
            message: '이미 리뷰를 작성했습니다.',
          },
        },
        { status: 400 },
      )
    }

    // 채용 확정된 공고만 리뷰 작성 가능
    const application = mockApplications.find(
      (app) =>
        app.instructor.id === userId &&
        app.job.id === reviewData.jobId &&
        app.status === 'accepted',
    )

    if (!application) {
      return HttpResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: '채용 확정된 공고만 리뷰를 작성할 수 있습니다.',
          },
        },
        { status: 403 },
      )
    }

    // 리뷰 생성
    const instructor = findUserById(userId)
    const academy = findUserById(reviewData.academyId)
    const job = findJobById(reviewData.jobId)

    const newReview = {
      id: generateReviewId(),
      instructor: {
        id: instructor.id,
        name: instructor.name,
        profileImage: instructor.profileImage,
      },
      academy: {
        id: academy.id,
        name: academy.name,
        profileImage: academy.profileImage,
      },
      job: {
        id: job.id,
        title: job.title,
      },
      rating: reviewData.rating,
      content: reviewData.content,
      pros: reviewData.pros || [],
      cons: reviewData.cons || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockReviews.push(newReview)

    return HttpResponse.json(
      {
        message: '리뷰가 등록되었습니다.',
        data: newReview,
      },
      { status: 201 },
    )
  }),

  // 학원 리뷰 목록 조회
  http.get(`${BASE_URL}/academies/:academyId/reviews`, ({ params, request }) => {
    const { academyId } = params
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const sortBy = url.searchParams.get('sortBy') || 'latest'

    let reviews = getReviewsByAcademy(academyId)

    // 정렬
    if (sortBy === 'rating') {
      reviews.sort((a, b) => b.rating - a.rating)
    } else {
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    // 페이지네이션
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedReviews = reviews.slice(startIndex, endIndex)

    // 리뷰 통계 계산
    const summary = calculateReviewStats(academyId)

    return HttpResponse.json({
      data: paginatedReviews,
      summary,
      page,
      hasMore: endIndex < reviews.length,
    })
  }),

  // 내가 작성한 리뷰 목록 조회 (강사)
  http.get(`${BASE_URL}/reviews/me`, ({ request }) => {
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

    const reviews = getReviewsByInstructor(userId)

    return HttpResponse.json({
      data: reviews,
      total: reviews.length,
    })
  }),

  // 리뷰 상세 조회
  http.get(`${BASE_URL}/reviews/:id`, ({ params }) => {
    const { id } = params
    const review = findReviewById(id)

    if (!review) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '리뷰를 찾을 수 없습니다.',
          },
        },
        { status: 404 },
      )
    }

    return HttpResponse.json(review)
  }),

  // 리뷰 수정 (강사)
  http.put(`${BASE_URL}/reviews/:id`, async ({ request, params }) => {
    const { id } = params
    const reviewData = await request.json()

    const review = findReviewById(id)
    if (!review) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '리뷰를 찾을 수 없습니다.',
          },
        },
        { status: 404 },
      )
    }

    // 리뷰 업데이트
    Object.assign(review, {
      rating: reviewData.rating ?? review.rating,
      content: reviewData.content ?? review.content,
      pros: reviewData.pros ?? review.pros,
      cons: reviewData.cons ?? review.cons,
      updatedAt: new Date().toISOString(),
    })

    return HttpResponse.json({
      message: '리뷰가 수정되었습니다.',
      data: review,
    })
  }),

  // 리뷰 삭제 (강사)
  http.delete(`${BASE_URL}/reviews/:id`, ({ params }) => {
    const { id } = params
    const index = mockReviews.findIndex((review) => review.id === id)

    if (index === -1) {
      return HttpResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: '리뷰를 찾을 수 없습니다.',
          },
        },
        { status: 404 },
      )
    }

    mockReviews.splice(index, 1)

    return HttpResponse.json({
      message: '리뷰가 삭제되었습니다.',
    })
  }),
]

