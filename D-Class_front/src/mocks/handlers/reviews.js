/**
 * 리뷰 관련 Mock API 핸들러
 */

import { http, HttpResponse } from 'msw'
import {
  reviews,
  findReviewsByAcademyId,
  findReviewsByInstructorId,
  findReviewsByAuthorId,
  findReviewById,
  calculateAcademyRating,
  calculateInstructorRating,
  createReview,
  updateReview,
  deleteReview,
} from '../data/reviews'
import env from '@/utils/env'

const API_URL = env.api.baseUrl

export const reviewHandlers = [
  // 학원 리뷰 목록 조회
  http.get(`${API_URL}/academies/:academyId/reviews`, ({ params, request }) => {
    const { academyId } = params
    const url = new URL(request.url)
    const sortBy = url.searchParams.get('sortBy') || 'latest'

    let academyReviews = findReviewsByAcademyId(academyId)

    // 정렬
    if (sortBy === 'latest') {
      academyReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'rating_high') {
      academyReviews.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'rating_low') {
      academyReviews.sort((a, b) => a.rating - b.rating)
    }

    const averageRating = calculateAcademyRating(academyId)

    return HttpResponse.json({
      success: true,
      data: {
        reviews: academyReviews,
        averageRating: parseFloat(averageRating),
        totalCount: academyReviews.length,
      },
    })
  }),

  // 강사 리뷰 목록 조회
  http.get(`${API_URL}/instructors/:instructorId/reviews`, ({ params, request }) => {
    const { instructorId } = params
    const url = new URL(request.url)
    const sortBy = url.searchParams.get('sortBy') || 'latest'

    let instructorReviews = findReviewsByInstructorId(instructorId)

    // 정렬
    if (sortBy === 'latest') {
      instructorReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'rating_high') {
      instructorReviews.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'rating_low') {
      instructorReviews.sort((a, b) => a.rating - b.rating)
    }

    const averageRating = calculateInstructorRating(instructorId)

    return HttpResponse.json({
      success: true,
      data: {
        reviews: instructorReviews,
        averageRating: parseFloat(averageRating),
        totalCount: instructorReviews.length,
      },
    })
  }),

  // 내가 작성한 리뷰 목록
  http.get(`${API_URL}/users/:userId/reviews`, ({ params }) => {
    const { userId } = params
    const myReviews = findReviewsByAuthorId(userId)

    myReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return HttpResponse.json({
      success: true,
      data: {
        reviews: myReviews,
      },
    })
  }),

  // 리뷰 작성
  http.post(`${API_URL}/reviews`, async ({ request }) => {
    const data = await request.json()

    // 필수 필드 검증
    if (!data.rating || !data.content || data.content.length < 10) {
      return HttpResponse.json(
        {
          success: false,
          message: '리뷰는 최소 10자 이상 작성해주세요.',
        },
        { status: 400 },
      )
    }

    const newReview = createReview(data)

    return HttpResponse.json(
      {
        success: true,
        message: '리뷰가 등록되었습니다.',
        data: {
          review: newReview,
        },
      },
      { status: 201 },
    )
  }),

  // 리뷰 수정
  http.put(`${API_URL}/reviews/:id`, async ({ params, request }) => {
    const { id } = params
    const data = await request.json()

    const review = findReviewById(id)

    if (!review) {
      return HttpResponse.json(
        {
          success: false,
          message: '리뷰를 찾을 수 없습니다.',
        },
        { status: 404 },
      )
    }

    const updatedReview = updateReview(id, data)

    return HttpResponse.json({
      success: true,
      message: '리뷰가 수정되었습니다.',
      data: {
        review: updatedReview,
      },
    })
  }),

  // 리뷰 삭제
  http.delete(`${API_URL}/reviews/:id`, ({ params }) => {
    const { id } = params
    const success = deleteReview(id)

    if (!success) {
      return HttpResponse.json(
        {
          success: false,
          message: '리뷰를 찾을 수 없습니다.',
        },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      success: true,
      message: '리뷰가 삭제되었습니다.',
    })
  }),

  // 리뷰 상세 조회
  http.get(`${API_URL}/reviews/:id`, ({ params }) => {
    const { id } = params
    const review = findReviewById(id)

    if (!review) {
      return HttpResponse.json(
        {
          success: false,
          message: '리뷰를 찾을 수 없습니다.',
        },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        review,
      },
    })
  }),
]

