<template>
  <AppLayout hide-nav>
    <div class="faq-page">
      <div class="faq-header">
        <button class="back-btn" @click="$router.back()">←</button>
        <h1 class="page-title">자주 묻는 질문</h1>
        <div style="width: 40px"></div>
      </div>

      <div v-if="loading && faqs.length === 0" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else class="faq-content">
        <div
          v-for="category in faqs"
          :key="category.id"
          class="faq-category"
        >
          <h2 class="category-title">{{ category.name }}</h2>
          <div class="faq-items">
            <div
              v-for="faq in category.faqs"
              :key="faq.id"
              class="faq-item"
              :class="{ open: openFaqs.includes(faq.id) }"
            >
              <button class="faq-question" @click="toggleFaq(faq.id)">
                <span>{{ faq.question }}</span>
                <span class="faq-icon">{{ openFaqs.includes(faq.id) ? '−' : '+' }}</span>
              </button>
              <div v-if="openFaqs.includes(faq.id)" class="faq-answer">
                <p>{{ faq.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const faqs = ref([])
const openFaqs = ref([])
const loading = ref(false)

const toggleFaq = (id) => {
  const index = openFaqs.value.indexOf(id)
  if (index > -1) {
    openFaqs.value.splice(index, 1)
  } else {
    openFaqs.value.push(id)
  }
}

const fetchFAQ = async () => {
  loading.value = true
  try {
    const response = await apiClient.get(API_ENDPOINTS.COMMON.FAQ)
    faqs.value = response.data.categories || []
  } catch (error) {
    faqs.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchFAQ()
})
</script>

<style scoped>
.faq-page {
  min-height: 100vh;
  background-color: var(--color-background);
}

.faq-header {
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

.faq-content {
  padding: var(--spacing-lg);
}

.faq-category {
  margin-bottom: var(--spacing-3xl);
}

.category-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-primary);
}

.faq-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.faq-item {
  background-color: var(--color-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all 0.2s;
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: none;
  border: none;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color 0.2s;
}

.faq-question:hover {
  background-color: var(--color-background);
}

.faq-icon {
  font-size: 24px;
  color: var(--color-primary);
  font-weight: 300;
  min-width: 24px;
  text-align: center;
}

.faq-answer {
  padding: 0 var(--spacing-lg) var(--spacing-lg);
  border-top: 1px solid var(--color-divider);
  animation: slide-down 0.2s ease-out;
}

.faq-answer p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-primary);
  margin-top: var(--spacing-md);
  white-space: pre-wrap;
}

@keyframes slide-down {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
