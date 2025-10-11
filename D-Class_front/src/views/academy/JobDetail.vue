<template>
  <AcademyLayout>
    <div v-if="isLoading" class="job-detail">
      <BaseLoading type="skeleton" inline :lines="10" />
    </div>

    <div v-else-if="job" class="job-detail">
      <!-- 헤더 -->
      <div class="job-detail__header">
        <button class="back-button" @click="$router.back()">
          <ArrowLeftIcon :size="24" />
        </button>
        <h1>공고 상세</h1>
        <button class="edit-button" @click="handleEdit">
          <EditIcon :size="24" />
        </button>
      </div>

      <!-- 공고 정보 -->
      <section class="job-detail__section">
        <h3 class="section-title">{{ job.title }}</h3>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">모집 장르</span>
            <div class="genre-tags">
              <BaseBadge v-for="genre in job.genres" :key="genre" variant="primary">
                {{ genre }}
              </BaseBadge>
            </div>
          </div>

          <div class="info-item">
            <span class="info-label">담당 수업</span>
            <span class="info-value">{{ job.classes }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">근무 요일 및 시간</span>
            <span class="info-value">{{ formatWorkSchedule(job.workSchedule) }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">급여 정보</span>
            <span class="info-value highlight">{{ formatSalary(job.salary, job.salaryType) }}</span>
          </div>

          <div v-if="job.benefits" class="info-item">
            <span class="info-label">우대 사항</span>
            <span class="info-value">{{ job.benefits }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">상태</span>
            <BaseBadge :variant="getStatusVariant(job.status)">
              {{ getStatusText(job.status) }}
            </BaseBadge>
          </div>
        </div>

        <div v-if="job.description" class="description">
          <h4>상세 설명</h4>
          <p>{{ job.description }}</p>
        </div>
      </section>

      <!-- 지원 현황 -->
      <section class="job-detail__section">
        <h3 class="section-title">지원 현황</h3>
        <div class="applicant-summary">
          <div class="summary-item">
            <span class="label">총 지원자</span>
            <span class="value">{{ job.applicantCount || 0 }}명</span>
          </div>
          <BaseButton block @click="handleGoToApplicants">지원자 관리 바로가기</BaseButton>
        </div>
      </section>

      <!-- 하단 액션 버튼 -->
      <div class="job-detail__actions">
        <BaseButton v-if="job.status === 'active'" variant="secondary" @click="handleClose">
          공고 마감하기
        </BaseButton>
        <BaseButton variant="danger" @click="handleDelete">공고 삭제하기</BaseButton>
      </div>

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
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft as ArrowLeftIcon,
  Edit as EditIcon,
  Star as StarIcon,
} from 'lucide-vue-next'
import { AcademyLayout } from '@/components/layout'
import { BaseButton, BaseBadge, BaseModal, BaseLoading, BaseEmptyState } from '@/components/common'
import { useJobStore } from '@/stores'
import { JOB_STATUS } from '@/utils/constants'
import { formatSalary } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const jobStore = useJobStore()

const job = ref(null)
const isLoading = ref(false)
const showCloseModal = ref(false)
const showDeleteModal = ref(false)

const formatWorkSchedule = (schedule) => {
  if (!schedule) return ''
  return `${schedule.days.join(', ')} ${schedule.startTime}~${schedule.endTime}`
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

const handleEdit = () => {
  router.push(`/academy/jobs/${job.value.id}/edit`)
}

const handleGoToApplicants = () => {
  router.push(`/academy/applicants?jobId=${job.value.id}`)
}

const handleClose = () => {
  showCloseModal.value = true
}

const confirmClose = async () => {
  await jobStore.closeJob(job.value.id)
  job.value.status = JOB_STATUS.CLOSED
  showCloseModal.value = false
}

const handleDelete = () => {
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  const result = await jobStore.deleteJob(job.value.id)
  if (result.success) {
    router.push('/academy/jobs')
  }
  showDeleteModal.value = false
}

onMounted(async () => {
  isLoading.value = true
  const result = await jobStore.fetchJobDetail(route.params.id)
  if (result.success) {
    job.value = result.data
  }
  isLoading.value = false
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.job-detail {
  &__header {
    @include flex-between;
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;

    .back-button,
    .edit-button {
      @include touch-target;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: $color-text-primary;
      cursor: pointer;

      &:hover {
        color: $color-primary;
      }
    }

    h1 {
      flex: 1;
      text-align: center;
      font-size: $font-size-h3;
      margin: 0;
    }
  }

  &__section {
    background-color: $color-white;
    padding: $spacing-xl;
    margin-bottom: $spacing-md;
  }

  &__actions {
    padding: $spacing-lg;
    display: flex;
    gap: $spacing-md;
  }
}

.section-title {
  font-size: $font-size-h2;
  font-weight: $font-weight-bold;
  margin: 0 0 $spacing-xl 0;
  color: $color-text-primary;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;

  .info-label {
    font-size: $font-size-body-small;
    font-weight: $font-weight-semibold;
    color: $color-text-secondary;
  }

  .info-value {
    font-size: $font-size-body;
    color: $color-text-primary;

    &.highlight {
      font-size: $font-size-h2;
      font-weight: $font-weight-bold;
      color: $color-primary;
    }
  }
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.description {
  h4 {
    font-size: $font-size-h3;
    font-weight: $font-weight-semibold;
    margin: 0 0 $spacing-md 0;
  }

  p {
    font-size: $font-size-body;
    color: $color-text-primary;
    line-height: $line-height-relaxed;
    white-space: pre-line;
    margin: 0;
  }
}

.applicant-summary {
  .summary-item {
    @include flex-between;
    padding: $spacing-lg;
    background-color: $color-background;
    border-radius: $radius-md;
    margin-bottom: $spacing-lg;

    .label {
      font-size: $font-size-body;
      color: $color-text-secondary;
    }

    .value {
      font-size: $font-size-h3;
      font-weight: $font-weight-bold;
      color: $color-primary;
    }
  }
}

.modal-subtitle {
  font-size: $font-size-body-small;
  color: $color-text-secondary;
  margin-top: $spacing-sm;
}

.modal-info {
  margin-top: $spacing-lg;
  padding: $spacing-md;
  background-color: $color-background;
  border-radius: $radius-md;

  p {
    font-size: $font-size-body-small;
    color: $color-text-primary;
    margin: $spacing-xs 0;
  }
}
</style>

