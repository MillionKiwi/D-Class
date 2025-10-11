<template>
  <InstructorLayout>
    <div class="job-list">
      <!-- 필터 영역 -->
      <div class="job-list__filters">
        <div class="filter-chips">
          <!-- 지역 필터 -->
          <div class="filter-group">
            <span class="filter-label">지역</span>
            <select v-model="selectedRegion" class="filter-select" @change="handleFilterChange">
              <option value="">전체</option>
              <option v-for="region in REGIONS" :key="region.value" :value="region.value">
                {{ region.label }}
              </option>
            </select>
          </div>

          <!-- 장르 필터 -->
          <div class="filter-group">
            <span class="filter-label">장르</span>
            <div class="chip-list">
              <button
                v-for="genre in DANCE_GENRES"
                :key="genre.value"
                :class="['filter-chip', { active: selectedGenres.includes(genre.value) }]"
                @click="toggleGenre(genre.value)"
              >
                {{ genre.label }}
              </button>
            </div>
          </div>

          <!-- 근무 시간 필터 -->
          <div class="filter-group">
            <span class="filter-label">근무 시간</span>
            <div class="chip-list">
              <button
                v-for="time in WORK_TIMES"
                :key="time.value"
                :class="['filter-chip', { active: selectedWorkTimes.includes(time.value) }]"
                @click="toggleWorkTime(time.value)"
              >
                {{ time.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 정렬 & 필터 초기화 -->
        <div class="job-list__controls">
          <select v-model="sortBy" class="sort-select" @change="handleFilterChange">
            <option value="latest">최신순</option>
            <option value="salary">급여 높은 순</option>
          </select>
          <BaseButton variant="text" @click="handleResetFilters">필터 초기화</BaseButton>
        </div>
      </div>

      <!-- 공고 목록 -->
      <div v-if="!isLoading && jobs.length > 0" class="job-list__content">
        <JobCard v-for="job in jobs" :key="job.id" :job="job" />
      </div>

      <!-- 로딩 -->
      <BaseLoading v-if="isLoading && jobs.length === 0" type="skeleton" inline :lines="5" />

      <!-- 빈 상태 -->
      <BaseEmptyState
        v-if="!isLoading && jobs.length === 0"
        title="조건에 맞는 공고가 없습니다"
        description="다른 조건으로 검색해보세요"
      >
        <template #action>
          <BaseButton @click="handleResetFilters">필터 초기화</BaseButton>
        </template>
      </BaseEmptyState>

      <!-- 무한 스크롤 로딩 -->
      <div v-if="isLoadingMore" class="job-list__loading-more">
        <BaseLoading type="spinner" inline />
      </div>
    </div>
  </InstructorLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { InstructorLayout } from '@/components/layout'
import { BaseButton, BaseLoading, BaseEmptyState } from '@/components/common'
import JobCard from '@/components/common/JobCard.vue'
import { useJobStore } from '@/stores'
import { REGIONS, DANCE_GENRES, WORK_TIMES } from '@/utils/constants'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

const jobStore = useJobStore()

// Filters
const selectedRegion = ref('')
const selectedGenres = ref([])
const selectedWorkTimes = ref([])
const sortBy = ref('latest')

const isLoading = ref(false)
const isLoadingMore = ref(false)

// Computed
const jobs = computed(() => jobStore.filteredJobs)

// Handlers
const handleFilterChange = async () => {
  jobStore.setFilter('region', selectedRegion.value)
  jobStore.setFilter('genres', selectedGenres.value)
  jobStore.setFilter('workTimes', selectedWorkTimes.value)
  jobStore.setFilter('sortBy', sortBy.value)

  await loadJobs()
}

const toggleGenre = (genre) => {
  const index = selectedGenres.value.indexOf(genre)
  if (index > -1) {
    selectedGenres.value.splice(index, 1)
  } else {
    selectedGenres.value.push(genre)
  }
  handleFilterChange()
}

const toggleWorkTime = (time) => {
  const index = selectedWorkTimes.value.indexOf(time)
  if (index > -1) {
    selectedWorkTimes.value.splice(index, 1)
  } else {
    selectedWorkTimes.value.push(time)
  }
  handleFilterChange()
}

const handleResetFilters = async () => {
  selectedRegion.value = ''
  selectedGenres.value = []
  selectedWorkTimes.value = []
  sortBy.value = 'latest'
  jobStore.resetFilters()
  await loadJobs()
}

const loadJobs = async () => {
  isLoading.value = true
  await jobStore.fetchJobs()
  isLoading.value = false
}

// 무한 스크롤
const { isLoading: scrollLoading, loadMore } = useInfiniteScroll(async () => {
  if (jobStore.pagination.hasMore) {
    isLoadingMore.value = true
    await jobStore.loadMore()
    isLoadingMore.value = false
    return jobStore.pagination.hasMore
  }
  return false
})

// Pull to refresh
const handleRefresh = async () => {
  await loadJobs()
}

// Lifecycle
onMounted(async () => {
  await loadJobs()
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.job-list {
  &__filters {
    background-color: $color-white;
    padding: $spacing-lg;
    margin-bottom: $spacing-md;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;
  }

  &__controls {
    @include flex-between;
    margin-top: $spacing-lg;
    padding-top: $spacing-lg;
    border-top: 1px solid $color-divider;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__loading-more {
    padding: $spacing-xl;
    text-align: center;
  }
}

.filter-chips {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.filter-group {
  .filter-label {
    display: block;
    font-size: $font-size-body-small;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
    margin-bottom: $spacing-sm;
  }

  .filter-select {
    width: 100%;
    height: 40px;
    padding: 0 $spacing-md;
    border: 1px solid $color-divider;
    border-radius: $radius-md;
    background-color: $color-white;
    font-size: $font-size-body;
    color: $color-text-primary;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }

  .chip-list {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }
}

.filter-chip {
  padding: $spacing-sm $spacing-md;
  border: 1px solid $color-divider;
  border-radius: $radius-full;
  background-color: $color-white;
  color: $color-text-primary;
  font-size: $font-size-body-small;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $color-primary;
    background-color: rgba($color-primary, 0.05);
  }

  &.active {
    border-color: $color-primary;
    background-color: $color-primary;
    color: $color-white;
  }
}

.sort-select {
  height: 36px;
  padding: 0 $spacing-md;
  border: 1px solid $color-divider;
  border-radius: $radius-md;
  background-color: $color-white;
  font-size: $font-size-body-small;
  color: $color-text-primary;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: $color-primary;
  }
}
</style>

