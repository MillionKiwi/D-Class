<template>
  <div class="login-page">
    <div class="login-page__container">
      <!-- 로고 & 소개 -->
      <div class="login-page__header">
        <h1 class="login-page__logo">D-Class</h1>
        <p class="login-page__subtitle">무용 강사와 학원을 위한 구인구직 플랫폼</p>
      </div>

      <!-- 로그인 폼 -->
      <form class="login-page__form" @submit.prevent="handleLogin">
        <BaseInput
          v-model="formData.email"
          type="email"
          label="이메일"
          placeholder="이메일을 입력하세요"
          required
          :error="!!errors.email"
          :errorMessage="errors.email"
          @blur="validateEmail"
        />

        <BaseInput
          v-model="formData.password"
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          required
          :error="!!errors.password"
          :errorMessage="errors.password"
        />

        <BaseButton type="submit" block :loading="isLoading">로그인</BaseButton>
      </form>

      <!-- 하단 링크 -->
      <div class="login-page__footer">
        <router-link to="/signup" class="login-page__link">회원가입</router-link>
        <span class="login-page__divider">|</span>
        <button class="login-page__link" @click="handleForgotPassword">
          비밀번호 찾기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BaseInput, BaseButton } from '@/components/common'
import { useAuthStore } from '@/stores'
import { validateEmail as isValidEmail } from '@/utils/validators'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { info } = useToast()

// Form data
const formData = reactive({
  email: '',
  password: '',
})

// Errors
const errors = reactive({
  email: '',
  password: '',
})

const isLoading = ref(false)

// Validation
const validateEmailField = () => {
  if (!formData.email) {
    errors.email = '이메일을 입력해주세요'
    return false
  }
  if (!isValidEmail(formData.email)) {
    errors.email = '올바른 이메일 형식을 입력해주세요'
    return false
  }
  errors.email = ''
  return true
}

const validateForm = () => {
  const isEmailValid = validateEmailField()
  
  if (!formData.password) {
    errors.password = '비밀번호를 입력해주세요'
    return false
  }
  errors.password = ''

  return isEmailValid
}

// Handlers
const handleLogin = async () => {
  if (!validateForm()) return

  isLoading.value = true
  const result = await authStore.login({
    email: formData.email,
    password: formData.password,
  })
  isLoading.value = false

  if (result.success) {
    // redirect 쿼리가 있으면 해당 경로로, 없으면 역할별 홈으로
    const redirectPath = route.query.redirect || result.redirectPath
    router.push(redirectPath)
  }
}

const handleForgotPassword = () => {
  info('비밀번호 찾기 기능은 준비 중입니다.')
  // TODO: 비밀번호 찾기 기능 구현
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba($color-primary, 0.1) 0%, rgba($color-accent, 0.1) 100%);
  padding: $spacing-lg;

  &__container {
    width: 100%;
    max-width: 400px;
    background-color: $color-white;
    border-radius: $radius-xl;
    box-shadow: $shadow-modal;
    padding: $spacing-3xl $spacing-2xl;

    @include mobile {
      padding: $spacing-2xl $spacing-lg;
    }
  }

  &__header {
    text-align: center;
    margin-bottom: $spacing-3xl;
  }

  &__logo {
    font-size: 48px;
    font-weight: $font-weight-bold;
    color: $color-primary;
    margin: 0 0 $spacing-md 0;
  }

  &__subtitle {
    font-size: $font-size-body-small;
    color: $color-text-secondary;
    margin: 0;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
    margin-bottom: $spacing-xl;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-md;
    padding-top: $spacing-lg;
    border-top: 1px solid $color-divider;
  }

  &__link {
    font-size: $font-size-body-small;
    color: $color-primary;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    transition: color $transition-fast;

    &:hover {
      color: $color-primary-dark;
      text-decoration: underline;
    }
  }

  &__divider {
    color: $color-divider;
  }
}
</style>

