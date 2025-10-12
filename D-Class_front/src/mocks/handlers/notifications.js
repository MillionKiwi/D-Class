/**
 * 알림 관련 Mock API 핸들러
 */

import { http, HttpResponse } from 'msw'
import {
  findNotificationsByUserId,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../data/notifications'
import env from '@/utils/env'

const API_URL = env.api.baseUrl

export const notificationHandlers = [
  // 내 알림 목록 조회
  http.get(`${API_URL}/users/:userId/notifications`, ({ params, request }) => {
    const { userId } = params
    const url = new URL(request.url)
    const isRead = url.searchParams.get('isRead')

    let userNotifications = findNotificationsByUserId(userId)

    // 읽음/안읽음 필터
    if (isRead !== null) {
      const isReadBool = isRead === 'true'
      userNotifications = userNotifications.filter((noti) => noti.isRead === isReadBool)
    }

    const unreadCount = getUnreadCount(userId)

    return HttpResponse.json({
      success: true,
      data: {
        notifications: userNotifications,
        unreadCount,
      },
    })
  }),

  // 읽지 않은 알림 개수
  http.get(`${API_URL}/users/:userId/notifications/unread-count`, ({ params }) => {
    const { userId } = params
    const unreadCount = getUnreadCount(userId)

    return HttpResponse.json({
      success: true,
      data: {
        unreadCount,
      },
    })
  }),

  // 알림 읽음 처리
  http.patch(`${API_URL}/notifications/:id/read`, ({ params }) => {
    const { id } = params
    const notification = markAsRead(id)

    if (!notification) {
      return HttpResponse.json(
        {
          success: false,
          message: '알림을 찾을 수 없습니다.',
        },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      success: true,
      message: '알림을 읽음 처리했습니다.',
      data: {
        notification,
      },
    })
  }),

  // 모든 알림 읽음 처리
  http.post(`${API_URL}/users/:userId/notifications/read-all`, ({ params }) => {
    const { userId } = params
    markAllAsRead(userId)

    return HttpResponse.json({
      success: true,
      message: '모든 알림을 읽음 처리했습니다.',
    })
  }),

  // 알림 삭제
  http.delete(`${API_URL}/notifications/:id`, ({ params }) => {
    const { id } = params
    const success = deleteNotification(id)

    if (!success) {
      return HttpResponse.json(
        {
          success: false,
          message: '알림을 찾을 수 없습니다.',
        },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      success: true,
      message: '알림이 삭제되었습니다.',
    })
  }),
]

