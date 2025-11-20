<template>
  <AppLayout>
    <div class="password-change-page page-container">
      <div class="page-header">
        <h1 class="page-title">비밀번호 변경</h1>
      </div>

      <form @submit.prevent="handleSubmit" class="password-change-form">
        <Input
          v-model="form.oldPassword"
          type="password"
          label="현재 비밀번호"
          placeholder="현재 비밀번호를 입력하세요"
          :error="errors.oldPassword"
          required
        />

        <Input
          v-model="form.newPassword"
          type="password"
          label="새 비밀번호"
          placeholder="8자 이상, 영문/숫자/특수문자 포함"
          :error="errors.newPassword"
          required
        />

        <Input
          v-model="form.newPasswordConfirm"
          type="password"
          label="새 비밀번호 확인"
          placeholder="새 비밀번호를 다시 입력하세요"
          :error="errors.newPasswordConfirm"
          required
        />

        <div v-if="passwordStrength" class="password-strength">
          <span :class="['strength-indicator', passwordStrength.class]">
            {{ passwordStrength.text }}
          </span>
        </div>

        <Button type="submit" :loading="authStore.loading" full-width>
          비밀번호 변경
        </Button>
      </form>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import Input from '@/components/common/Input.vue'
import Button from '@/components/common/Button.vue'

const router = useRouter()
const authStore = useAuthStore()
const showToast = inject('toast', () => {})

const form = reactive({
  oldPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
})

const errors = reactive({
  oldPassword: '',
  newPassword: '',
  newPasswordConfirm: '',
})

const passwordStrength = computed(() => {
  const password = form.newPassword
  if (!password) return null

  let strength = 0
  let text = '약함'
  let class_ = 'weak'

  if (password.length >= 8) strength++
  if (/[a-zA-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  if (strength === 4) {
    text = '강함'
    class_ = 'strong'
  } else if (strength === 3) {
    text = '보통'
    class_ = 'medium'
  }

  return { text, class: class_ }
})

const validateForm = () => {
  errors.oldPassword = ''
  errors.newPassword = ''
  errors.newPasswordConfirm = ''

  if (!form.oldPassword) {
    errors.oldPassword = '현재 비밀번호를 입력해주세요'
    return false
  }

  if (!form.newPassword) {
    errors.newPassword = '새 비밀번호를 입력해주세요'
    return false
  }

  if (form.newPassword.length < 8) {
    errors.newPassword = '비밀번호는 8자 이상이어야 합니다'
    return false
  }

  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/
  if (!passwordRegex.test(form.newPassword)) {
    errors.newPassword = '영문, 숫자, 특수문자를 모두 포함해야 합니다'
    return false
  }

  if (!form.newPasswordConfirm) {
    errors.newPasswordConfirm = '비밀번호 확인을 입력해주세요'
    return false
  }

  if (form.newPassword !== form.newPasswordConfirm) {
    errors.newPasswordConfirm = '비밀번호가 일치하지 않습니다'
    return false
  }

  if (form.oldPassword === form.newPassword) {
    errors.newPassword = '현재 비밀번호와 동일한 비밀번호는 사용할 수 없습니다'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  const result = await authStore.changePassword(form.oldPassword, form.newPassword)

  if (result.success) {
    showToast(result.data.message || '비밀번호가 변경되었습니다', 'success')
    form.oldPassword = ''
    form.newPassword = ''
    form.newPasswordConfirm = ''
    router.back()
  } else {
    showToast(result.error || '비밀번호 변경에 실패했습니다', 'error')
    if (result.error.includes('현재 비밀번호') || result.error.includes('old_password')) {
      errors.oldPassword = '현재 비밀번호가 올바르지 않습니다'
    }
  }
}
</script>

<style scoped>
.password-change-page {
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

.password-change-form {
  max-width: 400px;
  margin: 0 auto;
}

.password-strength {
  margin-top: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.strength-indicator {
  font-size: 12px;
  font-weight: 500;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.strength-indicator.weak {
  color: #f44336;
  background-color: rgba(244, 67, 54, 0.1);
}

.strength-indicator.medium {
  color: #ff9800;
  background-color: rgba(255, 152, 0, 0.1);
}

.strength-indicator.strong {
  color: #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
}
</style>

