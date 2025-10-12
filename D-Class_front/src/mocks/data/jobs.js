/**
 * Mock 공고 데이터
 */

import { JOB_STATUS } from '@/utils/constants'
import { academies } from './users'

export const jobs = [
  {
    id: 'job-1',
    academyId: 'academy-1',
    academy: academies[0],
    title: '주말 발레 강사 모집',
    region: 'seoul',
    district: '강남구',
    genres: ['ballet'],
    targetClass: '초등반, 중등반',
    workDays: ['sat', 'sun'],
    workTime: '10:00-18:00',
    salaryType: 'hourly',
    salary: 50000,
    preferredQualifications: '발레 전공자 우대, 아동 지도 경험자 우대',
    description: `강남발레아카데미에서 주말 발레 강사를 모집합니다.
    
    [모집 내용]
    - 대상: 초등반, 중등반
    - 근무: 토/일 10:00-18:00
    - 급여: 시급 50,000원
    
    [우대 사항]
    - 발레 전공자
    - 아동 지도 경험자
    - 인증서 소지자
    
    [근무 환경]
    - 쾌적한 연습실
    - 주차 가능
    - 샤워실 완비`,
    status: JOB_STATUS.ACTIVE,
    applicantCount: 5,
    views: 127,
    createdAt: '2024-10-01T09:00:00Z',
    updatedAt: '2024-10-01T09:00:00Z',
  },
  {
    id: 'job-2',
    academyId: 'academy-1',
    academy: academies[0],
    title: '평일 오후 컨템포러리 댄스 강사',
    region: 'seoul',
    district: '강남구',
    genres: ['contemporary'],
    targetClass: '성인취미반',
    workDays: ['mon', 'wed', 'fri'],
    workTime: '14:00-17:00',
    salaryType: 'monthly',
    salary: 2500000,
    preferredQualifications: '컨템포러리 댄스 경력 3년 이상',
    description: `성인 취미반 컨템포러리 댄스 수업을 담당하실 강사님을 찾습니다.
    
    [모집 내용]
    - 대상: 성인 취미반
    - 근무: 월/수/금 14:00-17:00
    - 급여: 월급 250만원
    
    [자격 요건]
    - 컨템포러리 댄스 경력 3년 이상
    - 성인 수업 경험자
    
    [복리후생]
    - 4대 보험 가입
    - 연차 제공
    - 교육비 지원`,
    status: JOB_STATUS.ACTIVE,
    applicantCount: 3,
    views: 89,
    createdAt: '2024-09-25T10:00:00Z',
    updatedAt: '2024-09-25T10:00:00Z',
  },
  {
    id: 'job-3',
    academyId: 'academy-2',
    academy: academies[1],
    title: '현대무용 강사 채용',
    region: 'seoul',
    district: '마포구',
    genres: ['modern'],
    targetClass: '전 연령',
    workDays: ['tue', 'thu'],
    workTime: '18:00-21:00',
    salaryType: 'hourly',
    salary: 45000,
    preferredQualifications: '현대무용 전공자',
    description: `서울현대무용학원에서 현대무용 강사를 모집합니다.`,
    status: JOB_STATUS.ACTIVE,
    applicantCount: 2,
    views: 56,
    createdAt: '2024-09-20T11:00:00Z',
    updatedAt: '2024-09-20T11:00:00Z',
  },
  {
    id: 'job-4',
    academyId: 'academy-3',
    academy: academies[2],
    title: '힙합댄스 강사 급구',
    region: 'seoul',
    district: '마포구',
    genres: ['hiphop'],
    targetClass: '청소년반',
    workDays: ['mon', 'wed', 'fri'],
    workTime: '19:00-22:00',
    salaryType: 'hourly',
    salary: 40000,
    preferredQualifications: '힙합댄스 경력자',
    description: `힙합댄스스쿨에서 청소년반 힙합 강사를 급하게 모집합니다.`,
    status: JOB_STATUS.ACTIVE,
    applicantCount: 7,
    views: 143,
    createdAt: '2024-10-05T14:00:00Z',
    updatedAt: '2024-10-05T14:00:00Z',
  },
  {
    id: 'job-5',
    academyId: 'academy-2',
    academy: academies[1],
    title: '방학 단기 발레 강사',
    region: 'seoul',
    district: '마포구',
    genres: ['ballet'],
    targetClass: '유아반',
    workDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    workTime: '10:00-13:00',
    salaryType: 'hourly',
    salary: 35000,
    preferredQualifications: '유아 지도 경험',
    description: `겨울방학 단기 유아 발레 강사를 모집합니다.`,
    status: JOB_STATUS.CLOSED,
    applicantCount: 12,
    views: 201,
    createdAt: '2024-08-15T09:00:00Z',
    updatedAt: '2024-09-01T09:00:00Z',
  },
  {
    id: 'job-6',
    academyId: 'academy-1',
    academy: academies[0],
    title: '[검토중] 재즈댄스 강사 모집',
    region: 'seoul',
    district: '강남구',
    genres: ['jazz'],
    targetClass: '성인반',
    workDays: ['tue', 'thu'],
    workTime: '19:00-21:00',
    salaryType: 'hourly',
    salary: 45000,
    preferredQualifications: '',
    description: `재즈댄스 강사를 모집합니다. (관리자 검토 중)`,
    status: JOB_STATUS.PENDING,
    applicantCount: 0,
    views: 5,
    createdAt: '2024-10-10T16:00:00Z',
    updatedAt: '2024-10-10T16:00:00Z',
  },
]

// 공고 ID로 찾기
export const findJobById = (id) => {
  return jobs.find((job) => job.id === id)
}

// 학원 ID로 공고 찾기
export const findJobsByAcademyId = (academyId) => {
  return jobs.filter((job) => job.academyId === academyId)
}

// 상태별 공고 찾기
export const findJobsByStatus = (status) => {
  return jobs.filter((job) => job.status === status)
}

// 활성 공고만 가져오기
export const getActiveJobs = () => {
  return jobs.filter((job) => job.status === JOB_STATUS.ACTIVE)
}

// 공고 필터링
export const filterJobs = ({ region, district, genres, workTimes, sortBy = 'latest' }) => {
  let filtered = getActiveJobs()

  if (region) {
    filtered = filtered.filter((job) => job.region === region)
  }

  if (district) {
    filtered = filtered.filter((job) => job.district === district)
  }

  if (genres && genres.length > 0) {
    filtered = filtered.filter((job) => job.genres.some((g) => genres.includes(g)))
  }

  // 정렬
  if (sortBy === 'latest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (sortBy === 'salary') {
    filtered.sort((a, b) => b.salary - a.salary)
  }

  return filtered
}

