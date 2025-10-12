/**
 * Mock 사용자 데이터
 * 강사, 학원, 관리자 계정
 */

import { USER_ROLES, VERIFICATION_STATUS } from '@/utils/constants'

// 강사 회원 Mock 데이터
export const instructors = [
  {
    id: 'instructor-1',
    email: 'instructor1@test.com',
    password: 'password123',
    role: USER_ROLES.INSTRUCTOR,
    name: '김민지',
    phone: '010-1234-5678',
    profileImage: null,
    specialties: ['ballet', 'contemporary'],
    bio: '10년 경력의 발레 및 컨템포러리 댄스 강사입니다. 국립발레단 출신으로 다양한 연령대의 학생들을 지도해왔습니다.',
    careers: [
      {
        id: 1,
        organization: '국립발레단',
        position: '단원',
        startDate: '2010-03',
        endDate: '2015-12',
        description: '주요 공연 참여 및 솔로 무대 경험',
      },
      {
        id: 2,
        organization: '서울예술학교',
        position: '발레 강사',
        startDate: '2016-01',
        endDate: '2020-12',
        description: '초급~고급 발레 수업 진행',
      },
    ],
    education: [
      {
        id: 1,
        school: '한국예술종합학교',
        major: '무용원 발레전공',
        degree: '학사',
        startDate: '2006-03',
        endDate: '2010-02',
      },
    ],
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'instructor-2',
    email: 'instructor2@test.com',
    password: 'password123',
    role: USER_ROLES.INSTRUCTOR,
    name: '이지훈',
    phone: '010-2345-6789',
    profileImage: null,
    specialties: ['hiphop', 'jazz'],
    bio: '힙합과 재즈댄스를 전문으로 하는 7년 경력의 강사입니다. 젊은 감각으로 재미있는 수업을 진행합니다.',
    careers: [
      {
        id: 1,
        organization: 'DanceHub 스튜디오',
        position: '힙합 강사',
        startDate: '2017-03',
        endDate: '2023-12',
        description: '힙합, 어반댄스 클래스 진행',
      },
    ],
    education: [
      {
        id: 1,
        school: '서울예술대학교',
        major: '실용무용과',
        degree: '전문학사',
        startDate: '2015-03',
        endDate: '2017-02',
      },
    ],
    verificationStatus: VERIFICATION_STATUS.PENDING,
    createdAt: '2024-02-20T10:30:00Z',
  },
  {
    id: 'instructor-3',
    email: 'instructor3@test.com',
    password: 'password123',
    role: USER_ROLES.INSTRUCTOR,
    name: '박서연',
    phone: '010-3456-7890',
    profileImage: null,
    specialties: ['korean', 'traditional'],
    bio: '한국무용과 전통무용 전문 강사입니다. 우리 춤의 아름다움을 전하고 있습니다.',
    careers: [],
    education: [],
    verificationStatus: VERIFICATION_STATUS.UNVERIFIED,
    createdAt: '2024-03-10T14:20:00Z',
  },
]

// 학원 회원 Mock 데이터
export const academies = [
  {
    id: 'academy-1',
    email: 'academy1@test.com',
    password: 'password123',
    role: USER_ROLES.ACADEMY,
    academyName: '강남발레아카데미',
    businessName: '(주)강남발레아카데미',
    address: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    representativeImage: null,
    description: '강남 최고의 발레 전문 학원입니다. 30년 전통을 자랑하며, 체계적인 커리큘럼으로 학생들의 성장을 돕고 있습니다.',
    operatingHours: '평일 09:00-22:00, 주말 10:00-18:00',
    mainGenres: ['ballet', 'contemporary'],
    facilities: ['parking', 'shower', 'locker', 'waitingRoom'],
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    rating: 4.8,
    reviewCount: 24,
    createdAt: '2023-06-01T08:00:00Z',
  },
  {
    id: 'academy-2',
    email: 'academy2@test.com',
    password: 'password123',
    role: USER_ROLES.ACADEMY,
    academyName: '서울현대무용학원',
    businessName: '서울현대무용교습소',
    address: '서울특별시 마포구 월드컵로 456',
    phone: '02-2345-6789',
    representativeImage: null,
    description: '현대무용과 컨템포러리 댄스를 전문으로 하는 학원입니다.',
    operatingHours: '평일 10:00-21:00',
    mainGenres: ['modern', 'contemporary'],
    facilities: ['parking', 'locker'],
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
    rating: 4.5,
    reviewCount: 15,
    createdAt: '2023-09-15T09:00:00Z',
  },
  {
    id: 'academy-3',
    email: 'academy3@test.com',
    password: 'password123',
    role: USER_ROLES.ACADEMY,
    academyName: '힙합댄스스쿨',
    businessName: '힙합댄스교습소',
    address: '서울특별시 홍대입구역 3번 출구',
    phone: '02-3456-7890',
    representativeImage: null,
    description: '힙합, 비보잉, 어반댄스 전문 학원',
    operatingHours: '매일 12:00-23:00',
    mainGenres: ['hiphop', 'jazz'],
    facilities: ['locker', 'waitingRoom'],
    verificationStatus: VERIFICATION_STATUS.PENDING,
    rating: 4.2,
    reviewCount: 8,
    createdAt: '2024-01-20T11:00:00Z',
  },
]

// 관리자 계정
export const admins = [
  {
    id: 'admin-1',
    email: 'admin@d-class.com',
    password: 'admin123!@#',
    role: USER_ROLES.ADMIN,
    name: '관리자',
    createdAt: '2023-01-01T00:00:00Z',
  },
]

// 모든 사용자 통합
export const allUsers = [...instructors, ...academies, ...admins]

// 이메일로 사용자 찾기
export const findUserByEmail = (email) => {
  return allUsers.find((user) => user.email === email)
}

// ID로 사용자 찾기
export const findUserById = (id) => {
  return allUsers.find((user) => user.id === id)
}

// 역할별 사용자 찾기
export const findUsersByRole = (role) => {
  return allUsers.filter((user) => user.role === role)
}

