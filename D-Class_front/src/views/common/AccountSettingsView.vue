<template>
  <AppLayout>
    <div class="account-settings-page page-container">
      <div class="page-header">
        <h1 class="page-title">계정 설정</h1>
      </div>

      <div class="settings-content">
        <div class="settings-section card">
          <router-link to="/settings/email" class="settings-item">
            <span>이메일 변경</span>
            <span>→</span>
          </router-link>
          <router-link to="/settings/password" class="settings-item">
            <span>비밀번호 변경</span>
            <span>→</span>
          </router-link>
          <router-link to="/settings/phone" class="settings-item">
            <span>연락처 변경</span>
            <span>→</span>
          </router-link>
        </div>

        <div class="settings-section card danger-section">
          <button class="settings-item danger-item" @click="showWithdrawModal = true">
            <span>회원 탈퇴</span>
            <span>→</span>
          </button>
        </div>
      </div>

      <!-- 회원 탈퇴 확인 모달 -->
      <Modal v-model:visible="showWithdrawModal" title="회원 탈퇴" @close="showWithdrawModal = false">
        <div class="withdraw-warning">
          <p><strong>정말 탈퇴하시겠습니까?</strong></p>
          <p>모든 데이터가 삭제되며 복구할 수 없습니다.</p>
        </div>
        <Input
          v-model="withdrawPassword"
          type="password"
          label="비밀번호 확인"
          placeholder="비밀번호를 입력하세요"
          :error="errors.password"
        />
        <template #footer>
          <Button variant="secondary" @click="showWithdrawModal = false">취소</Button>
          <Button variant="error" @click="handleWithdraw" :loading="withdrawing">
            탈퇴하기
          </Button>
        </template>
      </Modal>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Input from '@/components/common/Input.vue'
import Modal from '@/components/common/Modal.vue'

const router = useRouter()
const authStore = useAuthStore()
const showToast = inject('toast')

const showWithdrawModal = ref(false)
const withdrawPassword = ref('')
const withdrawing = ref(false)
const errors = reactive({
  password: '',
})

const handleWithdraw = async () => {
  if (!withdrawPassword.value) {
    errors.password = '비밀번호를 입력해주세요'
    return
  }

  withdrawing.value = true
  try {
    await apiClient.delete(API_ENDPOINTS.USERS.ME, {
      data: { password: withdrawPassword.value },
    })
    showToast('회원 탈퇴가 완료되었습니다', 'success')
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    if (error.response?.status === 400) {
      errors.password = '비밀번호가 올바르지 않습니다'
    } else {
      showToast('회원 탈퇴에 실패했습니다', 'error')
    }
  } finally {
    withdrawing.value = false
  }
}
</script>

<style scoped>
.account-settings-page {
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.settings-section {
  padding: 0;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  text-decoration: none;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-divider);
  transition: background-color 0.2s;
  cursor: pointer;
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  width: 100%;
  text-align: left;
  font-size: 16px;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:hover {
  background-color: var(--color-background);
}

.danger-section {
  border: 1px solid var(--color-error);
}

.danger-item {
  color: var(--color-error);
}

.withdraw-warning {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: rgba(255, 182, 193, 0.1);
  border-radius: var(--radius-sm);
}

.withdraw-warning p {
  margin-bottom: var(--spacing-sm);
  font-size: 14px;
  line-height: 1.6;
}

.withdraw-warning strong {
  color: var(--color-error);
}
</style>
