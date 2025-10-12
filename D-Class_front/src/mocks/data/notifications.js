/**
 * Mock 알림 데이터
 */

export const notifications = [
  {
    id: 'noti-1',
    userId: 'instructor-1',
    type: 'application_accepted', // application_accepted, application_rejected, verification_completed, new_applicant, etc.
    title: '지원 결과 안내',
    message: '"평일 오후 컨템포러리 댄스 강사" 공고에 최종 합격하셨습니다! 축하드립니다.',
    relatedId: 'app-2',
    relatedType: 'application',
    isRead: false,
    createdAt: '2024-09-28T09:15:00Z',
  },
  {
    id: 'noti-2',
    userId: 'instructor-1',
    type: 'application_rejected',
    title: '지원 결과 안내',
    message: '"현대무용 강사 채용" 공고가 아쉽게도 불합격 되었습니다.',
    relatedId: 'app-3',
    relatedType: 'application',
    isRead: true,
    createdAt: '2024-09-23T11:00:00Z',
  },
  {
    id: 'noti-3',
    userId: 'instructor-1',
    type: 'verification_completed',
    title: '인증 완료',
    message: '학력/경력 인증이 완료되었습니다. 프로필에 인증 배지가 표시됩니다.',
    relatedId: null,
    relatedType: 'verification',
    isRead: true,
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'noti-4',
    userId: 'academy-1',
    type: 'new_applicant',
    title: '새로운 지원자',
    message: '"주말 발레 강사 모집" 공고에 새로운 지원자가 있습니다.',
    relatedId: 'app-1',
    relatedType: 'application',
    isRead: false,
    createdAt: '2024-10-03T10:30:00Z',
  },
  {
    id: 'noti-5',
    userId: 'academy-1',
    type: 'new_applicant',
    title: '새로운 지원자',
    message: '"주말 발레 강사 모집" 공고에 새로운 지원자가 있습니다.',
    relatedId: 'app-4',
    relatedType: 'application',
    isRead: false,
    createdAt: '2024-10-02T09:15:00Z',
  },
  {
    id: 'noti-6',
    userId: 'instructor-2',
    type: 'verification_pending',
    title: '인증 심사 중',
    message: '제출하신 인증 서류를 검토 중입니다. 1-2일 내 결과를 알려드리겠습니다.',
    relatedId: null,
    relatedType: 'verification',
    isRead: true,
    createdAt: '2024-02-21T10:00:00Z',
  },
]

// 사용자 ID로 알림 찾기
export const findNotificationsByUserId = (userId) => {
  return notifications.filter((noti) => noti.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// 읽지 않은 알림 개수
export const getUnreadCount = (userId) => {
  return notifications.filter((noti) => noti.userId === userId && !noti.isRead).length
}

// 알림 읽음 처리
export const markAsRead = (notificationId) => {
  const noti = notifications.find((n) => n.id === notificationId)
  if (noti) {
    noti.isRead = true
  }
  return noti
}

// 모든 알림 읽음 처리
export const markAllAsRead = (userId) => {
  notifications.forEach((noti) => {
    if (noti.userId === userId) {
      noti.isRead = true
    }
  })
}

// 새 알림 생성
export const createNotification = (data) => {
  const newNoti = {
    id: `noti-${Date.now()}`,
    ...data,
    isRead: false,
    createdAt: new Date().toISOString(),
  }

  notifications.push(newNoti)
  return newNoti
}

// 알림 삭제
export const deleteNotification = (notificationId) => {
  const index = notifications.findIndex((n) => n.id === notificationId)
  if (index !== -1) {
    notifications.splice(index, 1)
    return true
  }
  return false
}

