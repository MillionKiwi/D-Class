<template>
  <AppLayout hide-nav>
    <div class="not-found-page">
      <div class="not-found-content">
        <div class="not-found-icon">404</div>
        <h1 class="not-found-title">페이지를 찾을 수 없습니다</h1>
        <p class="not-found-message">요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
        <Button @click="$router.push('/')">홈으로 돌아가기</Button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import Button from '@/components/common/Button.vue'
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background-color: var(--color-background);
}

.not-found-content {
  text-align: center;
  max-width: 500px;
}

.not-found-icon {
  font-size: 120px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-xl);
}

.not-found-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.not-found-message {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-3xl);
  line-height: 1.6;
}
</style>
