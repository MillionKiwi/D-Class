/**
 * Mock 사용자 데이터
 */

// 강사 회원
export const mockInstructors = [
  {
    id: 'instructor-1',
    email: 'instructor1@test.com',
    name: '김민지',
    role: 'instructor',
    phone: '010-1234-5678',
    profileImage: null,
    isVerified: true,
    bio: '10년 경력의 발레 전문 강사입니다.',
    genres: ['발레', '현대무용'],
    experience: 10,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z',
    educations: [
      {
        id: 'edu-1',
        school: '서울예술대학교',
        major: '무용학과',
        degree: 'bachelor',
        startDate: '2010-03',
        endDate: '2014-02',
        isCurrent: false,
      },
    ],
    careers: [
      {
        id: 'career-1',
        organization: '서울발레단',
        position: '무용수',
        description: '주요 공연 참여 및 강사 활동',
        startDate: '2014-03',
        endDate: '2020-12',
        isCurrent: false,
      },
      {
        id: 'career-2',
        organization: '강남발레학원',
        position: '전임강사',
        description: '유아~성인 발레 지도',
        startDate: '2021-01',
        endDate: null,
        isCurrent: true,
      },
    ],
  },
  {
    id: 'instructor-2',
    email: 'instructor2@test.com',
    name: '이서준',
    role: 'instructor',
    phone: '010-2345-6789',
    profileImage: null,
    isVerified: false,
    bio: '한국무용과 현대무용을 가르칩니다.',
    genres: ['한국무용', '현대무용'],
    experience: 5,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z',
    educations: [],
    careers: [],
  },
]

// 학원 회원
export const mockAcademies = [
  {
    id: 'academy-1',
    email: 'academy1@test.com',
    name: '강남무용학원',
    role: 'academy',
    phone: '02-1234-5678',
    profileImage: null,
    isVerified: true,
    businessNumber: '123-45-67890',
    address: '서울특별시 강남구 테헤란로 123',
    detailAddress: '3층',
    location: {
      lat: 37.5012,
      lng: 127.0396,
    },
    description: '30년 전통의 무용 전문 학원입니다. 발레, 현대무용 등 다양한 장르를 가르칩니다.',
    genres: ['발레', '현대무용', '한국무용'],
    facilities: ['연습실 5개', '샤워실', '주차장', '대기실'],
    rating: 4.5,
    reviewCount: 12,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z',
  },
  {
    id: 'academy-2',
    email: 'academy2@test.com',
    name: '서초예술학원',
    role: 'academy',
    phone: '02-2345-6789',
    profileImage: null,
    isVerified: true,
    businessNumber: '234-56-78901',
    address: '서울특별시 서초구 서초대로 456',
    detailAddress: '2층',
    location: {
      lat: 37.4833,
      lng: 127.0324,
    },
    description: '예술 전문 교육기관으로 무용, 음악 등을 가르칩니다.',
    genres: ['발레', '재즈댄스'],
    facilities: ['연습실 3개', '샤워실', '주차장'],
    rating: 4.2,
    reviewCount: 8,
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z',
  },
]

// 관리자
export const mockAdmin = {
  id: 'admin-1',
  email: 'admin@dclass.com',
  name: '관리자',
  role: 'admin',
  phone: '02-0000-0000',
  profileImage: null,
  isVerified: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2024-10-01T00:00:00Z',
}

// 모든 사용자
export const mockUsers = [...mockInstructors, ...mockAcademies, mockAdmin]

// 사용자 찾기 헬퍼 함수
export const findUserByEmail = (email) => {
  return mockUsers.find((user) => user.email === email)
}

export const findUserById = (id) => {
  return mockUsers.find((user) => user.id === id)
}

