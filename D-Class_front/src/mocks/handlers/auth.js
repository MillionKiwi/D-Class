/**
 * 인증 관련 Mock API 핸들러
 */

import { http, HttpResponse } from 'msw'
import { findUserByEmail } from '../data/users'
import env from '@/utils/env'

const API_URL = env.api.baseUrl

// JWT 토큰 생성 (Mock)
const generateToken = (user) => {
  return `mock-jwt-token-${user.id}-${Date.now()}`
}

export const authHandlers = [
  // 로그인
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { email, password } = await request.json()

    // 사용자 찾기
    const user = findUserByEmail(email)

    // 인증 실패
    if (!user || user.password !== password) {
      return HttpResponse.json(
        {
          success: false,
          message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        },
        { status: 401 },
      )
    }

    // 성공 - 토큰 생성
    const token = generateToken(user)
    const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`

    // 비밀번호 제외하고 응답
    const { password: _, ...userWithoutPassword } = user

    return HttpResponse.json({
      success: true,
      message: '로그인에 성공했습니다.',
      data: {
        user: userWithoutPassword,
        accessToken: token,
        refreshToken: refreshToken,
      },
    })
  }),

  // 회원가입
  http.post(`${API_URL}/auth/signup`, async ({ request }) => {
    const data = await request.json()

    // 이메일 중복 체크
    const existingUser = findUserByEmail(data.email)
    if (existingUser) {
      return HttpResponse.json(
        {
          success: false,
          message: '이미 사용 중인 이메일입니다.',
        },
        { status: 409 },
      )
    }

    // 새 사용자 생성 (실제로는 데이터에 추가하지 않음, Mock이므로)
    const newUser = {
      id: `${data.role}-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    }

    const { password: _, ...userWithoutPassword } = newUser

    return HttpResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        user: userWithoutPassword,
      },
    })
  }),

  // 이메일 중복 확인
  http.get(`${API_URL}/auth/check-email`, ({ request }) => {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')

    const existingUser = findUserByEmail(email)

    return HttpResponse.json({
      success: true,
      data: {
        available: !existingUser,
      },
    })
  }),

  // 로그아웃
  http.post(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      message: '로그아웃되었습니다.',
    })
  }),

  // 토큰 갱신
  http.post(`${API_URL}/auth/refresh`, async ({ request }) => {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return HttpResponse.json(
        {
          success: false,
          message: '리프레시 토큰이 없습니다.',
        },
        { status: 401 },
      )
    }

    // Mock 토큰 생성
    const newToken = `mock-jwt-token-refreshed-${Date.now()}`

    return HttpResponse.json({
      success: true,
      data: {
        accessToken: newToken,
      },
    })
  }),

  // 내 정보 조회
  http.get(`${API_URL}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: '인증 토큰이 없습니다.',
        },
        { status: 401 },
      )
    }

    // Mock: 토큰에서 사용자 ID 추출 (실제로는 JWT 검증)
    // 간단하게 첫 번째 강사 반환
    const user = findUserByEmail('instructor1@test.com')
    const { password: _, ...userWithoutPassword } = user

    return HttpResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
      },
    })
  }),
]

