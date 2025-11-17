<template>
  <AppLayout show-search @search="handleSearch">
    <div class="home-page page-container">
      <!-- 필터 영역 -->
      <div class="filters-section">
        <div class="filter-group">
          <label class="filter-label">지역</label>
          <div class="filter-chips">
            <span
              v-for="region in regions"
              :key="region.value"
              :class="['filter-chip', { selected: filters.region === region.value }]"
              @click="filters.region = region.value"
            >
              {{ region.label }}
            </span>
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">장르</label>
          <div class="filter-chips">
            <span
              v-for="genre in genreOptions"
              :key="genre.value"
              :class="['filter-chip', { selected: filters.genres?.includes(genre.value) }]"
              @click="toggleGenre(genre.value)"
            >
              {{ genre.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- 정렬 및 뷰 전환 -->
      <div class="controls-section">
        <select v-model="ordering" class="sort-select">
          <option value="-created_at">최신순</option>
          <option value="-salary">급여 높은순</option>
        </select>
      </div>

      <!-- 공고 목록 -->
      <div v-if="loading && postings.length === 0" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else-if="postings.length > 0" class="postings-list">
        <Card
          v-for="posting in postings"
          :key="posting.id"
          class="posting-card"
          clickable
          @click="$router.push(`/job-postings/${posting.id}`)"
        >
          <div class="posting-header">
            <div class="academy-info">
              <h3 class="academy-name">
                {{ posting.academy.name }}
                <Badge v-if="posting.academy.is_verified" variant="success" small>
                  ✓
                </Badge>
              </h3>
              <Badge v-if="posting.is_applied" variant="info">지원 완료</Badge>
            </div>
            <button
              :class="['favorite-btn', { favorited: posting.is_favorited }]"
              @click.stop="toggleFavorite(posting.id)"
            >
              ♡
            </button>
          </div>

          <h4 class="posting-title">{{ posting.title }}</h4>

          <div class="posting-info">
            <span class="info-item">
              📍 {{ getRegionLabel(posting.region) }} / {{ posting.district }}
            </span>
            <span class="info-item">🎭 {{ posting.genres.join(', ') }}</span>
            <span class="info-item">💰 {{ formatSalary(posting) }}</span>
          </div>

          <div class="posting-footer">
            <span class="posting-date">{{ formatDate(posting.created_at) }}</span>
          </div>
        </Card>

        <div v-if="pagination.next" class="load-more">
          <Button @click="loadMore" :loading="loading">더 보기</Button>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>조건에 맞는 공고가 없습니다</p>
        <Button @click="resetFilters">필터 초기화</Button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useJobPostingStore } from '@/stores/jobPosting'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const jobPostingStore = useJobPostingStore()
const showToast = inject('toast')

const regions = [
  { value: 'seoul', label: '서울' },
  { value: 'gyeonggi', label: '경기' },
  { value: 'incheon', label: '인천' },
  { value: 'busan', label: '부산' },
  { value: 'etc', label: '기타' },
]

const genreOptions = [
  { value: 'ballet', label: '발레' },
  { value: 'contemporary', label: '현대무용' },
  { value: 'korean', label: '한국무용' },
  { value: 'jazz', label: '재즈댄스' },
  { value: 'hiphop', label: '힙합' },
  { value: 'ballroom', label: '볼룸댄스' },
]

const filters = reactive({
  region: '',
  genres: [],
})

const ordering = ref('-created_at')

const { postings, loading, pagination } = jobPostingStore

const fetchPostings = async () => {
  const params = {
    ordering: ordering.value,
    page: 1,
  }

  if (filters.region) {
    params.region = filters.region
  }

  if (filters.genres.length > 0) {
    params.genre = filters.genres.join(',')
  }

  const result = await jobPostingStore.fetchPostings(params)
  if (!result.success) {
    showToast('공고를 불러오는데 실패했습니다', 'error')
  }
}

const loadMore = async () => {
  if (!pagination.next || loading.value) return

  // 다음 페이지 로드
  const result = await jobPostingStore.fetchPostings({
    page: getPageFromUrl(pagination.next),
  })

  if (result.success) {
    // postings는 이미 스토어에서 업데이트됨
  }
}

const getPageFromUrl = (url) => {
  const match = url.match(/page=(\d+)/)
  return match ? parseInt(match[1]) : 1
}

const toggleGenre = (genre) => {
  const index = filters.genres.indexOf(genre)
  if (index > -1) {
    filters.genres.splice(index, 1)
  } else {
    filters.genres.push(genre)
  }
}

const toggleFavorite = async (postingId) => {
  const result = await jobPostingStore.toggleFavorite(postingId)
  if (result.success) {
    // 공고 목록 새로고침
    await fetchPostings()
  }
}

const resetFilters = () => {
  filters.region = ''
  filters.genres = []
  fetchPostings()
}

const handleSearch = () => {
  router.push('/search')
}

const getRegionLabel = (value) => {
  const region = regions.find((r) => r.value === value)
  return region ? region.label : value
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
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 7) return `${days}일 전`
  return date.toLocaleDateString('ko-KR')
}

watch([filters, ordering], () => {
  fetchPostings()
})

onMounted(() => {
  fetchPostings()
})
</script>

<style scoped>
.home-page {
  padding: var(--spacing-lg);
}

.filters-section {
  margin-bottom: var(--spacing-xl);
}

.filter-group {
  margin-bottom: var(--spacing-lg);
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.filter-chips {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.filter-chip {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: white;
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-full);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  border-color: var(--color-primary);
}

.filter-chip.selected {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.controls-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-lg);
}

.sort-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-sm);
  font-size: 14px;
  background-color: white;
}

.postings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.posting-card {
  padding: var(--spacing-lg);
}

.posting-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.academy-info {
  flex: 1;
}

.academy-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.posting-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
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

.posting-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-divider);
  font-size: 12px;
  color: var(--color-text-secondary);
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color 0.2s;
}

.favorite-btn.favorited {
  color: var(--color-error);
}

.load-more {
  text-align: center;
  margin-top: var(--spacing-xl);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
