<template>
  <div class="notification-settings">
    <!-- 헤더 -->
    <div class="notification-settings__header">
      <button class="back-button" @click="$router.back()">
        <ArrowLeftIcon :size="24" />
      </button>
      <h1>알림 설정</h1>
      <div style="width: 44px"></div>
    </div>

    <!-- 알림 설정 -->
    <div class="notification-settings__content">
      <section class="notification-settings__section">
        <div class="setting-list">
          <div class="setting-item">
            <div class="setting-item__info">
              <h4>지원 결과 알림</h4>
              <p>지원한 공고의 합격/불합격 알림</p>
            </div>
            <label class="toggle-switch">
              <input v-model="settings.applicationResult" type="checkbox" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-item__info">
              <h4>인증 결과 알림</h4>
              <p>인증 서류 승인/반려 알림</p>
            </div>
            <label class="toggle-switch">
              <input v-model="settings.verificationResult" type="checkbox" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-item__info">
              <h4>새 공고 알림</h4>
              <p>조건에 맞는 새 공고 등록 알림</p>
            </div>
            <label class="toggle-switch">
              <input v-model="settings.newJob" type="checkbox" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-item__info">
              <h4>이벤트/혜택 알림 (선택)</h4>
              <p>마케팅 및 프로모션 정보</p>
            </div>
            <label class="toggle-switch">
              <input v-model="settings.events" type="checkbox" />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </section>

      <!-- 저장 버튼 -->
      <div class="notification-settings__actions">
        <BaseButton block :disabled="!hasChanges" :loading="isSaving" @click="handleSave">
          설정 저장
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ArrowLeft as ArrowLeftIcon } from 'lucide-vue-next'
import { BaseButton } from '@/components/common'
import { useNotificationStore } from '@/stores'

const notificationStore = useNotificationStore()

const isSaving = ref(false)
const originalSettings = ref(null)

const settings = reactive({
  applicationResult: true,
  verificationResult: true,
  newJob: true,
  events: false,
})

const hasChanges = computed(() => {
  return JSON.stringify(settings) !== JSON.stringify(originalSettings.value)
})

const handleSave = async () => {
  isSaving.value = true
  await notificationStore.updateNotificationSettings(settings)
  originalSettings.value = { ...settings }
  isSaving.value = false
}

onMounted(async () => {
  await notificationStore.fetchNotificationSettings()
  Object.assign(settings, notificationStore.settings)
  originalSettings.value = { ...settings }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.notification-settings {
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
    padding: $spacing-lg;
  }

  &__section {
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;
    padding: $spacing-xl;
    margin-bottom: $spacing-lg;
  }

  &__actions {
    padding: 0 $spacing-lg;
  }
}

.setting-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.setting-item {
  @include flex-between;
  gap: $spacing-lg;

  &__info {
    flex: 1;

    h4 {
      font-size: $font-size-body;
      font-weight: $font-weight-semibold;
      margin: 0 0 $spacing-xs 0;
      color: $color-text-primary;
    }

    p {
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      margin: 0;
    }
  }
}

// 토글 스위치
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
  flex-shrink: 0;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .slider {
      background-color: $color-primary;

      &::before {
        transform: translateX(22px);
      }
    }
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $color-disabled;
    transition: $transition-fast;
    border-radius: $radius-full;

    &::before {
      position: absolute;
      content: '';
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: $color-white;
      transition: $transition-fast;
      border-radius: 50%;
    }
  }
}
</style>

