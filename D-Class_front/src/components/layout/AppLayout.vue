<template>
  <div class="app-layout">
    <AppHeader
      v-if="!hideNav"
      :show-search="showSearch"
      :show-add-posting="showAddPosting"
      :unread-count="unreadCount"
      @search="$emit('search')"
      @notification="$emit('notification')"
    />
    <main class="app-main" :class="{ 'no-header': hideNav }">
      <slot></slot>
    </main>
    <BottomNavigation v-if="!hideNav" />
    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import AppHeader from './AppHeader.vue'
import BottomNavigation from './BottomNavigation.vue'
import Toast from '@/components/common/Toast.vue'

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

defineEmits(['search', 'notification'])

const toastRef = ref(null)

// Toast 메서드를 provide로 제공
const showToast = (message, type = 'info', duration = 3000) => {
  if (toastRef.value) {
    toastRef.value.message = message
    toastRef.value.type = type
    toastRef.value.show()
  }
}

provide('toast', showToast)
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
