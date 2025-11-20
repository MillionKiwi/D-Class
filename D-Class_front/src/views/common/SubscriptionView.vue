<template>
  <AppLayout>
    <div class="subscription-page page-container">
      <div class="page-header">
        <h1 class="page-title">구독 요금제</h1>
        <p class="page-subtitle">나에게 맞는 요금제를 선택하세요</p>
      </div>

      <div class="subscription-content">
        <div v-if="userRole === 'academy'" class="plans-section">
          <div class="plan-card">
            <div class="plan-header">
              <h3 class="plan-name">Studio Light</h3>
              <div class="plan-price">
                <span class="price">₩3,000</span>
                <span class="period">/ 1일</span>
              </div>
            </div>
            <ul class="plan-features">
              <li>단기 공고 등록</li>
              <li>급한 대강/채용 시 사용</li>
            </ul>
            <Button variant="secondary" full-width class="plan-button" disabled>
              준비 중
            </Button>
          </div>

          <div class="plan-card featured">
            <div class="plan-badge">인기</div>
            <div class="plan-header">
              <h3 class="plan-name">Studio Prime</h3>
              <div class="plan-price">
                <span class="price">₩19,000</span>
                <span class="period">/ 1개월</span>
              </div>
            </div>
            <ul class="plan-features">
              <li>공고 무제한</li>
              <li>지원자 열람 무제한</li>
            </ul>
            <Button full-width class="plan-button" disabled>
              준비 중
            </Button>
          </div>

          <div class="plan-card">
            <div class="plan-header">
              <h3 class="plan-name">Studio Prestige</h3>
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
            <Button variant="secondary" full-width class="plan-button" disabled>
              준비 중
            </Button>
          </div>
        </div>

        <div v-else class="plans-section">
          <div class="plan-card">
            <div class="plan-header">
              <h3 class="plan-name">Artist Day</h3>
              <div class="plan-price">
                <span class="price">₩1,900</span>
                <span class="period">/ 1일</span>
              </div>
            </div>
            <ul class="plan-features">
              <li>프로필 노출</li>
              <li>지원 가능</li>
            </ul>
            <Button variant="secondary" full-width class="plan-button" disabled>
              준비 중
            </Button>
          </div>

          <div class="plan-card featured">
            <div class="plan-badge">인기</div>
            <div class="plan-header">
              <h3 class="plan-name">Artist Monthly</h3>
              <div class="plan-price">
                <span class="price">₩12,900</span>
                <span class="period">/ 1개월</span>
              </div>
            </div>
            <ul class="plan-features">
              <li>무제한 지원</li>
              <li>프로필 상단 노출 (2회)</li>
            </ul>
            <Button full-width class="plan-button" disabled>
              준비 중
            </Button>
          </div>

          <div class="plan-card">
            <div class="plan-header">
              <h3 class="plan-name">Artist Annual pro</h3>
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
            <Button variant="secondary" full-width class="plan-button" disabled>
              준비 중
            </Button>
          </div>
        </div>

        <div class="notice card">
          <h4>안내사항</h4>
          <ul>
            <li>구독 서비스는 준비 중입니다. 곧 만나보실 수 있습니다.</li>
            <li>구독 관련 문의는 고객센터로 연락주세요.</li>
          </ul>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'

const authStore = useAuthStore()

const userRole = computed(() => authStore.user?.role)

onMounted(() => {
  if (!authStore.user) {
    authStore.fetchCurrentUser()
  }
})
</script>

<style scoped>
.subscription-page {
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.subscription-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.plans-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

.plan-card {
  position: relative;
  border: 2px solid var(--color-divider);
  border-radius: 12px;
  padding: var(--spacing-xl);
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
  right: var(--spacing-xl);
  background-color: var(--color-primary);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.plan-header {
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.plan-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--spacing-xs);
}

.price {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary);
}

.period {
  font-size: 16px;
  color: var(--color-text-secondary);
}

.plan-discount {
  margin-top: var(--spacing-sm);
  font-size: 14px;
  color: var(--color-primary);
  font-weight: 600;
  text-align: center;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-lg) 0;
  min-height: 120px;
}

.plan-features li {
  padding: var(--spacing-sm) 0;
  padding-left: var(--spacing-lg);
  position: relative;
  color: var(--color-text-primary);
  font-size: 15px;
}

.plan-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: 700;
  font-size: 18px;
}

.plan-button {
  margin-top: var(--spacing-md);
}

.notice {
  padding: var(--spacing-lg);
}

.notice h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.notice ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notice li {
  padding: var(--spacing-xs) 0;
  padding-left: var(--spacing-md);
  position: relative;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.notice li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-text-secondary);
}

@media (min-width: 768px) {
  .plans-section {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

