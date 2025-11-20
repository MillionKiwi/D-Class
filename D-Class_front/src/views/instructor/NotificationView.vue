<template>
  <AppLayout>
    <div class="notification-page page-container">
      <div class="page-header">
        <h1 class="page-title">알림</h1>
        <Button variant="text" @click="handleMarkAllAsRead">모두 읽음</Button>
      </div>

      <div v-if="loading && notifications.length === 0" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else-if="notifications.length > 0" class="notifications-list">
        <Card
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification-card', { unread: !notification.is_read }]"
          clickable
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-header">
            <div class="notification-icon">
              <span :class="getNotificationIcon(notification.type)">
                {{ getNotificationIconText(notification.type) }}
              </span>
            </div>
            <div class="notification-content">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <p class="notification-text">{{ notification.content }}</p>
            </div>
          </div>
          <div class="notification-footer">
            <span class="notification-date">{{ formatDate(notification.created_at) }}</span>
            <button
              class="delete-btn"
              @click.stop="handleDelete(notification.id)"
            >
              ×
            </button>
          </div>
        </Card>
      </div>

      <div v-else class="empty-state">
        <p>새로운 알림이 없습니다</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const notificationStore = useNotificationStore()
const showToast = inject('toast', () => {})

const { notifications, loading, unreadCount } = notificationStore

const fetchNotifications = async () => {
  await notificationStore.fetchNotifications()
}

const handleNotificationClick = async (notification) => {
  // 읽음 처리
  if (!notification.is_read) {
    await notificationStore.markAsRead(notification.id)
  }

  // 관련 페이지로 이동
  if (notification.related_url) {
    router.push(notification.related_url)
  }
}

const handleMarkAllAsRead = async () => {
  const result = await notificationStore.markAllAsRead()
  if (result.success) {
    showToast('모든 알림이 읽음 처리되었습니다', 'success')
  }
}

const handleDelete = async (id) => {
  const result = await notificationStore.deleteNotification(id)
  if (result.success) {
    showToast('알림이 삭제되었습니다', 'success')
  }
}

const getNotificationIcon = (type) => {
  const iconClasses = {
    application_accepted: 'icon-success',
    application_rejected: 'icon-error',
    verification_approved: 'icon-info',
    verification_rejected: 'icon-error',
    new_posting: 'icon-primary',
    new_application: 'icon-primary',
  }
  return iconClasses[type] || 'icon-primary'
}

const getNotificationIconText = (type) => {
  const icons = {
    application_accepted: '✓',
    application_rejected: '✗',
    verification_approved: '✓',
    verification_rejected: '✗',
    new_posting: '📢',
    new_application: '📝',
  }
  return icons[type] || '📬'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  return date.toLocaleDateString('ko-KR')
}

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.notification-page {
  padding: var(--spacing-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.notification-card {
  padding: var(--spacing-lg);
}

.notification-card.unread {
  background-color: rgba(167, 199, 231, 0.1);
}

.notification-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.notification-icon {
  flex-shrink: 0;
}

.notification-icon span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
}

.icon-primary {
  background-color: var(--color-primary);
  color: white;
}

.icon-success {
  background-color: var(--color-success);
  color: white;
}

.icon-error {
  background-color: var(--color-error);
  color: white;
}

.icon-info {
  background-color: var(--color-info);
  color: var(--color-text-primary);
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
}

.notification-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-divider);
}

.notification-date {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.delete-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  transition: color 0.2s;
}

.delete-btn:hover {
  color: var(--color-error);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
