<template>
  <Modal :visible="visible" title="구독 요금제" :closeOnOverlay="false" @close="handleClose">
    <div class="subscription-plans">
      <div v-if="userRole === 'academy'" class="plans-section">
        <h3 class="section-title">학원 요금제</h3>
        <div class="plan-card">
          <div class="plan-header">
            <h4 class="plan-name">Studio Light</h4>
            <div class="plan-price">
              <span class="price">₩3,000</span>
              <span class="period">/ 1일</span>
            </div>
          </div>
          <ul class="plan-features">
            <li>단기 공고 등록</li>
            <li>급한 대강/채용 시 사용</li>
          </ul>
        </div>

        <div class="plan-card featured">
          <div class="plan-badge">인기</div>
          <div class="plan-header">
            <h4 class="plan-name">Studio Prime</h4>
            <div class="plan-price">
              <span class="price">₩19,000</span>
              <span class="period">/ 1개월</span>
            </div>
          </div>
          <ul class="plan-features">
            <li>공고 무제한</li>
            <li>지원자 열람 무제한</li>
          </ul>
        </div>

        <div class="plan-card">
          <div class="plan-header">
            <h4 class="plan-name">Studio Prestige</h4>
            <div class="plan-price">
              <span class="price">₩159,000</span>
              <span class="period">/ 12개월</span>
            </div>
            <div class="plan-discount">월 ₩13,250 (33% 할인)</div>
          </div>
          <ul class="plan-features">
            <li>공고 무제한</li>
            <li>지원자 열람 무제한</li>
            <li>기본 상단 노출</li>
            <li>노출권 10회 추가 제공</li>
          </ul>
        </div>
      </div>

      <div v-else class="plans-section">
        <h3 class="section-title">강사 요금제</h3>
        <div class="plan-card">
          <div class="plan-header">
            <h4 class="plan-name">Artist Day</h4>
            <div class="plan-price">
              <span class="price">₩1,900</span>
              <span class="period">/ 1일</span>
            </div>
          </div>
          <ul class="plan-features">
            <li>프로필 노출</li>
            <li>지원 가능</li>
          </ul>
        </div>

        <div class="plan-card featured">
          <div class="plan-badge">인기</div>
          <div class="plan-header">
            <h4 class="plan-name">Artist Monthly</h4>
            <div class="plan-price">
              <span class="price">₩12,900</span>
              <span class="period">/ 1개월</span>
            </div>
          </div>
          <ul class="plan-features">
            <li>무제한 지원</li>
            <li>프로필 상단 노출 (2회)</li>
          </ul>
        </div>

        <div class="plan-card">
          <div class="plan-header">
            <h4 class="plan-name">Artist Annual pro</h4>
            <div class="plan-price">
              <span class="price">₩99,000</span>
              <span class="period">/ 12개월</span>
            </div>
            <div class="plan-discount">월 ₩8,250 (36% 할인)</div>
          </div>
          <ul class="plan-features">
            <li>무제한 지원</li>
            <li>프로필 상단 노출</li>
            <li>연간 프로필 BOOST 10회 추가 제공</li>
          </ul>
        </div>
      </div>

      <div class="notice">
        <p>※ 구독 서비스는 준비 중입니다. 곧 만나보실 수 있습니다.</p>
      </div>
    </div>
    <template #footer>
      <Button variant="secondary" @click="handleClose">나중에</Button>
      <Button @click="goToSubscription">구독 페이지로 이동</Button>
    </template>
  </Modal>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Modal from '@/components/common/Modal.vue'
import Button from '@/components/common/Button.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const router = useRouter()
const authStore = useAuthStore()

const userRole = computed(() => authStore.user?.role)

const handleClose = () => {
  // 로컬 스토리지에 팝업을 본 것으로 표시
  localStorage.setItem('subscription_modal_seen', 'true')
  emit('close')
}

const goToSubscription = () => {
  handleClose()
  router.push('/subscription')
}
</script>

<style scoped>
.subscription-plans {
  max-height: 60vh;
  overflow-y: auto;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

.plans-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.plan-card {
  position: relative;
  border: 2px solid var(--color-divider);
  border-radius: 12px;
  padding: var(--spacing-lg);
  background-color: var(--color-card);
  transition: all 0.2s;
}

.plan-card.featured {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, rgba(167, 199, 231, 0.1) 0%, rgba(167, 199, 231, 0.05) 100%);
}

.plan-badge {
  position: absolute;
  top: -12px;
  right: var(--spacing-lg);
  background-color: var(--color-primary);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.plan-header {
  margin-bottom: var(--spacing-md);
}

.plan-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
}

.period {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.plan-discount {
  margin-top: var(--spacing-xs);
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 600;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-features li {
  padding: var(--spacing-xs) 0;
  padding-left: var(--spacing-md);
  position: relative;
  color: var(--color-text-primary);
  font-size: 14px;
}

.plan-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: 700;
}

.notice {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-divider);
  border-radius: 8px;
  text-align: center;
}

.notice p {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>

