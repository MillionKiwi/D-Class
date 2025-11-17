<template>
  <AppLayout hide-nav>
    <div class="register-info-page">
      <div class="register-container">
        <div class="progress-indicator">
          <span class="progress-text">2/3</span>
        </div>

        <h2 class="page-title">회원가입</h2>

        <form @submit.prevent="handleSubmit" class="register-form">
          <Input
            v-model="form.email"
            type="email"
            label="이메일"
            placeholder="이메일을 입력하세요"
            :error="errors.email"
            required
            @blur="checkEmailAvailability"
          />

          <Input
            v-model="form.password"
            type="password"
            label="비밀번호"
            placeholder="8자 이상, 영문/숫자/특수문자 포함"
            :error="errors.password"
            :hint="passwordStrengthText"
            required
          />

          <Input
            v-model="form.passwordConfirm"
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력하세요"
            :error="errors.passwordConfirm"
            required
          />

          <Input
            v-model="form.name"
            type="text"
            :label="role === 'instructor' ? '이름' : '담당자명'"
            placeholder="이름을 입력하세요"
            :error="errors.name"
            required
          />

          <Input
            v-model="form.phone"
            type="tel"
            label="연락처"
            placeholder="010-1234-5678"
            :error="errors.phone"
            required
          />

          <!-- 강사 전용 -->
          <template v-if="role === 'instructor'">
            <div class="input-wrapper">
              <label class="input-label">
                전문 분야 <span class="required-star">*</span>
              </label>
              <div class="genre-chips">
                <span
                  v-for="genre in genreOptions"
                  :key="genre.value"
                  :class="['genre-chip', { selected: form.specialties.includes(genre.value) }]"
                  @click="toggleGenre(genre.value)"
                >
                  {{ genre.label }}
                </span>
              </div>
            </div>
          </template>

          <!-- 학원 전용 -->
          <template v-if="role === 'academy'">
            <Input
              v-model="form.academyName"
              type="text"
              label="학원명"
              placeholder="학원명을 입력하세요"
              :error="errors.academyName"
              required
            />

            <Input
              v-model="form.address"
              type="text"
              label="주소"
              placeholder="주소를 입력하세요"
              :error="errors.address"
              required
            />
          </template>

          <!-- 약관 동의 -->
          <div class="terms-section">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="terms.allAgreed"
                @change="handleAllAgreed"
              />
              <span>전체 동의</span>
            </label>

            <div class="terms-list">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="terms.service"
                  required
                />
                <span>
                  <a href="#" @click.prevent="showTermsModal('service')">이용약관</a> 동의
                  <span class="required-star">*</span>
                </span>
              </label>

              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="terms.privacy"
                  required
                />
                <span>
                  <a href="#" @click.prevent="showTermsModal('privacy')">개인정보처리방침</a> 동의
                  <span class="required-star">*</span>
                </span>
              </label>

              <label class="checkbox-label">
                <input type="checkbox" v-model="terms.marketing" />
                <span>마케팅 수신 동의 (선택)</span>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            :loading="authStore.loading"
            :disabled="!isFormValid"
            full-width
          >
            가입 완료
          </Button>
        </form>
      </div>

      <!-- 약관 모달 -->
      <Modal v-model:visible="showModal" :title="modalTitle" @close="showModal = false">
        <p>{{ modalContent }}</p>
        <template #footer>
          <Button @click="showModal = false">닫기</Button>
        </template>
      </Modal>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import Input from '@/components/common/Input.vue'
import Button from '@/components/common/Button.vue'
import Modal from '@/components/common/Modal.vue'
import { inject } from 'vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showToast = inject('toast')

const role = ref(route.query.role || 'instructor')

const genreOptions = [
  { value: 'ballet', label: '발레' },
  { value: 'contemporary', label: '현대무용' },
  { value: 'korean', label: '한국무용' },
  { value: 'jazz', label: '재즈댄스' },
  { value: 'hiphop', label: '힙합' },
  { value: 'ballroom', label: '볼룸댄스' },
  { value: 'etc', label: '기타' },
]

const form = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  phone: '',
  specialties: [],
  academyName: '',
  address: '',
})

const terms = reactive({
  allAgreed: false,
  service: false,
  privacy: false,
  marketing: false,
})

const errors = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  phone: '',
  academyName: '',
  address: '',
})

const showModal = ref(false)
const modalTitle = ref('')
const modalContent = ref('')

const passwordStrength = computed(() => {
  const pwd = form.password
  if (!pwd) return 0
  let strength = 0
  if (pwd.length >= 8) strength++
  if (/[a-zA-Z]/.test(pwd)) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++
  return strength
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0) return ''
  if (strength <= 2) return '약함'
  if (strength === 3) return '보통'
  return '강함'
})

const isFormValid = computed(() => {
  if (!form.email || !form.password || !form.passwordConfirm || !form.name || !form.phone) {
    return false
  }

  if (role.value === 'instructor' && form.specialties.length === 0) {
    return false
  }

  if (role.value === 'academy' && (!form.academyName || !form.address)) {
    return false
  }

  if (!terms.service || !terms.privacy) {
    return false
  }

  return true
})

const toggleGenre = (genre) => {
  const index = form.specialties.indexOf(genre)
  if (index > -1) {
    form.specialties.splice(index, 1)
  } else {
    form.specialties.push(genre)
  }
}

const handleAllAgreed = () => {
  terms.service = terms.allAgreed
  terms.privacy = terms.allAgreed
  terms.marketing = terms.allAgreed
}

const checkEmailAvailability = async () => {
  if (!form.email) return

  const result = await authStore.checkEmail(form.email)
  if (result.success) {
    if (!result.available) {
      errors.email = '이미 사용 중인 이메일입니다'
    } else {
      errors.email = ''
    }
  }
}

const showTermsModal = (type) => {
  if (type === 'service') {
    modalTitle.value = '이용약관'
    modalContent.value = '이용약관 내용...'
  } else if (type === 'privacy') {
    modalTitle.value = '개인정보처리방침'
    modalContent.value = '개인정보처리방침 내용...'
  }
  showModal.value = true
}

const validateForm = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })

  let isValid = true

  if (!form.email) {
    errors.email = '이메일을 입력해주세요'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '올바른 이메일 형식을 입력해주세요'
    isValid = false
  }

  if (!form.password) {
    errors.password = '비밀번호를 입력해주세요'
    isValid = false
  } else if (form.password.length < 8 || passwordStrength.value < 3) {
    errors.password = '8자 이상, 영문/숫자/특수문자 포함'
    isValid = false
  }

  if (form.password !== form.passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않습니다'
    isValid = false
  }

  if (!form.name) {
    errors.name = '이름을 입력해주세요'
    isValid = false
  }

  if (!form.phone) {
    errors.phone = '연락처를 입력해주세요'
    isValid = false
  }

  if (role.value === 'instructor' && form.specialties.length === 0) {
    isValid = false
  }

  if (role.value === 'academy') {
    if (!form.academyName) {
      errors.academyName = '학원명을 입력해주세요'
      isValid = false
    }
    if (!form.address) {
      errors.address = '주소를 입력해주세요'
      isValid = false
    }
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    showToast('필수 항목을 모두 입력해주세요', 'error')
    return
  }

  const formData = {
    role: role.value,
    email: form.email,
    password: form.password,
    name: form.name,
    phone: form.phone,
    terms_agreed: {
      service: terms.service,
      privacy: terms.privacy,
      marketing: terms.marketing,
    },
  }

  if (role.value === 'instructor') {
    formData.specialties = form.specialties
  } else {
    formData.academy_name = form.academyName
    formData.address = form.address
  }

  const result = await authStore.register(formData)

  if (result.success) {
    showToast('가입이 완료되었습니다', 'success')
    router.push('/login')
  } else {
    if (result.error.email) {
      errors.email = Array.isArray(result.error.email) ? result.error.email[0] : result.error.email
    }
    if (result.error.password) {
      errors.password = Array.isArray(result.error.password)
        ? result.error.password[0]
        : result.error.password
    }
    showToast('회원가입에 실패했습니다', 'error')
  }
}
</script>

<style scoped>
.register-info-page {
  min-height: 100vh;
  padding: var(--spacing-xl);
  background-color: var(--color-background);
}

.register-container {
  max-width: 500px;
  margin: 0 auto;
}

.progress-indicator {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.progress-text {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--spacing-3xl);
  color: var(--color-text-primary);
}

.genre-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.genre-chip {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: white;
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-full);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.genre-chip:hover {
  border-color: var(--color-primary);
}

.genre-chip.selected {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.terms-section {
  margin: var(--spacing-xl) 0;
  padding: var(--spacing-lg);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  font-size: 14px;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label a {
  color: var(--color-primary);
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

.terms-list {
  margin-left: var(--spacing-lg);
}

.required-star {
  color: var(--color-error);
  margin-left: 2px;
}
</style>
