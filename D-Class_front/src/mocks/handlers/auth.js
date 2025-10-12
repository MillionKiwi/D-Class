/**
 * MSW Auth 핸들러
 */

import { http, HttpResponse } from 'msw'
import { findUserByEmail, findUserById } from '../data/users'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Mock 토큰 생성
const generateToken = (user) => {
  return `mock-token-${user.id}-${Date.now()}`
}

const generateRefreshToken = (user) => {
  return `mock-refresh-token-${user.id}-${Date.now()}`
}

// 토큰에서 사용자 ID 추출 (Mock용)
const getUserIdFromToken = (token) => {
  if (!token) return null
  const match = token.match(/mock-token-([^-]+)/)
  return match ? match[1] : null
}

export const authHandlers = [
  // 로그인
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const { email, password } = await request.json()

    // 기본 검증
    if (!email || !password) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '이메일과 비밀번호를 입력해주세요.',
          },
        },
        { status: 400 },
      )
    }

    // 사용자 찾기
    const user = findUserByEmail(email)

    // Mock에서는 비밀번호를 'test1234'로 통일
    if (!user || password !== 'test1234') {
      return HttpResponse.json(
        {
          error: {
            code: 'AUTH_ERROR',
            message: '이메일 또는 비밀번호가 일치하지 않습니다.',
          },
        },
        { status: 401 },
      )
    }

    // 토큰 생성
    const accessToken = generateToken(user)
    const refreshToken = generateRefreshToken(user)

    return HttpResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    })
  }),

  // 회원가입
  http.post(`${BASE_URL}/auth/signup`, async ({ request }) => {
    const signupData = await request.json()

    // 필수 필드 검증
    const requiredFields = ['email', 'password', 'name', 'role', 'phone']
    for (const field of requiredFields) {
      if (!signupData[field]) {
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

    // 이메일 중복 검사
    const existingUser = findUserByEmail(signupData.email)
    if (existingUser) {
      return HttpResponse.json(
        {
          error: {
            code: 'DUPLICATE_EMAIL',
            message: '이미 사용 중인 이메일입니다.',
          },
        },
        { status: 409 },
      )
    }

    // 회원가입 성공 (실제로는 DB에 저장)
    return HttpResponse.json(
      {
        message: '회원가입이 완료되었습니다.',
        userId: `new-user-${Date.now()}`,
      },
      { status: 201 },
    )
  }),

  // 로그아웃
  http.post(`${BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({
      message: '로그아웃되었습니다.',
    })
  }),

  // 토큰 갱신
  http.post(`${BASE_URL}/auth/refresh`, async ({ request }) => {
    const { refreshToken } = await request.json()

    if (!refreshToken || !refreshToken.startsWith('mock-refresh-token-')) {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_TOKEN',
            message: '유효하지 않은 리프레시 토큰입니다.',
          },
        },
        { status: 401 },
      )
    }

    // 토큰에서 사용자 ID 추출
    const match = refreshToken.match(/mock-refresh-token-([^-]+)/)
    const userId = match ? match[1] : null

    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_TOKEN',
            message: '유효하지 않은 토큰입니다.',
          },
        },
        { status: 401 },
      )
    }

    const user = findUserById(userId)
    if (!user) {
      return HttpResponse.json(
        {
          error: {
            code: 'USER_NOT_FOUND',
            message: '사용자를 찾을 수 없습니다.',
          },
        },
        { status: 401 },
      )
    }

    // 새로운 액세스 토큰 생성
    const accessToken = generateToken(user)

    return HttpResponse.json({
      accessToken,
    })
  }),

  // 현재 사용자 정보 조회
  http.get(`${BASE_URL}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
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

    const userId = getUserIdFromToken(token)
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_TOKEN',
            message: '유효하지 않은 토큰입니다.',
          },
        },
        { status: 401 },
      )
    }

    const user = findUserById(userId)
    if (!user) {
      return HttpResponse.json(
        {
          error: {
            code: 'USER_NOT_FOUND',
            message: '사용자를 찾을 수 없습니다.',
          },
        },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  }),
]

