<template>
  <AcademyLayout>
    <div class="job-management">
      <!-- 상태별 탭 -->
      <div class="job-management__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span v-if="getTabCount(tab.value) > 0" class="tab__badge">
            {{ getTabCount(tab.value) }}
          </span>
        </button>
      </div>

      <!-- 공고 카드 목록 -->
      <div v-if="!isLoading && filteredJobs.length > 0" class="job-management__content">
        <div v-for="job in filteredJobs" :key="job.id" class="job-card">
          <BaseCard clickable @click="handleCardClick(job.id)">
            <!-- 공고 정보 -->
            <h3 class="job-card__title">{{ job.title }}</h3>

            <div class="job-card__info">
              <span class="info-item">
                <MusicIcon :size="14" />
                {{ job.genres.join(', ') }}
              </span>
              <span class="info-item">
                <DollarSignIcon :size="14" />
                {{ formatSalary(job.salary, job.salaryType) }}
              </span>
            </div>

            <div class="job-card__meta">
              <span class="applicant-count">
                <UsersIcon :size="14" />
                지원자: <strong>{{ job.applicantCount || 0 }}명</strong>
              </span>
              <span class="date">{{ formatDate(job.createdAt, 'YYYY.MM.DD') }}</span>
            </div>

            <!-- 상태 배지 -->
            <div class="job-card__status">
              <BaseBadge :variant="getStatusVariant(job.status)">
                {{ getStatusText(job.status) }}
              </BaseBadge>
            </div>

            <!-- 액션 버튼 -->
            <div class="job-card__actions" @click.stop>
              <BaseButton
                v-if="job.status === 'active'"
                variant="secondary"
                @click="handleEdit(job.id)"
              >
                수정
              </BaseButton>
              <BaseButton
                v-if="job.status === 'active'"
                variant="secondary"
                @click="handleClose(job.id)"
              >
                마감
              </BaseButton>
              <BaseButton variant="danger" @click="handleDelete(job.id)">삭제</BaseButton>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- 로딩 -->
      <BaseLoading v-if="isLoading" type="skeleton" inline :lines="5" />

      <!-- 빈 상태 -->
      <BaseEmptyState
        v-if="!isLoading && filteredJobs.length === 0"
        title="등록된 공고가 없습니다"
        description="첫 공고를 등록하여 강사를 모집해보세요"
      >
        <template #action>
          <BaseButton @click="$router.push('/academy/jobs/create')">첫 공고 등록하기</BaseButton>
        </template>
      </BaseEmptyState>

      <!-- 마감 확인 모달 -->
      <BaseModal
        v-model:isOpen="showCloseModal"
        title="공고 마감"
        @confirm="confirmClose"
        @cancel="showCloseModal = false"
      >
        <p>공고를 마감하시겠습니까?</p>
        <p class="modal-subtitle">마감 후에는 새로운 지원을 받을 수 없습니다.</p>
      </BaseModal>

      <!-- 삭제 확인 모달 -->
      <BaseModal
        v-model:isOpen="showDeleteModal"
        title="공고 삭제"
        confirmText="삭제"
        @confirm="confirmDelete"
        @cancel="showDeleteModal = false"
      >
        <p>삭제된 공고는 복구할 수 없습니다.</p>
        <p class="modal-subtitle">정말 삭제하시겠습니까?</p>
      </BaseModal>
    </div>
  </AcademyLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Music as MusicIcon,
  DollarSign as DollarSignIcon,
  Users as UsersIcon,
} from 'lucide-vue-next'
import { AcademyLayout } from '@/components/layout'
import { BaseCard, BaseBadge, BaseButton, BaseModal, BaseLoading, BaseEmptyState } from '@/components/common'
import { useJobStore } from '@/stores'
import { JOB_STATUS } from '@/utils/constants'
import { formatSalary, formatDate } from '@/utils/helpers'

const router = useRouter()
const jobStore = useJobStore()

const activeTab = ref('all')
const isLoading = ref(false)
const showCloseModal = ref(false)
const showDeleteModal = ref(false)
const selectedJobId = ref(null)

const tabs = [
  { value: 'all', label: '전체' },
  { value: JOB_STATUS.ACTIVE, label: '게시중' },
  { value: JOB_STATUS.PENDING, label: '검토 대기' },
  { value: JOB_STATUS.CLOSED, label: '마감' },
]

const jobs = computed(() => jobStore.jobs)

const filteredJobs = computed(() => {
  if (activeTab.value === 'all') {
    return jobs.value
  }
  return jobs.value.filter((job) => job.status === activeTab.value)
})

const getTabCount = (tabValue) => {
  if (tabValue === 'all') {
    return jobs.value.length
  }
  return jobs.value.filter((job) => job.status === tabValue).length
}

const getStatusVariant = (status) => {
  const variants = {
    [JOB_STATUS.ACTIVE]: 'success',
    [JOB_STATUS.PENDING]: 'warning',
    [JOB_STATUS.CLOSED]: 'default',
  }
  return variants[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    [JOB_STATUS.DRAFT]: '작성중',
    [JOB_STATUS.PENDING]: '검토 대기',
    [JOB_STATUS.ACTIVE]: '게시중',
    [JOB_STATUS.CLOSED]: '마감',
    [JOB_STATUS.HIDDEN]: '숨김',
  }
  return texts[status] || status
}

const handleCardClick = (jobId) => {
  router.push(`/academy/jobs/${jobId}`)
}

const handleEdit = (jobId) => {
  router.push(`/academy/jobs/${jobId}/edit`)
}

const handleClose = (jobId) => {
  selectedJobId.value = jobId
  showCloseModal.value = true
}

const confirmClose = async () => {
  await jobStore.closeJob(selectedJobId.value)
  showCloseModal.value = false
  selectedJobId.value = null
}

const handleDelete = (jobId) => {
  selectedJobId.value = jobId
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  await jobStore.deleteJob(selectedJobId.value)
  showDeleteModal.value = false
  selectedJobId.value = null
}

onMounted(async () => {
  isLoading.value = true
  await jobStore.fetchJobs()
  isLoading.value = false
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.job-management {
  &__tabs {
    display: flex;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;
    overflow-x: auto;
    @include custom-scrollbar;

    .tab {
      flex: 1;
      min-width: fit-content;
      padding: $spacing-lg;
      background: none;
      border: none;
      font-size: $font-size-body;
      color: $color-text-secondary;
      cursor: pointer;
      position: relative;
      transition: all $transition-fast;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $spacing-sm;

      &:hover {
        color: $color-primary;
        background-color: rgba($color-primary, 0.02);
      }

      &.active {
        color: $color-primary;
        font-weight: $font-weight-semibold;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background-color: $color-primary;
        }
      }

      &__badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 $spacing-xs;
        background-color: $color-accent;
        color: $color-white;
        border-radius: $radius-full;
        font-size: $font-size-caption;
        font-weight: $font-weight-semibold;
      }
    }
  }

  &__content {
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
}

.job-card {
  &__title {
    font-size: $font-size-h3;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
    margin: 0 0 $spacing-md 0;
  }

  &__info {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-md;
    margin-bottom: $spacing-md;

    .info-item {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      font-size: $font-size-body-small;
      color: $color-text-secondary;
    }
  }

  &__meta {
    @include flex-between;
    padding: $spacing-md 0;
    border-top: 1px solid $color-divider;
    border-bottom: 1px solid $color-divider;
    margin-bottom: $spacing-md;

    .applicant-count {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      font-size: $font-size-body-small;
      color: $color-text-secondary;

      strong {
        color: $color-accent;
        font-weight: $font-weight-semibold;
      }
    }

    .date {
      font-size: $font-size-caption;
      color: $color-text-secondary;
    }
  }

  &__status {
    margin-bottom: $spacing-md;
  }

  &__actions {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;
  }
}

.modal-subtitle {
  font-size: $font-size-body-small;
  color: $color-text-secondary;
  margin-top: $spacing-sm;
}
</style>

