<template>
  <AppLayout hide-nav>
    <div class="search-page">
      <div class="search-header">
        <div class="search-input-wrapper">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="검색어를 입력하세요"
            class="search-input"
            @input="handleSearchInput"
            @keyup.enter="performSearch"
          />
          <button class="search-btn" @click="performSearch">검색</button>
          <button class="cancel-btn" @click="$router.back()">취소</button>
        </div>
      </div>

      <div v-if="!searchQuery && !hasSearched" class="search-content">
        <!-- 최근 검색어 -->
        <div v-if="recentSearches.length > 0" class="search-section">
          <div class="section-header">
            <h3>최근 검색어</h3>
            <button class="clear-btn" @click="clearRecentSearches">전체 삭제</button>
          </div>
          <div class="search-chips">
            <span
              v-for="(keyword, index) in recentSearches"
              :key="index"
              class="search-chip"
              @click="selectKeyword(keyword)"
            >
              {{ keyword }}
              <button class="chip-remove" @click.stop="removeRecentSearch(keyword)">×</button>
            </span>
          </div>
        </div>

        <!-- 인기 검색어 -->
        <div v-if="popularKeywords.length > 0" class="search-section">
          <h3>인기 검색어</h3>
          <div class="popular-keywords">
            <span
              v-for="(item, index) in popularKeywords"
              :key="index"
              class="popular-keyword"
              @click="selectKeyword(item.keyword)"
            >
              <span class="rank">{{ index + 1 }}</span>
              <span class="keyword">{{ item.keyword }}</span>
              <span class="count">{{ item.count }}</span>
            </span>
          </div>
        </div>

        <!-- 자동완성 -->
        <div v-if="suggestions.length > 0" class="search-section">
          <h3>검색어 제안</h3>
          <div class="suggestions-list">
            <button
              v-for="(suggestion, index) in suggestions"
              :key="index"
              class="suggestion-item"
              @click="selectKeyword(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
      </div>

      <!-- 검색 결과 -->
      <div v-else-if="searchResults.length > 0" class="search-results">
        <div class="results-header">
          <h3>검색 결과 ({{ searchResults.length }}개)</h3>
        </div>
        <div class="results-list">
          <Card
            v-for="posting in searchResults"
            :key="posting.id"
            class="result-card"
            clickable
            @click="$router.push(`/job-postings/${posting.id}`)"
          >
            <h4 class="result-title">{{ posting.title }}</h4>
            <div class="result-info">
              <span class="result-academy">{{ posting.academy.name }}</span>
              <span class="result-genres">{{ formatGenres(posting.genres) }}</span>
              <span class="result-salary">{{ formatSalary(posting) }}</span>
            </div>
          </Card>
        </div>
      </div>

      <!-- 검색 결과 없음 -->
      <div v-else-if="hasSearched" class="empty-state">
        <p>"{{ lastSearchQuery }}"에 대한 검색 결과가 없습니다</p>
        <Button @click="clearSearch">새로 검색</Button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useJobPostingStore } from '@/stores/jobPosting'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'
import { inject } from 'vue'
import { formatGenres } from '@/utils/formatters'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'

const router = useRouter()
const jobPostingStore = useJobPostingStore()
const showToast = inject('toast', () => {})

const searchInput = ref(null)
const searchQuery = ref('')
const suggestions = ref([])
const popularKeywords = ref([])
const recentSearches = ref([])
const searchResults = ref([])
const hasSearched = ref(false)
const lastSearchQuery = ref('')

let debounceTimer = null

const STORAGE_KEY = 'dclass_recent_searches'
const MAX_RECENT_SEARCHES = 10

const loadRecentSearches = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    recentSearches.value = JSON.parse(stored)
  }
}

const saveRecentSearch = (keyword) => {
  let searches = [...recentSearches.value]
  // 중복 제거
  searches = searches.filter((s) => s !== keyword)
  // 맨 앞에 추가
  searches.unshift(keyword)
  // 최대 개수 제한
  searches = searches.slice(0, MAX_RECENT_SEARCHES)
  recentSearches.value = searches
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
}

const removeRecentSearch = (keyword) => {
  recentSearches.value = recentSearches.value.filter((s) => s !== keyword)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches.value))
}

const clearRecentSearches = () => {
  recentSearches.value = []
  localStorage.removeItem(STORAGE_KEY)
}

const handleSearchInput = () => {
  // Debounce: 500ms 후 자동완성
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  if (searchQuery.value.length >= 2) {
    debounceTimer = setTimeout(() => {
      fetchSuggestions()
    }, 500)
  } else {
    suggestions.value = []
  }
}

const fetchSuggestions = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH.AUTOCOMPLETE, {
      params: { q: searchQuery.value },
    })
    suggestions.value = response.data.suggestions || []
  } catch (error) {
    // 자동완성 실패 시 무시
  }
}

const fetchPopularKeywords = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH.POPULAR)
    popularKeywords.value = response.data.keywords || []
  } catch (error) {
    // 인기 검색어 로딩 실패 시 무시
  }
}

const selectKeyword = (keyword) => {
  searchQuery.value = keyword
  performSearch()
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    return
  }

  hasSearched.value = true
  lastSearchQuery.value = searchQuery.value.trim()

  // 최근 검색어에 저장
  saveRecentSearch(lastSearchQuery.value)

  // 검색 실행
  const result = await jobPostingStore.fetchPostings({
    search: lastSearchQuery.value,
  })

  if (result.success) {
    searchResults.value = result.data.results || []
  } else {
    showToast('검색에 실패했습니다', 'error')
    searchResults.value = []
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  hasSearched.value = false
  searchResults.value = []
  suggestions.value = []
}

const formatSalary = (posting) => {
  if (posting.salary_type === 'hourly') {
    return `${posting.salary.toLocaleString()}원/시간`
  } else {
    return `${posting.salary.toLocaleString()}원/월`
  }
}

onMounted(async () => {
  loadRecentSearches()
  await fetchPopularKeywords()
  await nextTick()
  searchInput.value?.focus()
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background-color: var(--color-background);
}

.search-header {
  position: sticky;
  top: 0;
  background-color: var(--color-card);
  border-bottom: 1px solid var(--color-divider);
  padding: var(--spacing-md);
  z-index: 100;
}

.search-input-wrapper {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.search-input {
  flex: 1;
  padding: var(--spacing-md);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-sm);
  font-size: 16px;
  min-height: 48px;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  border-width: 2px;
}

.search-btn {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  min-height: 48px;
}

.cancel-btn {
  padding: var(--spacing-md);
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-size: 16px;
  cursor: pointer;
}

.search-content {
  padding: var(--spacing-lg);
}

.search-section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.search-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.search-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: white;
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-full);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.search-chip:hover {
  border-color: var(--color-primary);
}

.chip-remove {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.popular-keywords {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.popular-keyword {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.2s;
}

.popular-keyword:hover {
  background-color: var(--color-background);
}

.rank {
  font-weight: 700;
  color: var(--color-primary);
  min-width: 24px;
}

.keyword {
  flex: 1;
  font-size: 14px;
}

.count {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.suggestion-item {
  padding: var(--spacing-md);
  background-color: white;
  border: none;
  border-radius: var(--radius-sm);
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: var(--color-background);
}

.search-results {
  padding: var(--spacing-lg);
}

.results-header {
  margin-bottom: var(--spacing-lg);
}

.results-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.result-card {
  padding: var(--spacing-lg);
}

.result-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.result-academy {
  font-weight: 600;
  color: var(--color-text-primary);
}

.result-salary {
  color: var(--color-accent);
  font-weight: 600;
}
</style>
