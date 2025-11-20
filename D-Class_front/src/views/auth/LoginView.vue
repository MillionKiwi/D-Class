<template>
  <AppLayout hide-nav>
    <div class="login-page">
      <div class="login-container">
        <div class="login-header">
          <h1 class="logo">D-Match</h1>
          <p class="subtitle">무용 강사와 학원을 연결하는 플랫폼</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <Input
            v-model="form.email"
            type="email"
            label="이메일"
            placeholder="이메일을 입력하세요"
            :error="errors.email"
            required
          />
          <Input
            v-model="form.password"
            type="password"
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            :error="errors.password"
            required
          />

          <Button type="submit" :loading="authStore.loading" full-width>
            로그인
          </Button>
        </form>

        <div class="login-links">
          <router-link to="/register" class="link-text">회원가입</router-link>
          <span class="divider">|</span>
          <a href="#" class="link-text" @click.prevent="handleForgotPassword">
            비밀번호 찾기
          </a>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import Input from '@/components/common/Input.vue'
import Button from '@/components/common/Button.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showToast = inject('toast')

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const handleLogin = async () => {
  // 초기화
  errors.email = ''
  errors.password = ''

  // 유효성 검증
  if (!form.email) {
    errors.email = '이메일을 입력해주세요'
    return
  }

  if (!form.password) {
    errors.password = '비밀번호를 입력해주세요'
    return
  }

  const result = await authStore.login(form.email, form.password)

  if (result.success) {
    if (showToast) {
      showToast('로그인되었습니다', 'success')
    }
    
    // 사용자 정보 확인
    const user = result.user || authStore.user
    if (!user) {
      console.error('[LoginView] User data not found after login')
      if (showToast) {
        showToast('로그인 정보를 불러오는데 실패했습니다', 'error')
      }
      return
    }
    
    // 리다이렉트 경로 결정
    const redirect = route.query.redirect || (user.role === 'academy' ? '/academy/postings' : '/home')
    
    // 약간의 지연 후 리다이렉트 (토스트 메시지가 보이도록)
    setTimeout(() => {
      router.push(redirect).catch((err) => {
        console.error('[LoginView] Router push error:', err)
      })
    }, 100)
  } else {
    if (showToast) {
      showToast(result.error || '로그인에 실패했습니다', 'error')
    }
    if (result.error && typeof result.error === 'string') {
      if (result.error.includes('이메일')) {
        errors.email = result.error
      } else if (result.error.includes('비밀번호')) {
        errors.password = result.error
      }
    }
  }
}

const handleForgotPassword = () => {
  router.push('/password/reset')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-info) 100%);
}

.login-container {
  width: 100%;
  max-width: 400px;
  background-color: var(--color-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3xl);
  box-shadow: var(--shadow-modal);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.logo {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.login-form {
  margin-bottom: var(--spacing-xl);
}

.login-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
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

.divider {
  color: var(--color-divider);
}
</style>
