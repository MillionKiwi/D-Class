<template>
  <AppLayout hide-nav>
    <div class="password-reset-confirm-page">
      <div class="password-reset-confirm-container">
        <div class="page-header">
          <h1 class="logo">비밀번호 재설정</h1>
          <p class="subtitle">새로운 비밀번호를 입력해주세요</p>
        </div>

        <form @submit.prevent="handleSubmit" class="password-reset-confirm-form">
          <Input
            v-model="form.password"
            type="password"
            label="새 비밀번호"
            placeholder="8자 이상, 영문/숫자/특수문자 포함"
            :error="errors.password"
            required
          />
          <Input
            v-model="form.passwordConfirm"
            type="password"
            label="새 비밀번호 확인"
            placeholder="비밀번호를 다시 입력하세요"
            :error="errors.passwordConfirm"
            required
          />

          <div v-if="passwordStrength" class="password-strength">
            <span :class="['strength-indicator', passwordStrength.class]">
              {{ passwordStrength.text }}
            </span>
          </div>

          <Button type="submit" :loading="authStore.loading" full-width>
            비밀번호 재설정
          </Button>
        </form>

        <div class="login-links">
          <router-link to="/login" class="link-text">← 로그인으로 돌아가기</router-link>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import Input from '@/components/common/Input.vue'
import Button from '@/components/common/Button.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showToast = inject('toast', () => {})

const form = reactive({
  password: '',
  passwordConfirm: '',
})

const errors = reactive({
  password: '',
  passwordConfirm: '',
})

const token = computed(() => route.query.token || '')

const passwordStrength = computed(() => {
  const password = form.password
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

const validatePassword = () => {
  const password = form.password
  const passwordConfirm = form.passwordConfirm

  errors.password = ''
  errors.passwordConfirm = ''

  if (!password) {
    errors.password = '비밀번호를 입력해주세요'
    return false
  }

  if (password.length < 8) {
    errors.password = '비밀번호는 8자 이상이어야 합니다'
    return false
  }

  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/
  if (!passwordRegex.test(password)) {
    errors.password = '영문, 숫자, 특수문자를 모두 포함해야 합니다'
    return false
  }

  if (!passwordConfirm) {
    errors.passwordConfirm = '비밀번호 확인을 입력해주세요'
    return false
  }

  if (password !== passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않습니다'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validatePassword()) {
    return
  }

  if (!token.value) {
    showToast('유효하지 않은 재설정 링크입니다', 'error')
    router.push('/login')
    return
  }

  const result = await authStore.resetPassword(token.value, form.password)

  if (result.success) {
    showToast(result.data.message || '비밀번호가 재설정되었습니다', 'success')
    router.push('/login')
  } else {
    showToast(result.error || '비밀번호 재설정에 실패했습니다', 'error')
    if (result.error.includes('토큰') || result.error.includes('만료')) {
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }
}
</script>

<style scoped>
.password-reset-confirm-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-info) 100%);
}

.password-reset-confirm-container {
  width: 100%;
  max-width: 400px;
  background-color: var(--color-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3xl);
  box-shadow: var(--shadow-modal);
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.password-reset-confirm-form {
  margin-bottom: var(--spacing-xl);
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

.login-links {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
}

.link-text {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.link-text:hover {
  text-decoration: underline;
}
</style>

