<template>
  <AppLayout hide-nav>
    <div class="register-role-page">
      <div class="register-container">
        <div class="progress-indicator">
          <span class="progress-text">1/3</span>
        </div>

        <h2 class="page-title">어떤 유형으로 가입하시나요?</h2>

        <div class="role-cards">
          <div
            :class="['role-card', { selected: selectedRole === 'instructor' }]"
            @click="selectedRole = 'instructor'"
          >
            <div class="role-icon">👤</div>
            <h3 class="role-title">강사</h3>
            <p class="role-description">강사로 활동하시나요?</p>
          </div>

          <div
            :class="['role-card', { selected: selectedRole === 'academy' }]"
            @click="selectedRole = 'academy'"
          >
            <div class="role-icon">🏢</div>
            <h3 class="role-title">학원</h3>
            <p class="role-description">학원을 운영하시나요?</p>
          </div>
        </div>

        <Button
          :disabled="!selectedRole"
          full-width
          @click="handleNext"
        >
          다음
        </Button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import Button from '@/components/common/Button.vue'

const router = useRouter()
const selectedRole = ref('')

const handleNext = () => {
  if (selectedRole.value) {
    router.push({
      name: 'RegisterInfo',
      query: { role: selectedRole.value },
    })
  }
}
</script>

<style scoped>
.register-role-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background-color: var(--color-background);
}

.register-container {
  width: 100%;
  max-width: 500px;
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

.role-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-3xl);
}

.role-card {
  background-color: var(--color-card);
  border: 2px solid var(--color-divider);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.role-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.role-card.selected {
  border-color: var(--color-primary);
  background-color: rgba(167, 199, 231, 0.1);
}

.role-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.role-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.role-description {
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
