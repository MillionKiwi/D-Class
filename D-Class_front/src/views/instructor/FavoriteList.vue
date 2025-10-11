<template>
  <InstructorLayout>
    <div class="favorite-list">
      <!-- 헤더 -->
      <div class="favorite-list__header">
        <button class="back-button" @click="$router.back()">
          <ArrowLeftIcon :size="24" />
        </button>
        <h1>찜한 공고</h1>
        <div style="width: 44px"></div>
      </div>

      <!-- 공고 목록 -->
      <div v-if="!isLoading && favoriteJobs.length > 0" class="favorite-list__content">
        <JobCard
          v-for="job in favoriteJobs"
          :key="job.id"
          :job="job"
          @favorite-toggle="handleFavoriteToggle"
        />
      </div>

      <!-- 로딩 -->
      <BaseLoading v-if="isLoading" type="skeleton" inline :lines="5" />

      <!-- 빈 상태 -->
      <BaseEmptyState
        v-if="!isLoading && favoriteJobs.length === 0"
        title="찜한 공고가 없습니다"
        description="마음에 드는 공고를 찜하고 나중에 확인하세요"
      >
        <template #action>
          <BaseButton @click="$router.push('/instructor/jobs')">공고 둘러보기</BaseButton>
        </template>
      </BaseEmptyState>
    </div>
  </InstructorLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft as ArrowLeftIcon } from 'lucide-vue-next'
import { InstructorLayout } from '@/components/layout'
import { BaseButton, BaseLoading, BaseEmptyState } from '@/components/common'
import JobCard from '@/components/common/JobCard.vue'
import { useJobStore } from '@/stores'

const jobStore = useJobStore()

const isLoading = ref(false)

const favoriteJobs = computed(() => jobStore.favoriteJobs)

const handleFavoriteToggle = async (jobId, isFavorite) => {
  // 찜 해제된 경우 목록에서 제거됨 (store에서 자동 처리)
  // 추가 처리 필요 없음
}

onMounted(async () => {
  isLoading.value = true
  await jobStore.fetchFavoriteJobs()
  isLoading.value = false
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.favorite-list {
  &__header {
    @include flex-between;
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;

    .back-button {
      @include touch-target;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: $color-text-primary;
      cursor: pointer;
    }

    h1 {
      flex: 1;
      text-align: center;
      font-size: $font-size-h3;
      margin: 0;
    }
  }

  &__content {
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
}
</style>

