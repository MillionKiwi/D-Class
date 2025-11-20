<template>
  <AppLayout>
    <div class="notification-settings-page page-container">
      <div class="page-header">
        <h1 class="page-title">알림 설정</h1>
      </div>

      <div v-if="loading && !settings" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else class="settings-content">
        <div class="settings-section card">
          <h3>알림 유형</h3>
          <div class="setting-items">
            <label class="setting-item">
              <span class="setting-label">지원 결과 알림</span>
              <input
                type="checkbox"
                v-model="localSettings.application_result"
                class="toggle-input"
              />
            </label>

            <label class="setting-item">
              <span class="setting-label">인증 결과 알림</span>
              <input
                type="checkbox"
                v-model="localSettings.verification_result"
                class="toggle-input"
              />
            </label>

            <label class="setting-item">
              <span class="setting-label">새 공고 알림</span>
              <input type="checkbox" v-model="localSettings.new_posting" class="toggle-input" />
            </label>

            <label class="setting-item">
              <span class="setting-label">이벤트/혜택 알림</span>
              <input type="checkbox" v-model="localSettings.marketing" class="toggle-input" />
            </label>
          </div>
        </div>

        <div class="action-section">
          <Button @click="handleSave" :loading="saving" full-width>저장</Button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const notificationStore = useNotificationStore()
const showToast = inject('toast', () => {})

const localSettings = ref({
  application_result: true,
  verification_result: true,
  new_posting: true,
  marketing: false,
})
const saving = ref(false)
const loading = computed(() => notificationStore.loading)
const settings = computed(() => notificationStore.settings)

const fetchSettings = async () => {
  const result = await notificationStore.fetchSettings()
  if (result.success) {
    localSettings.value = { ...result.data }
  }
}

const handleSave = async () => {
  saving.value = true
  const result = await notificationStore.updateSettings(localSettings.value)
  saving.value = false

  if (result.success) {
    showToast('설정이 저장되었습니다', 'success')
  } else {
    showToast(result.error || '설정 저장에 실패했습니다', 'error')
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.notification-settings-page {
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.settings-section {
  margin-bottom: var(--spacing-lg);
}

.settings-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-divider);
}

.setting-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.setting-label {
  font-size: 16px;
  color: var(--color-text-primary);
}

.toggle-input {
  width: 48px;
  height: 24px;
  appearance: none;
  background-color: var(--color-divider);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-input:checked {
  background-color: var(--color-primary);
}

.toggle-input::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
}

.toggle-input:checked::before {
  transform: translateX(24px);
}

.action-section {
  margin-top: var(--spacing-xl);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
