/**
 * Mock 찜하기 데이터
 */

import { mockInstructors } from './users'
import { mockJobs } from './jobs'

export const mockFavorites = [
  {
    id: 'fav-1',
    instructorId: mockInstructors[0].id,
    jobId: mockJobs[1].id,
    createdAt: '2024-10-05T15:00:00Z',
  },
  {
    id: 'fav-2',
    instructorId: mockInstructors[0].id,
    jobId: mockJobs[2].id,
    createdAt: '2024-09-28T12:00:00Z',
  },
]

// 다음 찜하기 ID 생성
let nextFavoriteId = 3

export const generateFavoriteId = () => {
  return `fav-${nextFavoriteId++}`
}

// 찜하기 헬퍼 함수
export const isFavorite = (instructorId, jobId) => {
  return mockFavorites.some(
    (fav) => fav.instructorId === instructorId && fav.jobId === jobId,
  )
}

export const getFavoritesByInstructor = (instructorId) => {
  return mockFavorites.filter((fav) => fav.instructorId === instructorId)
}

export const addFavorite = (instructorId, jobId) => {
  const newFavorite = {
    id: generateFavoriteId(),
    instructorId,
    jobId,
    createdAt: new Date().toISOString(),
  }
  mockFavorites.push(newFavorite)
  return newFavorite
}

export const removeFavorite = (instructorId, jobId) => {
  const index = mockFavorites.findIndex(
    (fav) => fav.instructorId === instructorId && fav.jobId === jobId,
  )
  if (index > -1) {
    mockFavorites.splice(index, 1)
    return true
  }
  return false
}

