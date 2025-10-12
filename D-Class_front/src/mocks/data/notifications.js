/**
 * Mock 알림 데이터
 */

export const mockNotifications = [
  {
    id: 'notif-1',
    type: 'application_result',
    title: '지원 결과 안내',
    message: '강남무용학원의 "발레 전임강사 모집" 공고에 채용이 확정되었습니다.',
    relatedId: 'app-4',
    isRead: false,
    createdAt: '2024-10-10T09:00:00Z',
  },
  {
    id: 'notif-2',
    type: 'verification_result',
    title: '인증 승인 완료',
    message: '제출하신 인증 서류가 승인되었습니다.',
    relatedId: null,
    isRead: false,
    createdAt: '2024-10-09T14:30:00Z',
  },
  {
    id: 'notif-3',
    type: 'new_job',
    title: '새로운 공고 등록',
    message: '회원님이 관심있는 지역에 새로운 공고가 등록되었습니다.',
    relatedId: 'job-2',
    isRead: true,
    createdAt: '2024-10-05T10:00:00Z',
  },
]

// 다음 알림 ID 생성
let nextNotificationId = 4

export const generateNotificationId = () => {
  return `notif-${nextNotificationId++}`
}

// 알림 설정 기본값
export const mockNotificationSettings = {
  applicationResult: true,
  verificationResult: true,
  newJob: true,
  events: false,
}

