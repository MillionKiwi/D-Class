<template>
  <div class="notification-list">
    <!-- 헤더 -->
    <div class="notification-list__header">
      <button class="back-button" @click="$router.back()">
        <ArrowLeftIcon :size="24" />
      </button>
      <h1>알림</h1>
      <BaseButton
        variant="text"
        :disabled="unreadCount === 0"
        @click="handleMarkAllAsRead"
      >
        모두 읽음
      </BaseButton>
    </div>

    <!-- 알림 목록 -->
    <div v-if="!isLoading && notifications.length > 0" class="notification-list__content">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification-item', { unread: !notification.isRead }]"
        @click="handleNotificationClick(notification)"
      >
        <div :class="['notification-item__icon', `type-${notification.type}`]">
          <component :is="getNotificationIcon(notification.type)" :size="24" />
        </div>
        <div class="notification-item__content">
          <h4>{{ notification.title }}</h4>
          <p>{{ notification.message }}</p>
          <span class="time">{{ formatRelativeTime(notification.createdAt) }}</span>
        </div>
        <button
          class="notification-item__delete"
          @click.stop="handleDelete(notification.id)"
        >
          <XIcon :size="20" />
        </button>
      </div>
    </div>

    <!-- 로딩 -->
    <BaseLoading v-if="isLoading" type="skeleton" inline :lines="5" />

    <!-- 빈 상태 -->
    <BaseEmptyState
      v-if="!isLoading && notifications.length === 0"
      title="새로운 알림이 없습니다"
      description="알림이 도착하면 여기에 표시됩니다"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft as ArrowLeftIcon,
  X as XIcon,
  FileText as FileTextIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  ShieldCheck as ShieldCheckIcon,
  Star as StarIcon,
} from 'lucide-vue-next'
import { BaseButton, BaseLoading, BaseEmptyState } from '@/components/common'
import { useNotificationStore } from '@/stores'
import { formatRelativeTime } from '@/utils/helpers'

const router = useRouter()
const notificationStore = useNotificationStore()

const isLoading = ref(false)

const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)

const getNotificationIcon = (type) => {
  const icons = {
    application: FileTextIcon,
    accepted: CheckCircleIcon,
    rejected: XCircleIcon,
    verification: ShieldCheckIcon,
    review: StarIcon,
  }
  return icons[type] || FileTextIcon
}

const handleNotificationClick = async (notification) => {
  // 읽음 처리
  if (!notification.isRead) {
    await notificationStore.markAsRead(notification.id)
  }

  // 관련 페이지로 이동
  if (notification.link) {
    router.push(notification.link)
  }
}

const handleMarkAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

const handleDelete = async (notificationId) => {
  await notificationStore.deleteNotification(notificationId)
}

onMounted(async () => {
  isLoading.value = true
  await notificationStore.fetchNotifications()
  isLoading.value = false
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.notification-list {
  min-height: 100vh;
  background-color: $color-background;

  &__header {
    @include flex-between;
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;

    .back-button {
      @include touch-target;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: $color-text-primary;
      cursor: pointer;
    }

    h1 {
      flex: 1;
      text-align: center;
      font-size: $font-size-h3;
      margin: 0;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
  }
}

.notification-item {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-lg;
  background-color: $color-white;
  border-bottom: 1px solid $color-divider;
  cursor: pointer;
  transition: all $transition-fast;

  &.unread {
    background-color: rgba($color-primary, 0.03);
  }

  &:hover {
    background-color: rgba($color-primary, 0.05);
  }

  &__icon {
    @include flex-center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    flex-shrink: 0;

    &.type-application,
    &.type-verification {
      background-color: rgba($color-primary, 0.1);
      color: $color-primary;
    }

    &.type-accepted {
      background-color: rgba($color-success, 0.1);
      color: darken($color-success, 20%);
    }

    &.type-rejected {
      background-color: rgba($color-error, 0.1);
      color: darken($color-error, 20%);
    }

    &.type-review {
      background-color: rgba($color-warning, 0.1);
      color: darken($color-warning, 20%);
    }
  }

  &__content {
    flex: 1;
    min-width: 0;

    h4 {
      font-size: $font-size-body;
      font-weight: $font-weight-semibold;
      margin: 0 0 $spacing-xs 0;
      color: $color-text-primary;
    }

    p {
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      margin: 0 0 $spacing-xs 0;
      @include text-ellipsis(2);
    }

    .time {
      font-size: $font-size-caption;
      color: $color-text-secondary;
    }
  }

  &__delete {
    @include touch-target;
    @include flex-center;
    background: none;
    border: none;
    color: $color-text-secondary;
    cursor: pointer;
    border-radius: $radius-sm;
    transition: all $transition-fast;
    flex-shrink: 0;

    &:hover {
      background-color: $color-error;
      color: $color-white;
    }
  }
}
</style>

