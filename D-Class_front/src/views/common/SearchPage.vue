<template>
  <div class="search-page">
    <!-- 검색 헤더 -->
    <div class="search-page__header">
      <div class="search-input">
        <SearchIcon :size="20" class="search-icon" />
        <input
          ref="searchInput"
          v-model="searchKeyword"
          type="text"
          placeholder="공고 검색"
          @input="handleSearch"
          @keyup.enter="handleEnter"
        />
        <button v-if="searchKeyword" class="clear-button" @click="clearSearch">
          <XIcon :size="20" />
        </button>
      </div>
      <button class="cancel-button" @click="$router.back()">취소</button>
    </div>

    <!-- 검색 전 상태 -->
    <div v-if="!searchKeyword && !isSearching" class="search-page__content">
      <!-- 최근 검색어 -->
      <section v-if="recentSearches.length > 0" class="search-section">
        <div class="section-header">
          <h3>최근 검색어</h3>
          <button class="clear-all" @click="clearAllRecent">전체 삭제</button>
        </div>
        <div class="search-chips">
          <div v-for="(search, index) in recentSearches" :key="index" class="search-chip">
            <button class="chip-content" @click="selectRecentSearch(search)">
              <ClockIcon :size="14" />
              <span>{{ search }}</span>
            </button>
            <button class="chip-delete" @click="removeRecentSearch(index)">
              <XIcon :size="14" />
            </button>
          </div>
        </div>
      </section>

      <!-- 인기 검색어 -->
      <section class="search-section">
        <div class="section-header">
          <h3>인기 검색어</h3>
        </div>
        <div class="popular-list">
          <button
            v-for="(keyword, index) in popularKeywords"
            :key="index"
            class="popular-item"
            @click="selectPopularSearch(keyword)"
          >
            <span class="rank">{{ index + 1 }}</span>
            <span class="keyword">{{ keyword }}</span>
            <TrendingUpIcon :size="16" class="trend-icon" />
          </button>
        </div>
      </section>
    </div>

    <!-- 검색 결과 -->
    <div v-if="searchKeyword && !isSearching" class="search-page__results">
      <div v-if="searchResults.length > 0" class="results-container">
        <p class="results-count">
          "<strong>{{ searchKeyword }}</strong>" 검색 결과 {{ searchResults.length }}개
        </p>
        <div class="results-list">
          <JobCard v-for="job in searchResults" :key="job.id" :job="job" />
        </div>
      </div>

      <BaseEmptyState
        v-else
        title="검색 결과가 없습니다"
        description="다른 키워드로 검색해보세요"
      />
    </div>

    <!-- 검색 중 로딩 -->
    <div v-if="isSearching" class="search-page__loading">
      <BaseLoading type="spinner" inline text="검색 중..." />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search as SearchIcon,
  X as XIcon,
  Clock as ClockIcon,
  TrendingUp as TrendingUpIcon,
} from 'lucide-vue-next'
import { BaseLoading, BaseEmptyState } from '@/components/common'
import JobCard from '@/components/common/JobCard.vue'
import { debounce, storage } from '@/utils/helpers'
import { apiClient } from '@/api'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { error: showError } = useToast()

const searchInput = ref(null)
const searchKeyword = ref('')
const searchResults = ref([])
const recentSearches = ref([])
const isSearching = ref(false)

const popularKeywords = ref([
  '발레',
  '서울 강남구',
  '현대무용',
  '주말',
  '시급 3만원',
  '초등반',
  '재즈댄스',
  '경력 우대',
])

// 최근 검색어 로드
const loadRecentSearches = () => {
  const recent = storage.get('recentSearches') || []
  recentSearches.value = recent
}

// 최근 검색어 저장
const saveRecentSearch = (keyword) => {
  // 중복 제거
  const filtered = recentSearches.value.filter((s) => s !== keyword)
  // 최신 검색어를 맨 앞에 추가
  recentSearches.value = [keyword, ...filtered].slice(0, 10) // 최대 10개
  storage.set('recentSearches', recentSearches.value)
}

// 검색 실행
const performSearch = async (keyword) => {
  if (!keyword || keyword.trim().length < 2) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    const response = await apiClient.get('/jobs/search', {
      params: { keyword: keyword.trim() },
    })
    searchResults.value = response.data
  } catch (err) {
    showError('검색 중 오류가 발생했습니다.')
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// 실시간 검색 (debounce 적용)
const handleSearch = debounce(() => {
  performSearch(searchKeyword.value)
}, 500)

// 엔터키 입력
const handleEnter = () => {
  if (searchKeyword.value && searchKeyword.value.trim().length >= 2) {
    saveRecentSearch(searchKeyword.value.trim())
    performSearch(searchKeyword.value)
  }
}

// 검색어 클리어
const clearSearch = () => {
  searchKeyword.value = ''
  searchResults.value = []
  searchInput.value?.focus()
}

// 최근 검색어 선택
const selectRecentSearch = (keyword) => {
  searchKeyword.value = keyword
  performSearch(keyword)
}

// 인기 검색어 선택
const selectPopularSearch = (keyword) => {
  searchKeyword.value = keyword
  saveRecentSearch(keyword)
  performSearch(keyword)
}

// 최근 검색어 삭제
const removeRecentSearch = (index) => {
  recentSearches.value.splice(index, 1)
  storage.set('recentSearches', recentSearches.value)
}

// 최근 검색어 전체 삭제
const clearAllRecent = () => {
  if (confirm('최근 검색어를 모두 삭제하시겠습니까?')) {
    recentSearches.value = []
    storage.remove('recentSearches')
  }
}

onMounted(async () => {
  loadRecentSearches()
  // 검색 입력 필드에 자동 포커스
  await nextTick()
  searchInput.value?.focus()
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.search-page {
  min-height: 100vh;
  background-color: $color-background;

  &__header {
    display: flex;
    gap: $spacing-md;
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;
    position: sticky;
    top: 0;
    z-index: $z-index-sticky;
  }

  &__content,
  &__results {
    padding: $spacing-lg;
  }

  &__loading {
    padding: $spacing-3xl;
  }
}

.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: 0 $spacing-md;
  height: 44px;
  background-color: $color-background;
  border-radius: $radius-full;

  .search-icon {
    color: $color-text-secondary;
    flex-shrink: 0;
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    background: none;
    font-size: $font-size-body;
    color: $color-text-primary;

    &::placeholder {
      color: $color-text-secondary;
    }
  }

  .clear-button {
    @include flex-center;
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    color: $color-text-secondary;
    cursor: pointer;
    border-radius: 50%;
    transition: all $transition-fast;
    flex-shrink: 0;

    &:hover {
      background-color: rgba($color-text-secondary, 0.1);
    }
  }
}

.cancel-button {
  background: none;
  border: none;
  color: $color-primary;
  font-size: $font-size-body;
  cursor: pointer;
  white-space: nowrap;
  padding: $spacing-sm;

  &:hover {
    color: $color-primary-dark;
  }
}

.search-section {
  background-color: $color-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
  padding: $spacing-xl;
  margin-bottom: $spacing-lg;

  .section-header {
    @include flex-between;
    margin-bottom: $spacing-lg;

    h3 {
      font-size: $font-size-h3;
      font-weight: $font-weight-semibold;
      margin: 0;
      color: $color-text-primary;
    }

    .clear-all {
      background: none;
      border: none;
      color: $color-text-secondary;
      font-size: $font-size-body-small;
      cursor: pointer;

      &:hover {
        color: $color-error;
      }
    }
  }
}

.search-chips {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.search-chip {
  display: flex;
  align-items: center;
  background-color: $color-background;
  border-radius: $radius-full;
  overflow: hidden;

  .chip-content {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: none;
    border: none;
    color: $color-text-primary;
    font-size: $font-size-body-small;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background-color: rgba($color-primary, 0.1);
    }

    svg {
      color: $color-text-secondary;
    }
  }

  .chip-delete {
    @include flex-center;
    width: 28px;
    height: 28px;
    background: none;
    border: none;
    border-left: 1px solid $color-divider;
    color: $color-text-secondary;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background-color: $color-error;
      color: $color-white;
    }
  }
}

.popular-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.popular-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: none;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all $transition-fast;
  text-align: left;

  &:hover {
    background-color: $color-background;
  }

  .rank {
    @include flex-center;
    width: 24px;
    height: 24px;
    background-color: $color-primary;
    color: $color-white;
    font-size: $font-size-body-small;
    font-weight: $font-weight-bold;
    border-radius: $radius-sm;
    flex-shrink: 0;
  }

  .keyword {
    flex: 1;
    font-size: $font-size-body;
    color: $color-text-primary;
  }

  .trend-icon {
    color: $color-accent;
    flex-shrink: 0;
  }
}

.results-container {
  .results-count {
    font-size: $font-size-body;
    color: $color-text-secondary;
    margin: 0 0 $spacing-lg 0;

    strong {
      color: $color-primary;
    }
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
}
</style>

