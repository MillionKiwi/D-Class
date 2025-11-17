<template>
  <AppLayout hide-nav>
    <div class="support-page">
      <div class="support-header">
        <button class="back-btn" @click="$router.back()">←</button>
        <h1 class="page-title">고객센터</h1>
        <div style="width: 40px"></div>
      </div>

      <div class="support-content">
        <div class="support-section card">
          <h3>자주 묻는 질문</h3>
          <p>궁금하신 사항을 빠르게 확인하세요</p>
          <Button variant="secondary" full-width @click="$router.push('/faq')">
            FAQ 보기
          </Button>
        </div>

        <div class="support-section card">
          <h3>1:1 문의하기</h3>
          <p>문의사항을 남겨주시면 빠르게 답변드리겠습니다</p>
          <Button full-width @click="showInquiryModal = true">문의하기</Button>
        </div>

        <div class="support-section card">
          <h3>운영 시간</h3>
          <div class="hours-info">
            <p>평일: 09:00 - 18:00</p>
            <p>주말 및 공휴일: 휴무</p>
          </div>
        </div>

        <div class="support-section card">
          <h3>연락처</h3>
          <div class="contact-info">
            <p>이메일: support@d-class.com</p>
            <p>전화: 02-1234-5678</p>
          </div>
        </div>
      </div>

      <!-- 문의하기 모달 -->
      <Modal v-model:visible="showInquiryModal" title="1:1 문의하기" @close="showInquiryModal = false">
        <form @submit.prevent="handleSubmit" class="inquiry-form">
          <div class="input-wrapper">
            <label class="input-label">
              문의 유형 <span class="required-star">*</span>
            </label>
            <select v-model="inquiryForm.category" class="select-field" required>
              <option value="">선택하세요</option>
              <option value="account">계정 관련</option>
              <option value="service">서비스 이용</option>
              <option value="payment">결제 관련</option>
              <option value="technical">기술 지원</option>
              <option value="etc">기타</option>
            </select>
          </div>

          <Input
            v-model="inquiryForm.title"
            label="제목"
            placeholder="문의 제목을 입력하세요"
            :error="errors.title"
            required
          />

          <div class="input-wrapper">
            <label class="input-label">
              문의 내용 <span class="required-star">*</span>
            </label>
            <textarea
              v-model="inquiryForm.content"
              class="textarea-field"
              placeholder="문의 내용을 입력하세요"
              rows="6"
              required
            ></textarea>
          </div>

          <template #footer>
            <Button variant="secondary" @click="showInquiryModal = false">취소</Button>
            <Button type="submit" :loading="submitting">등록</Button>
          </template>
        </form>
      </Modal>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Input from '@/components/common/Input.vue'
import Modal from '@/components/common/Modal.vue'

const router = useRouter()
const showToast = inject('toast')

const showInquiryModal = ref(false)
const submitting = ref(false)

const inquiryForm = reactive({
  category: '',
  title: '',
  content: '',
})

const errors = reactive({
  title: '',
})

const handleSubmit = async () => {
  submitting.value = true
  try {
    const response = await apiClient.post(API_ENDPOINTS.COMMON.INQUIRIES, inquiryForm)
    showToast('문의가 등록되었습니다', 'success')
    showInquiryModal.value = false
    // 폼 초기화
    inquiryForm.category = ''
    inquiryForm.title = ''
    inquiryForm.content = ''
  } catch (error) {
    showToast('문의 등록에 실패했습니다', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.support-page {
  min-height: 100vh;
  background-color: var(--color-background);
}

.support-header {
  position: sticky;
  top: 0;
  background-color: var(--color-card);
  border-bottom: 1px solid var(--color-divider);
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-primary);
  padding: var(--spacing-sm);
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.support-content {
  padding: var(--spacing-lg);
}

.support-section {
  margin-bottom: var(--spacing-lg);
}

.support-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.support-section > p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.hours-info,
.contact-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.hours-info p,
.contact-info p {
  font-size: 14px;
  color: var(--color-text-primary);
}

.inquiry-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.select-field {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-sm);
  font-size: 16px;
  background-color: white;
  min-height: 48px;
}

.select-field:focus {
  outline: none;
  border-color: var(--color-primary);
  border-width: 2px;
}

.textarea-field {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 150px;
}

.textarea-field:focus {
  outline: none;
  border-color: var(--color-primary);
  border-width: 2px;
}
</style>
