<template>
  <div class="account-settings">
    <!-- 헤더 -->
    <div class="account-settings__header">
      <button class="back-button" @click="$router.back()">
        <ArrowLeftIcon :size="24" />
      </button>
      <h1>계정 설정</h1>
      <div style="width: 44px"></div>
    </div>

    <!-- 메뉴 목록 -->
    <div class="account-settings__content">
      <section class="account-settings__section">
        <div class="menu-list">
          <button class="menu-item" @click="showChangeEmailModal = true">
            <div class="menu-item__icon">
              <MailIcon :size="20" />
            </div>
            <span class="menu-item__text">이메일 변경</span>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </button>

          <button class="menu-item" @click="showChangePasswordModal = true">
            <div class="menu-item__icon">
              <KeyIcon :size="20" />
            </div>
            <span class="menu-item__text">비밀번호 변경</span>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </button>

          <button class="menu-item" @click="showChangePhoneModal = true">
            <div class="menu-item__icon">
              <PhoneIcon :size="20" />
            </div>
            <span class="menu-item__text">연락처 변경</span>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </button>

          <button class="menu-item danger" @click="showDeleteAccountModal = true">
            <div class="menu-item__icon danger">
              <TrashIcon :size="20" />
            </div>
            <span class="menu-item__text">회원 탈퇴</span>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </button>
        </div>
      </section>
    </div>

    <!-- 이메일 변경 모달 -->
    <BaseModal
      v-model:isOpen="showChangeEmailModal"
      title="이메일 변경"
      @confirm="handleChangeEmail"
      @cancel="showChangeEmailModal = false"
    >
      <div class="modal-form">
        <BaseInput
          v-model="emailForm.newEmail"
          type="email"
          label="새 이메일"
          placeholder="새 이메일을 입력하세요"
          required
        />
        <BaseInput
          v-model="emailForm.password"
          type="password"
          label="비밀번호 확인"
          placeholder="현재 비밀번호를 입력하세요"
          required
        />
      </div>
    </BaseModal>

    <!-- 비밀번호 변경 모달 -->
    <BaseModal
      v-model:isOpen="showChangePasswordModal"
      title="비밀번호 변경"
      @confirm="handleChangePassword"
      @cancel="showChangePasswordModal = false"
    >
      <div class="modal-form">
        <BaseInput
          v-model="passwordForm.currentPassword"
          type="password"
          label="현재 비밀번호"
          placeholder="현재 비밀번호를 입력하세요"
          required
        />
        <BaseInput
          v-model="passwordForm.newPassword"
          type="password"
          label="새 비밀번호"
          placeholder="새 비밀번호를 입력하세요 (8자 이상)"
          required
          hint="8자 이상, 영문/숫자/특수문자 포함"
        />
        <BaseInput
          v-model="passwordForm.confirmPassword"
          type="password"
          label="새 비밀번호 확인"
          placeholder="새 비밀번호를 다시 입력하세요"
          required
        />
      </div>
    </BaseModal>

    <!-- 연락처 변경 모달 -->
    <BaseModal
      v-model:isOpen="showChangePhoneModal"
      title="연락처 변경"
      @confirm="handleChangePhone"
      @cancel="showChangePhoneModal = false"
    >
      <div class="modal-form">
        <BaseInput
          v-model="phoneForm.newPhone"
          type="tel"
          label="새 연락처"
          placeholder="010-1234-5678"
          required
        />
        <BaseInput
          v-model="phoneForm.password"
          type="password"
          label="비밀번호 확인"
          placeholder="현재 비밀번호를 입력하세요"
          required
        />
      </div>
    </BaseModal>

    <!-- 회원 탈퇴 모달 -->
    <BaseModal
      v-model:isOpen="showDeleteAccountModal"
      title="회원 탈퇴"
      confirmText="탈퇴"
      @confirm="handleDeleteAccount"
      @cancel="showDeleteAccountModal = false"
    >
      <div class="delete-warning">
        <p><strong>정말 탈퇴하시겠습니까?</strong></p>
        <ul>
          <li>모든 데이터가 삭제되며 복구할 수 없습니다</li>
          <li>작성한 공고, 지원 내역, 리뷰가 모두 삭제됩니다</li>
          <li>삭제된 정보는 복구할 수 없습니다</li>
        </ul>
      </div>
      <div class="modal-form">
        <BaseInput
          v-model="deleteForm.password"
          type="password"
          label="비밀번호 확인"
          placeholder="비밀번호를 입력하여 확인하세요"
          required
        />
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft as ArrowLeftIcon,
  Mail as MailIcon,
  Key as KeyIcon,
  Phone as PhoneIcon,
  Trash as TrashIcon,
  ChevronRight as ChevronRightIcon,
  User as UserIcon,
  Bell as BellIcon,
  HelpCircle as HelpCircleIcon,
} from 'lucide-vue-next'
import { BaseInput, BaseModal } from '@/components/common'
import { useAuthStore } from '@/stores'
import { validateEmail, validatePassword, validatePhoneNumber } from '@/utils/validators'
import { useToast } from '@/composables/useToast'
import { apiClient } from '@/api'

const router = useRouter()
const authStore = useAuthStore()
const { success, error: showError } = useToast()

const showChangeEmailModal = ref(false)
const showChangePasswordModal = ref(false)
const showChangePhoneModal = ref(false)
const showDeleteAccountModal = ref(false)

const emailForm = reactive({
  newEmail: '',
  password: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const phoneForm = reactive({
  newPhone: '',
  password: '',
})

const deleteForm = reactive({
  password: '',
})

const handleChangeEmail = async () => {
  if (!validateEmail(emailForm.newEmail)) {
    showError('올바른 이메일 형식을 입력해주세요')
    return
  }

  try {
    await apiClient.put('/user/email', emailForm)
    success('이메일이 변경되었습니다.')
    showChangeEmailModal.value = false
    emailForm.newEmail = ''
    emailForm.password = ''
  } catch (err) {
    showError(err.response?.data?.message || '이메일 변경에 실패했습니다.')
  }
}

const handleChangePassword = async () => {
  if (!validatePassword(passwordForm.newPassword)) {
    showError('비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다')
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showError('새 비밀번호가 일치하지 않습니다')
    return
  }

  try {
    await apiClient.put('/user/password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
    success('비밀번호가 변경되었습니다.')
    showChangePasswordModal.value = false
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err) {
    showError(err.response?.data?.message || '비밀번호 변경에 실패했습니다.')
  }
}

const handleChangePhone = async () => {
  if (!validatePhoneNumber(phoneForm.newPhone)) {
    showError('올바른 연락처 형식을 입력해주세요')
    return
  }

  try {
    await apiClient.put('/user/phone', phoneForm)
    success('연락처가 변경되었습니다.')
    showChangePhoneModal.value = false
    phoneForm.newPhone = ''
    phoneForm.password = ''
  } catch (err) {
    showError(err.response?.data?.message || '연락처 변경에 실패했습니다.')
  }
}

const handleDeleteAccount = async () => {
  if (!deleteForm.password) {
    showError('비밀번호를 입력해주세요')
    return
  }

  try {
    await apiClient.delete('/user/account', {
      data: { password: deleteForm.password },
    })
    success('회원 탈퇴가 완료되었습니다.')
    await authStore.logout()
    router.push('/login')
  } catch (err) {
    showError(err.response?.data?.message || '회원 탈퇴에 실패했습니다.')
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.settings {
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
    overflow: hidden;
  }
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  border-bottom: 1px solid $color-divider;
  text-decoration: none;
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  width: 100%;
  cursor: pointer;
  transition: all $transition-fast;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: $color-background;
  }

  &.danger {
    .menu-item__text {
      color: $color-error;
    }
  }

  &__icon {
    @include flex-center;
    width: 40px;
    height: 40px;
    background-color: $color-background;
    border-radius: $radius-md;
    color: $color-primary;
    flex-shrink: 0;

    &.danger {
      background-color: rgba($color-error, 0.1);
      color: $color-error;
    }
  }

  &__text {
    flex: 1;
    font-size: $font-size-body;
    color: $color-text-primary;
    text-align: left;
  }

  &__arrow {
    color: $color-text-secondary;
    flex-shrink: 0;
  }
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.delete-warning {
  background-color: rgba($color-error, 0.05);
  border: 1px solid rgba($color-error, 0.2);
  border-radius: $radius-md;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;

  p {
    color: $color-error;
    font-weight: $font-weight-semibold;
    margin: 0 0 $spacing-md 0;
  }

  ul {
    margin: 0;
    padding-left: $spacing-xl;

    li {
      font-size: $font-size-body-small;
      color: $color-text-primary;
      margin-bottom: $spacing-xs;
    }
  }
}
</style>

