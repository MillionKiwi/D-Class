import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const settings = ref({
    application_result: true,
    verification_result: true,
    new_posting: true,
    marketing: false,
  })
  const loading = ref(false)
  const pagination = ref({
    count: 0,
    next: null,
    previous: null,
  })

  // 알림 목록 조회
  const fetchNotifications = async (params = {}) => {
    loading.value = true
    try {
      const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST, { params })
      notifications.value = response.data.results
      unreadCount.value = response.data.unread_count || 0
      pagination.value = {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      }
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  // 알림 읽음 처리
  const markAsRead = async (id) => {
    try {
      await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.READ(id))
      const notification = notifications.value.find((n) => n.id === id)
      if (notification) {
        notification.is_read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.READ_ALL)
      notifications.value.forEach((n) => (n.is_read = true))
      unreadCount.value = 0
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error }
    }
  }

  // 알림 삭제
  const deleteNotification = async (id) => {
    try {
      await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id))
      const index = notifications.value.findIndex((n) => n.id === id)
      if (index > -1) {
        if (!notifications.value[index].is_read) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
      }
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }

  // 알림 설정 조회
  const fetchSettings = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.SETTINGS)
      settings.value = response.data
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error }
    }
  }

  // 알림 설정 수정
  const updateSettings = async (formData) => {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.SETTINGS, formData)
      settings.value = response.data.settings
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || '설정 저장에 실패했습니다',
      }
    }
  }

  return {
    notifications,
    unreadCount,
    settings,
    loading,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchSettings,
    updateSettings,
  }
})
