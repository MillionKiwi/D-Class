<template>
  <AppLayout>
    <div class="favorites-page page-container">
      <div class="page-header">
        <h1 class="page-title">찜한 공고</h1>
      </div>

      <div v-if="loading && favorites.length === 0" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else-if="favorites.length > 0" class="favorites-list">
        <Card
          v-for="favorite in favorites"
          :key="favorite.id"
          class="favorite-card"
          clickable
          @click="$router.push(`/job-postings/${favorite.job_posting.id}`)"
        >
          <div class="favorite-header">
            <h3 class="academy-name">
              {{ favorite.job_posting.academy.name }}
              <Badge v-if="favorite.job_posting.academy.is_verified" variant="success" small>
                ✓
              </Badge>
            </h3>
            <button
              class="favorite-btn favorited"
              @click.stop="toggleFavorite(favorite.job_posting.id)"
            >
              ❤️
            </button>
          </div>

          <h4 class="posting-title">{{ favorite.job_posting.title }}</h4>

          <div class="posting-info">
            <span class="info-item">🎭 {{ formatGenres(favorite.job_posting.genres) }}</span>
            <span class="info-item">💰 {{ formatSalary(favorite.job_posting) }}</span>
          </div>

          <div class="favorite-footer">
            <span class="favorite-date">{{ formatDate(favorite.created_at) }}</span>
          </div>
        </Card>
      </div>

      <div v-else class="empty-state">
        <p>찜한 공고가 없습니다</p>
        <Button @click="$router.push('/home')">공고 둘러보기</Button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJobPostingStore } from '@/stores/jobPosting'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'
import { inject } from 'vue'
import { formatGenres } from '@/utils/formatters'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const jobPostingStore = useJobPostingStore()
const showToast = inject('toast', () => {})

const favorites = ref([])
const loading = ref(false)

const fetchFavorites = async () => {
  loading.value = true
  try {
    const response = await apiClient.get(API_ENDPOINTS.FAVORITES.LIST)
    favorites.value = response.data.results
  } catch (error) {
    showToast('찜한 공고를 불러오는데 실패했습니다', 'error')
  } finally {
    loading.value = false
  }
}

const toggleFavorite = async (jobPostingId) => {
  const result = await jobPostingStore.toggleFavorite(jobPostingId)
  if (result.success) {
    if (!result.is_favorited) {
      favorites.value = favorites.value.filter(
        (f) => f.job_posting.id !== jobPostingId
      )
      showToast('찜 목록에서 제거되었습니다', 'success')
    }
  }
}

const formatSalary = (posting) => {
  if (posting.salary_type === 'hourly') {
    return `${posting.salary.toLocaleString()}원/시간`
  } else {
    return `${posting.salary.toLocaleString()}원/월`
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

onMounted(() => {
  fetchFavorites()
})
</script>

<style scoped>
.favorites-page {
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

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.favorite-card {
  padding: var(--spacing-lg);
}

.favorite-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.academy-name {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.posting-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.posting-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.info-item {
  display: flex;
  align-items: center;
}

.favorite-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-divider);
}

.favorite-date {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
