<template>
  <AppLayout show-search :unread-count="unreadCount" @search="handleSearch">
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
        <div class="view-toggle">
          <button
            :class="['view-toggle-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
            title="리스트 뷰"
          >
            ☰
          </button>
          <button
            :class="['view-toggle-btn', { active: viewMode === 'map' }]"
            @click="viewMode = 'map'"
            title="지도 뷰"
          >
            🗺️
          </button>
        </div>
      </div>

      <!-- 리스트 뷰 -->
      <div v-if="viewMode === 'list'">
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

      <!-- 지도 뷰 -->
      <div v-else-if="viewMode === 'map'" class="map-view-container">
        <div class="map-placeholder card">
          <p>지도 뷰</p>
          <p class="map-placeholder-text">
            지도 기능은 Kakao Map API 연동이 필요합니다.
          </p>
          <p class="map-placeholder-text">
            현재 지도 영역에 공고 위치를 표시할 수 있습니다.
          </p>
          <!-- 
            TODO: Kakao Map API 연동
            1. Kakao Map API 키 설정 (환경 변수)
            2. 지도 컴포넌트 구현
            3. 공고 위치 핀 표시
            4. 클러스터링 기능
            5. 미니 카드 바텀시트
            6. 현재 위치에서 재검색 기능
          -->
          <div class="map-reload-btn">
            <Button variant="secondary" @click="reloadMap">
              현재 위치에서 재검색
            </Button>
          </div>
        </div>
        
        <!-- 미니 카드 바텀시트 -->
        <div v-if="selectedPosting" class="mini-card-bottom-sheet card">
          <div class="mini-card-header">
            <h4 class="mini-card-academy-name">
              {{ selectedPosting.academy.name }}
              <Badge v-if="selectedPosting.academy.is_verified" variant="success" small>
                ✓
              </Badge>
            </h4>
            <button class="close-btn" @click="selectedPosting = null">✕</button>
          </div>
          <h5 class="mini-card-title">{{ selectedPosting.title }}</h5>
          <div class="mini-card-info">
            <span class="mini-card-salary">💰 {{ formatSalary(selectedPosting) }}</span>
          </div>
          <div class="mini-card-actions">
            <button
              :class="['mini-card-favorite', { favorited: selectedPosting.is_favorited }]"
              @click.stop="toggleFavorite(selectedPosting.id)"
            >
              ♡
            </button>
            <Button
              small
              @click="$router.push(`/job-postings/${selectedPosting.id}`)"
            >
              상세보기
            </Button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useJobPostingStore } from '@/stores/jobPosting'
import { useNotificationStore } from '@/stores/notification'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const notificationStore = useNotificationStore()
const unreadCount = computed(() => notificationStore.unreadCount)

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
const viewMode = ref('list') // 'list' | 'map'
const selectedPosting = ref(null)

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

const reloadMap = async () => {
  // TODO: 현재 지도 영역 기준으로 공고 목록 재조회
  // const bounds = map.getBounds()
  // const result = await jobPostingStore.fetchMapPostings({
  //   north: bounds.getNorthEast().getLat(),
  //   south: bounds.getSouthWest().getLat(),
  //   east: bounds.getNorthEast().getLng(),
  //   west: bounds.getSouthWest().getLng(),
  // })
  showToast('현재 위치에서 재검색했습니다', 'info')
}

const handleSearch = () => {
  router.push({ name: 'Search' })
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

onMounted(async () => {
  await fetchPostings()
  // 알림 카운트 로드
  await notificationStore.fetchNotifications({ page_size: 1 })
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-md);
}

.sort-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-sm);
  font-size: 14px;
  background-color: white;
}

.view-toggle {
  display: flex;
  gap: var(--spacing-xs);
  background-color: white;
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs);
}

.view-toggle-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-secondary);
}

.view-toggle-btn:hover {
  background-color: var(--color-background);
}

.view-toggle-btn.active {
  background-color: var(--color-primary);
  color: white;
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

.map-view-container {
  position: relative;
  min-height: 500px;
}

.map-placeholder {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-3xl);
}

.map-placeholder-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: var(--spacing-sm);
}

.map-reload-btn {
  margin-top: var(--spacing-xl);
}

.mini-card-bottom-sheet {
  position: fixed;
  bottom: 80px;
  left: var(--spacing-lg);
  right: var(--spacing-lg);
  max-width: 500px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.mini-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.mini-card-academy-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: var(--spacing-xs);
  line-height: 1;
}

.mini-card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.mini-card-info {
  margin-bottom: var(--spacing-md);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.mini-card-salary {
  font-weight: 600;
  color: var(--color-primary);
}

.mini-card-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.mini-card-favorite {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color 0.2s;
  padding: var(--spacing-xs);
}

.mini-card-favorite.favorited {
  color: var(--color-error);
}
</style>
