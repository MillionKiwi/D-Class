<template>
  <div class="signup-info">
    <div class="signup-info__container">
      <!-- 진행 단계 -->
      <div class="signup-info__progress">
        <div class="progress-step completed">1</div>
        <div class="progress-line completed"></div>
        <div class="progress-step active">2</div>
        <div class="progress-line"></div>
        <div class="progress-step">3</div>
      </div>

      <div class="signup-info__header">
        <h1>회원가입</h1>
        <p>
          <strong>{{ roleLabel }}</strong> 정보를 입력해주세요
        </p>
      </div>

      <!-- 회원가입 폼 -->
      <form class="signup-info__form" @submit.prevent="handleSubmit">
        <!-- 이메일 -->
        <div class="form-group">
          <BaseInput
            v-model="formData.email"
            type="email"
            label="이메일"
            placeholder="이메일을 입력하세요"
            required
            :error="!!errors.email"
            :errorMessage="errors.email"
            :success="emailChecked && !errors.email"
            :successMessage="emailChecked ? '사용 가능한 이메일입니다' : ''"
            @blur="validateEmail"
          />
          <BaseButton
            variant="secondary"
            class="check-button"
            :loading="checkingEmail"
            @click="handleCheckEmail"
          >
            중복 확인
          </BaseButton>
        </div>

        <!-- 비밀번호 -->
        <BaseInput
          v-model="formData.password"
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력하세요 (8자 이상)"
          required
          :error="!!errors.password"
          :errorMessage="errors.password"
          hint="8자 이상, 영문/숫자/특수문자 포함"
          @blur="validatePassword"
        />

        <!-- 비밀번호 강도 -->
        <div v-if="formData.password" class="password-strength">
          <div class="password-strength__label">
            비밀번호 강도:
            <span :class="`strength-${passwordStrength}`">{{ passwordStrengthText }}</span>
          </div>
          <div class="password-strength__bar">
            <div :class="['bar', `strength-${passwordStrength}`]"></div>
          </div>
        </div>

        <!-- 비밀번호 확인 -->
        <BaseInput
          v-model="formData.passwordConfirm"
          type="password"
          label="비밀번호 확인"
          placeholder="비밀번호를 다시 입력하세요"
          required
          :error="!!errors.passwordConfirm"
          :errorMessage="errors.passwordConfirm"
          @blur="validatePasswordConfirm"
        />

        <!-- 이름 -->
        <BaseInput
          v-model="formData.name"
          label="이름"
          :placeholder="isInstructor ? '이름을 입력하세요' : '학원명을 입력하세요'"
          required
          :error="!!errors.name"
          :errorMessage="errors.name"
        />

        <!-- 연락처 -->
        <BaseInput
          v-model="formData.phone"
          type="tel"
          label="연락처"
          placeholder="010-1234-5678"
          required
          :error="!!errors.phone"
          :errorMessage="errors.phone"
          @blur="validatePhone"
        />

        <!-- 강사 전용: 전문 분야 -->
        <div v-if="isInstructor" class="form-field">
          <label class="form-field__label">
            전문 분야 <span class="required">*</span>
          </label>
          <div class="genre-chips">
            <button
              v-for="genre in DANCE_GENRES"
              :key="genre.value"
              type="button"
              :class="['genre-chip', { selected: formData.genres.includes(genre.value) }]"
              @click="toggleGenre(genre.value)"
            >
              {{ genre.label }}
            </button>
          </div>
          <p v-if="errors.genres" class="error-message">{{ errors.genres }}</p>
        </div>

        <!-- 학원 전용: 주소 -->
        <div v-if="!isInstructor" class="form-field">
          <BaseInput
            v-model="formData.address"
            label="학원 주소"
            placeholder="주소를 검색하세요"
            required
            :error="!!errors.address"
            :errorMessage="errors.address"
            readonly
            @click="handleAddressSearch"
          />
        </div>

        <!-- 약관 동의 -->
        <div class="terms">
          <label class="terms__item">
            <input
              v-model="allAgreed"
              type="checkbox"
              @change="handleAllAgreeChange"
            />
            <span>전체 동의</span>
          </label>

          <div class="terms__divider"></div>

          <label class="terms__item">
            <input v-model="formData.agreeTerms" type="checkbox" />
            <span>
              <strong>(필수)</strong> 이용약관 동의
              <button type="button" class="terms__link" @click="showTerms('terms')">
                보기
              </button>
            </span>
          </label>

          <label class="terms__item">
            <input v-model="formData.agreePrivacy" type="checkbox" />
            <span>
              <strong>(필수)</strong> 개인정보 처리방침 동의
              <button type="button" class="terms__link" @click="showTerms('privacy')">
                보기
              </button>
            </span>
          </label>

          <label class="terms__item">
            <input v-model="formData.agreeMarketing" type="checkbox" />
            <span>(선택) 마케팅 수신 동의</span>
          </label>
        </div>

        <!-- 액션 버튼 -->
        <div class="signup-info__actions">
          <BaseButton variant="secondary" @click="handleBack">이전</BaseButton>
          <BaseButton type="submit" :loading="isLoading" :disabled="!canSubmit">
            가입 완료
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BaseInput, BaseButton } from '@/components/common'
import { useAuthStore } from '@/stores'
import { USER_ROLES, DANCE_GENRES } from '@/utils/constants'
import {
  validateEmail as isValidEmail,
  validatePassword as isValidPassword,
  validatePhoneNumber,
  getPasswordStrength,
} from '@/utils/validators'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { info } = useToast()

// Role 확인
const role = ref(route.query.role || USER_ROLES.INSTRUCTOR)
const isInstructor = computed(() => role.value === USER_ROLES.INSTRUCTOR)
const roleLabel = computed(() => (isInstructor.value ? '강사' : '학원'))

// Form data
const formData = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  phone: '',
  genres: [], // 강사만
  address: '', // 학원만
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketing: false,
})

// Errors
const errors = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  phone: '',
  genres: '',
  address: '',
})

const emailChecked = ref(false)
const checkingEmail = ref(false)
const isLoading = ref(false)

// 전체 동의
const allAgreed = computed({
  get: () => formData.agreeTerms && formData.agreePrivacy && formData.agreeMarketing,
  set: (value) => {
    formData.agreeTerms = value
    formData.agreePrivacy = value
    formData.agreeMarketing = value
  },
})

// 비밀번호 강도
const passwordStrength = computed(() => getPasswordStrength(formData.password))
const passwordStrengthText = computed(() => {
  const texts = {
    none: '',
    weak: '약함',
    medium: '보통',
    strong: '강함',
  }
  return texts[passwordStrength.value]
})

// 제출 가능 여부
const canSubmit = computed(() => {
  const basicValid =
    emailChecked.value &&
    formData.email &&
    formData.password &&
    formData.passwordConfirm &&
    formData.name &&
    formData.phone &&
    formData.agreeTerms &&
    formData.agreePrivacy

  if (isInstructor.value) {
    return basicValid && formData.genres.length > 0
  } else {
    return basicValid && formData.address
  }
})

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

const validatePasswordField = () => {
  if (!formData.password) {
    errors.password = '비밀번호를 입력해주세요'
    return false
  }
  if (!isValidPassword(formData.password)) {
    errors.password = '8자 이상, 영문/숫자/특수문자를 포함해주세요'
    return false
  }
  errors.password = ''
  return true
}

const validatePasswordConfirmField = () => {
  if (!formData.passwordConfirm) {
    errors.passwordConfirm = '비밀번호 확인을 입력해주세요'
    return false
  }
  if (formData.password !== formData.passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않습니다'
    return false
  }
  errors.passwordConfirm = ''
  return true
}

const validatePhoneField = () => {
  if (!formData.phone) {
    errors.phone = '연락처를 입력해주세요'
    return false
  }
  if (!validatePhoneNumber(formData.phone)) {
    errors.phone = '올바른 연락처 형식을 입력해주세요 (010-1234-5678)'
    return false
  }
  errors.phone = ''
  return true
}

// Handlers
const handleCheckEmail = async () => {
  if (!validateEmailField()) return

  checkingEmail.value = true
  // TODO: 실제 API 호출
  setTimeout(() => {
    emailChecked.value = true
    checkingEmail.value = false
    info('사용 가능한 이메일입니다.')
  }, 500)
}

const handleAllAgreeChange = () => {
  // allAgreed computed의 setter가 자동으로 처리
}

const toggleGenre = (genreValue) => {
  const index = formData.genres.indexOf(genreValue)
  if (index > -1) {
    formData.genres.splice(index, 1)
  } else {
    formData.genres.push(genreValue)
  }
  errors.genres = ''
}

const handleAddressSearch = () => {
  info('주소 검색 기능은 준비 중입니다.')
  // TODO: 주소 검색 API 연동 (다음 주소 API 등)
}

const showTerms = (type) => {
  info(`${type === 'terms' ? '이용약관' : '개인정보 처리방침'}을 확인해주세요.`)
  // TODO: 약관 모달 표시
}

const handleBack = () => {
  router.push('/signup')
}

const handleSubmit = async () => {
  // Validation
  if (!emailChecked.value) {
    errors.email = '이메일 중복 확인을 해주세요'
    return
  }

  const isValid =
    validateEmailField() &&
    validatePasswordField() &&
    validatePasswordConfirmField() &&
    validatePhoneField()

  if (!isValid) return

  if (isInstructor.value && formData.genres.length === 0) {
    errors.genres = '전문 분야를 1개 이상 선택해주세요'
    return
  }

  if (!isInstructor.value && !formData.address) {
    errors.address = '학원 주소를 입력해주세요'
    return
  }

  if (!formData.agreeTerms || !formData.agreePrivacy) {
    info('필수 약관에 동의해주세요.')
    return
  }

  // 회원가입
  isLoading.value = true
  const signupData = {
    role: role.value,
    email: formData.email,
    password: formData.password,
    name: formData.name,
    phone: formData.phone,
    agreeMarketing: formData.agreeMarketing,
    ...(isInstructor.value ? { genres: formData.genres } : { address: formData.address }),
  }

  await authStore.signup(signupData)
  isLoading.value = false
}

// 역할이 없으면 선택 페이지로 리다이렉트
onMounted(() => {
  if (!route.query.role) {
    router.push('/signup')
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.signup-info {
  min-height: 100vh;
  background-color: $color-background;
  padding: $spacing-lg;
  padding-bottom: $spacing-3xl;

  &__container {
    max-width: 600px;
    margin: 0 auto;
    background-color: $color-white;
    border-radius: $radius-xl;
    box-shadow: $shadow-card;
    padding: $spacing-3xl $spacing-2xl;

    @include mobile {
      padding: $spacing-2xl $spacing-lg;
    }
  }

  &__progress {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-3xl;

    .progress-step {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: $color-disabled;
      color: $color-white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: $font-weight-semibold;
      font-size: $font-size-body;

      &.active {
        background-color: $color-primary;
      }

      &.completed {
        background-color: $color-success;
      }
    }

    .progress-line {
      width: 60px;
      height: 2px;
      background-color: $color-divider;

      &.completed {
        background-color: $color-success;
      }

      @include mobile {
        width: 40px;
      }
    }
  }

  &__header {
    text-align: center;
    margin-bottom: $spacing-3xl;

    h1 {
      font-size: $font-size-h1;
      margin: 0 0 $spacing-md 0;
    }

    p {
      font-size: $font-size-body;
      color: $color-text-secondary;
      margin: 0;

      strong {
        color: $color-primary;
      }
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
  }

  &__actions {
    display: flex;
    gap: $spacing-md;
    margin-top: $spacing-lg;
  }
}

.form-group {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: $spacing-md;
  align-items: start;

  .check-button {
    margin-top: 32px; // label height + margin
  }
}

.form-field {
  &__label {
    display: block;
    font-size: $font-size-body;
    font-weight: $font-weight-medium;
    color: $color-text-primary;
    margin-bottom: $spacing-sm;

    .required {
      color: $color-error;
    }
  }
}

.password-strength {
  margin-top: -$spacing-md;

  &__label {
    font-size: $font-size-body-small;
    color: $color-text-secondary;
    margin-bottom: $spacing-xs;

    .strength-weak {
      color: $color-error;
    }

    .strength-medium {
      color: $color-warning;
    }

    .strength-strong {
      color: $color-success;
    }
  }

  &__bar {
    height: 4px;
    background-color: $color-divider;
    border-radius: $radius-full;
    overflow: hidden;

    .bar {
      height: 100%;
      transition: all $transition-base;
      border-radius: $radius-full;

      &.strength-weak {
        width: 33%;
        background-color: $color-error;
      }

      &.strength-medium {
        width: 66%;
        background-color: $color-warning;
      }

      &.strength-strong {
        width: 100%;
        background-color: $color-success;
      }
    }
  }
}

.genre-chips {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.genre-chip {
  padding: $spacing-sm $spacing-md;
  border: 1px solid $color-divider;
  border-radius: $radius-full;
  background-color: $color-white;
  color: $color-text-primary;
  font-size: $font-size-body-small;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $color-primary;
    background-color: rgba($color-primary, 0.05);
  }

  &.selected {
    border-color: $color-primary;
    background-color: $color-primary;
    color: $color-white;
  }
}

.terms {
  border: 1px solid $color-divider;
  border-radius: $radius-md;
  padding: $spacing-lg;

  &__item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
    cursor: pointer;

    &:last-child {
      margin-bottom: 0;
    }

    input[type='checkbox'] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    span {
      flex: 1;
      font-size: $font-size-body-small;
      color: $color-text-primary;
    }

    strong {
      color: $color-error;
    }
  }

  &__divider {
    height: 1px;
    background-color: $color-divider;
    margin: $spacing-md 0;
  }

  &__link {
    background: none;
    border: none;
    color: $color-primary;
    text-decoration: underline;
    cursor: pointer;
    font-size: $font-size-body-small;
    margin-left: $spacing-xs;

    &:hover {
      color: $color-primary-dark;
    }
  }
}

.error-message {
  color: $color-error;
  font-size: $font-size-body-small;
  margin-top: $spacing-xs;
}
</style>

