/**
 * Mock 리뷰 데이터
 */

export const reviews = [
  {
    id: 'review-1',
    academyId: 'academy-1',
    instructorId: 'instructor-1',
    authorId: 'instructor-1',
    authorType: 'instructor', // instructor 또는 academy
    targetId: 'academy-1',
    targetType: 'academy',
    rating: 5,
    content:
      '매우 쾌적한 환경에서 근무할 수 있었습니다. 학원 운영진분들도 친절하시고, 학생들의 실력도 높아서 보람찬 수업이었습니다. 급여도 정확하게 지급되어 만족스러웠습니다.',
    createdAt: '2024-09-30T15:30:00Z',
    updatedAt: '2024-09-30T15:30:00Z',
  },
  {
    id: 'review-2',
    academyId: 'academy-1',
    instructorId: 'instructor-1',
    authorId: 'academy-1',
    authorType: 'academy',
    targetId: 'instructor-1',
    targetType: 'instructor',
    rating: 5,
    content:
      '매우 열정적이고 실력있는 강사님이십니다. 학생들과의 소통도 좋으시고, 체계적인 수업 진행으로 학부모님들의 만족도가 매우 높습니다. 다음에도 함께 일하고 싶습니다.',
    createdAt: '2024-09-30T16:00:00Z',
    updatedAt: '2024-09-30T16:00:00Z',
  },
  {
    id: 'review-3',
    academyId: 'academy-2',
    instructorId: 'instructor-3',
    authorId: 'instructor-3',
    authorType: 'instructor',
    targetId: 'academy-2',
    targetType: 'academy',
    rating: 4,
    content:
      '전반적으로 좋은 근무 환경입니다. 다만 주차 공간이 좀 부족해서 아쉬웠습니다. 그래도 학원 분위기가 좋고 학생들도 열심히 하는 편이라 만족스럽습니다.',
    createdAt: '2024-08-15T10:20:00Z',
    updatedAt: '2024-08-15T10:20:00Z',
  },
  {
    id: 'review-4',
    academyId: 'academy-3',
    instructorId: 'instructor-2',
    authorId: 'instructor-2',
    authorType: 'instructor',
    targetId: 'academy-3',
    targetType: 'academy',
    rating: 3,
    content:
      '젊은 분위기의 학원입니다. 시설은 조금 낡았지만 열정적인 학생들이 많아서 수업하기 좋습니다.',
    createdAt: '2024-07-20T14:00:00Z',
    updatedAt: '2024-07-20T14:00:00Z',
  },
]

// 학원의 리뷰 찾기
export const findReviewsByAcademyId = (academyId) => {
  return reviews.filter((review) => review.academyId === academyId && review.targetType === 'academy')
}

// 강사의 리뷰 찾기
export const findReviewsByInstructorId = (instructorId) => {
  return reviews.filter((review) => review.targetId === instructorId && review.targetType === 'instructor')
}

// 작성자로 리뷰 찾기
export const findReviewsByAuthorId = (authorId) => {
  return reviews.filter((review) => review.authorId === authorId)
}

// 리뷰 ID로 찾기
export const findReviewById = (id) => {
  return reviews.find((review) => review.id === id)
}

// 학원 평균 평점 계산
export const calculateAcademyRating = (academyId) => {
  const academyReviews = findReviewsByAcademyId(academyId)
  if (academyReviews.length === 0) return 0

  const sum = academyReviews.reduce((acc, review) => acc + review.rating, 0)
  return (sum / academyReviews.length).toFixed(1)
}

// 강사 평균 평점 계산
export const calculateInstructorRating = (instructorId) => {
  const instructorReviews = findReviewsByInstructorId(instructorId)
  if (instructorReviews.length === 0) return 0

  const sum = instructorReviews.reduce((acc, review) => acc + review.rating, 0)
  return (sum / instructorReviews.length).toFixed(1)
}

// 새 리뷰 생성
export const createReview = (data) => {
  const newReview = {
    id: `review-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  reviews.push(newReview)
  return newReview
}

// 리뷰 수정
export const updateReview = (reviewId, data) => {
  const review = reviews.find((r) => r.id === reviewId)
  if (review) {
    Object.assign(review, data, {
      updatedAt: new Date().toISOString(),
    })
  }
  return review
}

// 리뷰 삭제
export const deleteReview = (reviewId) => {
  const index = reviews.findIndex((r) => r.id === reviewId)
  if (index !== -1) {
    reviews.splice(index, 1)
    return true
  }
  return false
}

