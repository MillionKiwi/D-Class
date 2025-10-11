/**
 * 알림 관련 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/api'
import { useToast } from '@/composables/useToast'

export const useNotificationStore = defineStore('notification', () => {
  const { error: showError } = useToast()

  // State
  const notifications = ref([])
  const unreadCount = ref(0)
  const settings = ref({
    applicationResult: true, // 지원 결과 알림
    verificationResult: true, // 인증 결과 알림
    newJob: true, // 새 공고 알림
    events: false, // 이벤트/혜택 알림
  })
  const isLoading = ref(false)

  // Getters
  const unreadNotifications = computed(() => {
    return notifications.value.filter((n) => !n.isRead)
  })

  const readNotifications = computed(() => {
    return notifications.value.filter((n) => n.isRead)
  })

  // Actions

  /**
   * 알림 목록 조회
   */
  const fetchNotifications = async () => {
    isLoading.value = true
    try {
      const response = await apiClient.get('/notifications')
      notifications.value = response.data.notifications
      unreadCount.value = response.data.unreadCount
      return { success: true }
    } catch (err) {
      showError('알림 목록을 불러오는데 실패했습니다.')
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 알림 읽음 처리
   */
  const markAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`)
      
      const notification = notifications.value.find((n) => n.id === notificationId)
      if (notification && !notification.isRead) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }

      return { success: true }
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
      return { success: false, error: err }
    }
  }

  /**
   * 모든 알림 읽음 처리
   */
  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all')
      
      notifications.value.forEach((n) => {
        n.isRead = true
      })
      unreadCount.value = 0

      return { success: true }
    } catch (err) {
      showError('알림 읽음 처리에 실패했습니다.')
      return { success: false, error: err }
    }
  }

  /**
   * 알림 삭제
   */
  const deleteNotification = async (notificationId) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`)
      
      const index = notifications.value.findIndex((n) => n.id === notificationId)
      if (index > -1) {
        const notification = notifications.value[index]
        if (!notification.isRead) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
      }

      return { success: true }
    } catch (err) {
      showError('알림 삭제에 실패했습니다.')
      return { success: false, error: err }
    }
  }

  /**
   * 알림 설정 조회
   */
  const fetchNotificationSettings = async () => {
    try {
      const response = await apiClient.get('/notifications/settings')
      settings.value = response.data
      return { success: true }
    } catch (err) {
      showError('알림 설정을 불러오는데 실패했습니다.')
      return { success: false, error: err }
    }
  }

  /**
   * 알림 설정 저장
   */
  const updateNotificationSettings = async (newSettings) => {
    try {
      await apiClient.put('/notifications/settings', newSettings)
      settings.value = newSettings
      return { success: true }
    } catch (err) {
      showError('알림 설정 저장에 실패했습니다.')
      return { success: false, error: err }
    }
  }

  /**
   * 새 알림 추가 (실시간 알림용)
   */
  const addNotification = (notification) => {
    notifications.value.unshift(notification)
    if (!notification.isRead) {
      unreadCount.value += 1
    }
  }

  return {
    // State
    notifications,
    unreadCount,
    settings,
    isLoading,
    // Getters
    unreadNotifications,
    readNotifications,
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotificationSettings,
    updateNotificationSettings,
    addNotification,
  }
})

