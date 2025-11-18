<template>
  <AppLayout hide-nav>
    <div class="password-reset-page">
      <div class="password-reset-container">
        <div class="page-header">
          <h1 class="logo">비밀번호 찾기</h1>
          <p class="subtitle">등록된 이메일로 비밀번호 재설정 링크를 보내드립니다</p>
        </div>

        <form @submit.prevent="handleSubmit" class="password-reset-form">
          <Input
            v-model="form.email"
            type="email"
            label="이메일"
            placeholder="가입하신 이메일을 입력하세요"
            :error="errors.email"
            required
          />

          <Button type="submit" :loading="authStore.loading" full-width>
            재설정 링크 발송
          </Button>
        </form>

        <div class="login-links">
          <router-link to="/login" class="link-text">← 로그인으로 돌아가기</router-link>
        </div>

        <!-- 성공 메시지 -->
        <div v-if="successMessage" class="success-message card">
          <p>{{ successMessage }}</p>
          <p class="success-detail">이메일을 확인하시고 링크를 클릭하여 비밀번호를 재설정해주세요.</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import Input from '@/components/common/Input.vue'
import Button from '@/components/common/Button.vue'
import Card from '@/components/common/Card.vue'

const router = useRouter()
const authStore = useAuthStore()
const showToast = inject('toast')

const form = reactive({
  email: '',
})

const errors = reactive({
  email: '',
})

const successMessage = ref('')

const handleSubmit = async () => {
  // 초기화
  errors.email = ''
  successMessage.value = ''

  // 유효성 검증
  if (!form.email) {
    errors.email = '이메일을 입력해주세요'
    return
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    errors.email = '올바른 이메일 형식을 입력해주세요'
    return
  }

  const result = await authStore.requestPasswordReset(form.email)

  if (result.success) {
    successMessage.value = result.data.message || '비밀번호 재설정 링크가 이메일로 발송되었습니다'
    showToast(successMessage.value, 'success')
    form.email = ''
  } else {
    showToast(result.error || '비밀번호 재설정 요청에 실패했습니다', 'error')
    if (result.error.includes('이메일')) {
      errors.email = result.error
    }
  }
}
</script>

<style scoped>
.password-reset-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-info) 100%);
}

.password-reset-container {
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

.password-reset-form {
  margin-bottom: var(--spacing-xl);
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

.success-message {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  text-align: center;
}

.success-message p {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 1.6;
}

.success-detail {
  margin-top: var(--spacing-sm);
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>

