/**
 * Mock 리뷰 데이터
 */

import { mockInstructors, mockAcademies } from './users'
import { mockJobs } from './jobs'

export const mockReviews = [
  {
    id: 'review-1',
    instructor: mockInstructors[0],
    academy: mockAcademies[0],
    job: mockJobs[0],
    rating: 5,
    content:
      '정말 좋은 근무 환경이었습니다. 학원장님과 다른 강사분들도 모두 친절하시고, 학생들을 가르치는 것에 대한 열정이 대단하십니다. 시설도 깨끗하고 잘 갖춰져 있어서 수업하기 편했습니다.',
    pros: ['좋은 근무 환경', '친절한 동료들', '깨끗한 시설'],
    cons: [],
    createdAt: '2024-09-28T10:00:00Z',
    updatedAt: '2024-09-28T10:00:00Z',
  },
  {
    id: 'review-2',
    instructor: mockInstructors[0],
    academy: mockAcademies[1],
    job: mockJobs[2],
    rating: 4,
    content:
      '전반적으로 만족스러운 근무 경험이었습니다. 학원 시스템이 잘 갖춰져 있고, 학생들도 열심히 배우려는 의지가 있어서 좋았습니다. 다만 주차가 조금 불편했습니다.',
    pros: ['체계적인 시스템', '열정적인 학생들'],
    cons: ['주차 불편'],
    createdAt: '2024-09-15T14:30:00Z',
    updatedAt: '2024-09-15T14:30:00Z',
  },
]

// 다음 리뷰 ID 생성
let nextReviewId = 3

export const generateReviewId = () => {
  return `review-${nextReviewId++}`
}

// 리뷰 찾기 헬퍼 함수
export const findReviewById = (id) => {
  return mockReviews.find((review) => review.id === id)
}

export const getReviewsByAcademy = (academyId) => {
  return mockReviews.filter((review) => review.academy.id === academyId)
}

export const getReviewsByInstructor = (instructorId) => {
  return mockReviews.filter((review) => review.instructor.id === instructorId)
}

export const hasReviewed = (instructorId, jobId) => {
  return mockReviews.some(
    (review) => review.instructor.id === instructorId && review.job.id === jobId,
  )
}

// 학원 리뷰 통계 계산
export const calculateReviewStats = (academyId) => {
  const reviews = getReviewsByAcademy(academyId)

  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalCount: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    }
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = (totalRating / reviews.length).toFixed(1)

  const ratingDistribution = reviews.reduce(
    (dist, review) => {
      dist[review.rating]++
      return dist
    },
    { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  )

  return {
    averageRating: parseFloat(averageRating),
    totalCount: reviews.length,
    ratingDistribution,
  }
}

