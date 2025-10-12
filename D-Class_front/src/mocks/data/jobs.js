/**
 * Mock 공고 데이터
 */

import { mockAcademies } from './users'

export const mockJobs = [
  {
    id: 'job-1',
    title: '발레 전임강사 모집',
    description: '유아부터 성인까지 발레를 가르칠 전임강사를 모집합니다.\n\n[업무 내용]\n- 유아/아동/청소년/성인 발레 수업\n- 커리큘럼 개발 및 수업 진행\n- 공연 준비 및 지도\n\n[자격 요건]\n- 발레 전공자 또는 동등한 경력 보유자\n- 3년 이상 지도 경력\n- 학생 관리 능력 우수자\n\n[우대 사항]\n- 무용학 전공자\n- 공연 경력 보유자\n- 영유아 지도 경험자',
    academy: mockAcademies[0],
    region: '서울 강남구',
    genres: ['발레'],
    workDays: ['월', '화', '수', '목', '금'],
    workTimes: ['오후', '저녁'],
    workHours: '14:00 ~ 21:00',
    salary: 3000000,
    salaryType: 'monthly',
    preferredQualifications: ['무용학 전공', '3년 이상 경력', '공연 경력'],
    benefits: ['4대보험', '퇴직금', '연차', '식대 지원'],
    status: 'open',
    createdAt: '2024-10-01T10:00:00Z',
    updatedAt: '2024-10-01T10:00:00Z',
    closedAt: null,
    viewCount: 156,
    applicationCount: 8,
  },
  {
    id: 'job-2',
    title: '현대무용 시간강사 구합니다',
    description: '주 2회 현대무용 수업을 진행할 강사를 모집합니다.\n\n[수업 시간]\n- 매주 화, 목 19:00 ~ 21:00 (2시간)\n\n[수업 대상]\n- 중고등학생 및 성인\n\n[우대사항]\n- 현대무용 전공자\n- 안무 경험자',
    academy: mockAcademies[0],
    region: '서울 강남구',
    genres: ['현대무용'],
    workDays: ['화', '목'],
    workTimes: ['저녁'],
    workHours: '19:00 ~ 21:00',
    salary: 50000,
    salaryType: 'hourly',
    preferredQualifications: ['현대무용 전공', '안무 경험'],
    benefits: ['교통비 지원'],
    status: 'open',
    createdAt: '2024-10-05T14:00:00Z',
    updatedAt: '2024-10-05T14:00:00Z',
    closedAt: null,
    viewCount: 89,
    applicationCount: 5,
  },
  {
    id: 'job-3',
    title: '주말 재즈댄스 강사 모집',
    description: '주말 재즈댄스 수업을 진행할 강사를 찾습니다.\n\n[수업 일정]\n- 토요일 10:00 ~ 18:00\n- 일요일 10:00 ~ 18:00\n\n[수업 구성]\n- 초급/중급/고급 레벨별 수업\n- 각 수업 1시간 30분\n\n[자격 요건]\n- 재즈댄스 지도 경력 2년 이상\n- 밝고 긍정적인 성격\n- 학생들과의 소통 능력',
    academy: mockAcademies[1],
    region: '서울 서초구',
    genres: ['재즈댄스'],
    workDays: ['토', '일'],
    workTimes: ['오전', '오후'],
    workHours: '10:00 ~ 18:00',
    salary: 45000,
    salaryType: 'hourly',
    preferredQualifications: ['재즈댄스 경력 2년 이상', '밝은 성격'],
    benefits: ['식사 제공', '교통비 지원'],
    status: 'open',
    createdAt: '2024-09-28T09:00:00Z',
    updatedAt: '2024-09-28T09:00:00Z',
    closedAt: null,
    viewCount: 234,
    applicationCount: 12,
  },
  {
    id: 'job-4',
    title: '한국무용 전임강사 채용',
    description: '한국무용 전문 강사를 모집합니다.',
    academy: mockAcademies[0],
    region: '서울 강남구',
    genres: ['한국무용'],
    workDays: ['월', '수', '금'],
    workTimes: ['오후'],
    workHours: '15:00 ~ 19:00',
    salary: 2500000,
    salaryType: 'monthly',
    preferredQualifications: ['한국무용 전공', '지도 경력'],
    benefits: ['4대보험', '퇴직금'],
    status: 'closed',
    createdAt: '2024-09-15T10:00:00Z',
    updatedAt: '2024-09-25T10:00:00Z',
    closedAt: '2024-09-25T10:00:00Z',
    viewCount: 178,
    applicationCount: 15,
  },
]

// 공고 찾기 헬퍼 함수
export const findJobById = (id) => {
  return mockJobs.find((job) => job.id === id)
}

export const getJobsByAcademy = (academyId) => {
  return mockJobs.filter((job) => job.academy.id === academyId)
}

export const getOpenJobs = () => {
  return mockJobs.filter((job) => job.status === 'open')
}

