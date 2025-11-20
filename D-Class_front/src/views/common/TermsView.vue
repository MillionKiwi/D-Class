<template>
  <AppLayout hide-nav>
    <div class="terms-page">
      <div class="terms-header">
        <button class="back-btn" @click="$router.back()">←</button>
        <h1 class="page-title">{{ title }}</h1>
        <div style="width: 40px"></div>
      </div>

      <div v-if="loading && !content" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else class="terms-content">
        <div class="terms-info">
          <p class="version">버전: {{ version }}</p>
          <p class="updated">최종 수정일: {{ formatDate(updatedAt) }}</p>
        </div>
        <div class="terms-body" v-html="content"></div>
      </div>

      <div class="terms-footer">
        <Button full-width @click="$router.back()">닫기</Button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'
import AppLayout from '@/components/layout/AppLayout.vue'
import Button from '@/components/common/Button.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const termType = computed(() => route.meta.termType || route.query.type || 'service')

const title = computed(() => {
  return termType.value === 'service' ? '이용약관' : '개인정보처리방침'
})

const content = ref('')
const version = ref('')
const updatedAt = ref('')
const loading = ref(false)

const fetchTerms = async () => {
  loading.value = true
  try {
    const endpoint =
      termType.value === 'service'
        ? API_ENDPOINTS.COMMON.TERMS_SERVICE
        : API_ENDPOINTS.COMMON.TERMS_PRIVACY
    const response = await apiClient.get(endpoint)
    content.value = response.data.content || ''
    version.value = response.data.version || '1.0'
    updatedAt.value = response.data.updated_at || new Date().toISOString()
  } catch (error) {
    content.value = '약관 내용을 불러올 수 없습니다.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

onMounted(() => {
  fetchTerms()
})
</script>

<style scoped>
.terms-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
}

.terms-header {
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

.terms-content {
  flex: 1;
  padding: var(--spacing-xl);
  overflow-y: auto;
}

.terms-info {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-divider);
}

.version,
.updated {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.terms-body {
  font-size: 14px;
  line-height: 1.8;
  color: var(--color-text-primary);
  white-space: pre-wrap;
}

.terms-body :deep(h1),
.terms-body :deep(h2),
.terms-body :deep(h3) {
  font-weight: 600;
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
}

.terms-body :deep(p) {
  margin-bottom: var(--spacing-md);
}

.terms-body :deep(ul),
.terms-body :deep(ol) {
  margin-left: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.terms-footer {
  position: sticky;
  bottom: 0;
  background-color: var(--color-card);
  border-top: 1px solid var(--color-divider);
  padding: var(--spacing-lg);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex: 1;
}
</style>
