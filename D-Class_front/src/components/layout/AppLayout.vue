<template>
  <div class="app-layout">
    <AppHeader
      v-if="!hideNav"
      :show-search="showSearch"
      :show-add-posting="showAddPosting"
      :unread-count="unreadCountComputed"
      @search="handleSearch"
      @notification="handleNotification"
    />
    <main class="app-main" :class="{ 'no-header': hideNav }">
      <slot></slot>
    </main>
    <BottomNavigation v-if="!hideNav" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import AppHeader from './AppHeader.vue'
import BottomNavigation from './BottomNavigation.vue'

const props = defineProps({
  hideNav: {
    type: Boolean,
    default: false,
  },
  showSearch: {
    type: Boolean,
    default: false,
  },
  showAddPosting: {
    type: Boolean,
    default: false,
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
})

const router = useRouter()
const notificationStore = useNotificationStore()

const unreadCountComputed = computed(() => {
  if (props.unreadCount > 0) {
    return props.unreadCount
  }
  return notificationStore.unreadCount
})

defineEmits(['search', 'notification'])

const handleSearch = () => {
  router.push({ name: 'Search' })
}

const handleNotification = () => {
  router.push({ name: 'Notifications' })
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  padding-bottom: 80px; /* 하단 네비게이션 높이 */
}

.app-main.no-header {
  padding-top: 0;
}
</style>
