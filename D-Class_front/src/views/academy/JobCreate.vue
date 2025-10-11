<template>
  <AcademyLayout>
    <div class="job-create">
      <!-- 헤더 -->
      <div class="job-create__header">
        <button class="back-button" @click="handleBack">
          <ArrowLeftIcon :size="24" />
        </button>
        <h1>구인 공고 등록</h1>
        <BaseButton variant="text" :disabled="!hasChanges" @click="handleSave">임시저장</BaseButton>
      </div>

      <!-- 폼 -->
      <form class="job-create__form" @submit.prevent="handleSubmit">
        <!-- 공고 제목 -->
        <div class="form-section">
          <BaseInput
            v-model="formData.title"
            label="공고 제목"
            placeholder="예: 주말 발레 강사 모집"
            required
            :error="!!errors.title"
            :errorMessage="errors.title"
          />
        </div>

        <!-- 근무 지역 -->
        <div class="form-section">
          <label class="form-label">
            근무 지역 <span class="required">*</span>
          </label>
          <div class="region-select">
            <select v-model="formData.region" class="select-field" @change="errors.region = ''">
              <option value="">지역 선택</option>
              <option v-for="region in REGIONS" :key="region.value" :value="region.value">
                {{ region.label }}
              </option>
            </select>
            <select
              v-model="formData.district"
              class="select-field"
              :disabled="!formData.region"
              @change="errors.district = ''"
            >
              <option value="">시/구 선택</option>
              <option v-for="district in selectedDistricts" :key="district" :value="district">
                {{ district }}
              </option>
            </select>
          </div>
          <p v-if="errors.region || errors.district" class="error-message">
            {{ errors.region || errors.district }}
          </p>
        </div>

        <!-- 무용 장르 -->
        <div class="form-section">
          <label class="form-label">
            무용 장르 <span class="required">*</span>
          </label>
          <div class="genre-chips">
            <button
              v-for="genre in DANCE_GENRES"
              :key="genre.value"
              type="button"
              :class="['genre-chip', { selected: formData.genres.includes(genre.value) }]"
              @click="toggleGenre(genre.value)"
            >
              {{ genre.label }}
            </button>
          </div>
          <p v-if="errors.genres" class="error-message">{{ errors.genres }}</p>
        </div>

        <!-- 담당 수업 -->
        <div class="form-section">
          <BaseInput
            v-model="formData.classes"
            label="담당 수업"
            placeholder="예: 초등반, 성인취미반"
            required
            :error="!!errors.classes"
            :errorMessage="errors.classes"
          />
        </div>

        <!-- 근무 요일 및 시간 -->
        <div class="form-section">
          <label class="form-label">
            근무 요일 및 시간 <span class="required">*</span>
          </label>

          <!-- 요일 선택 -->
          <div class="weekday-buttons">
            <button
              v-for="day in WEEKDAYS"
              :key="day.value"
              type="button"
              :class="['weekday-btn', { selected: formData.workDays.includes(day.value) }]"
              @click="toggleWorkDay(day.value)"
            >
              {{ day.label }}
            </button>
          </div>

          <!-- 시간 입력 -->
          <div class="time-inputs">
            <BaseInput
              v-model="formData.startTime"
              type="time"
              placeholder="09:00"
              :error="!!errors.startTime"
            />
            <span class="time-separator">~</span>
            <BaseInput
              v-model="formData.endTime"
              type="time"
              placeholder="18:00"
              :error="!!errors.endTime"
            />
          </div>
          <p v-if="errors.workDays || errors.startTime || errors.endTime" class="error-message">
            {{ errors.workDays || errors.startTime || errors.endTime }}
          </p>
        </div>

        <!-- 급여 정보 -->
        <div class="form-section">
          <label class="form-label">
            급여 정보 <span class="required">*</span>
          </label>
          <div class="salary-inputs">
            <select v-model="formData.salaryType" class="select-field">
              <option v-for="type in SALARY_TYPES" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
            <BaseInput
              v-model.number="formData.salary"
              type="number"
              placeholder="금액 입력"
              :error="!!errors.salary"
            />
          </div>
          <p v-if="errors.salary" class="error-message">{{ errors.salary }}</p>
        </div>

        <!-- 우대 사항 -->
        <div class="form-section">
          <BaseInput
            v-model="formData.benefits"
            label="우대 사항"
            placeholder="예: 경력 3년 이상 우대"
            hint="선택 사항입니다"
          />
        </div>

        <!-- 상세 설명 -->
        <div class="form-section">
          <BaseInput
            v-model="formData.description"
            label="상세 설명"
            textarea
            placeholder="공고에 대한 상세 설명을 작성해주세요"
            :rows="8"
            :maxlength="2000"
            :showCounter="true"
          />
        </div>

        <!-- 제출 버튼 -->
        <div class="job-create__actions">
          <BaseButton type="submit" block :loading="isSubmitting">등록하기</BaseButton>
        </div>
      </form>

      <!-- 변경사항 확인 모달 -->
      <BaseModal
        v-model:isOpen="showConfirmModal"
        title="작성 중인 공고"
        confirmText="나가기"
        cancelText="계속 작성"
        @confirm="confirmLeave"
        @cancel="showConfirmModal = false"
      >
        <p>작성 중인 공고가 있습니다.</p>
        <p>정말 나가시겠습니까?</p>
      </BaseModal>
    </div>
  </AcademyLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft as ArrowLeftIcon } from 'lucide-vue-next'
import { AcademyLayout } from '@/components/layout'
import { BaseInput, BaseButton, BaseModal } from '@/components/common'
import { useJobStore } from '@/stores'
import { REGIONS, DANCE_GENRES, WEEKDAYS, SALARY_TYPES } from '@/utils/constants'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const jobStore = useJobStore()
const { error: showError } = useToast()

const formData = reactive({
  title: '',
  region: '',
  district: '',
  genres: [],
  classes: '',
  workDays: [],
  startTime: '',
  endTime: '',
  salaryType: 'hourly',
  salary: null,
  benefits: '',
  description: '',
})

const errors = reactive({
  title: '',
  region: '',
  district: '',
  genres: '',
  classes: '',
  workDays: '',
  startTime: '',
  endTime: '',
  salary: '',
})

const originalData = ref(JSON.stringify(formData))
const showConfirmModal = ref(false)
const isSubmitting = ref(false)

const selectedDistricts = computed(() => {
  const region = REGIONS.find((r) => r.value === formData.region)
  return region?.districts || []
})

const hasChanges = computed(() => {
  return JSON.stringify(formData) !== originalData.value
})

const toggleGenre = (genre) => {
  const index = formData.genres.indexOf(genre)
  if (index > -1) {
    formData.genres.splice(index, 1)
  } else {
    formData.genres.push(genre)
  }
  errors.genres = ''
}

const toggleWorkDay = (day) => {
  const index = formData.workDays.indexOf(day)
  if (index > -1) {
    formData.workDays.splice(index, 1)
  } else {
    formData.workDays.push(day)
  }
  errors.workDays = ''
}

const validateForm = () => {
  let isValid = true

  // 필수 항목 검증
  if (!formData.title) {
    errors.title = '공고 제목을 입력해주세요'
    isValid = false
  }

  if (!formData.region) {
    errors.region = '지역을 선택해주세요'
    isValid = false
  }

  if (!formData.district) {
    errors.district = '시/구를 선택해주세요'
    isValid = false
  }

  if (formData.genres.length === 0) {
    errors.genres = '무용 장르를 1개 이상 선택해주세요'
    isValid = false
  }

  if (!formData.classes) {
    errors.classes = '담당 수업을 입력해주세요'
    isValid = false
  }

  if (formData.workDays.length === 0) {
    errors.workDays = '근무 요일을 선택해주세요'
    isValid = false
  }

  if (!formData.startTime) {
    errors.startTime = '시작 시간을 입력해주세요'
    isValid = false
  }

  if (!formData.endTime) {
    errors.endTime = '종료 시간을 입력해주세요'
    isValid = false
  }

  if (!formData.salary || formData.salary <= 0) {
    errors.salary = '올바른 급여를 입력해주세요'
    isValid = false
  }

  return isValid
}

const handleSave = () => {
  // TODO: 임시저장 기능 구현
  showError('임시저장 기능은 준비 중입니다.')
}

const handleSubmit = async () => {
  if (!validateForm()) {
    showError('필수 항목을 모두 입력해주세요')
    return
  }

  isSubmitting.value = true
  const result = await jobStore.createJob(formData)
  isSubmitting.value = false

  if (result.success) {
    router.push('/academy/jobs')
  }
}

const handleBack = () => {
  if (hasChanges.value) {
    showConfirmModal.value = true
  } else {
    router.back()
  }
}

const confirmLeave = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.job-create {
  &__header {
    @include flex-between;
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;
    position: sticky;
    top: $header-height;
    z-index: $z-index-sticky;

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

  &__form {
    padding: $spacing-lg;
    padding-bottom: $spacing-3xl;
  }

  &__actions {
    margin-top: $spacing-xl;
  }
}

.form-section {
  margin-bottom: $spacing-xl;
}

.form-label {
  display: block;
  font-size: $font-size-body;
  font-weight: $font-weight-medium;
  color: $color-text-primary;
  margin-bottom: $spacing-sm;

  .required {
    color: $color-error;
  }
}

.region-select,
.salary-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-md;
}

.select-field {
  height: $input-height;
  padding: 0 $input-padding-x;
  border: 1px solid $color-divider;
  border-radius: $radius-md;
  background-color: $color-white;
  font-size: $font-size-body;
  color: $color-text-primary;
  cursor: pointer;
  transition: all $transition-fast;

  &:focus {
    outline: none;
    border-color: $color-primary;
    border-width: 2px;
  }

  &:disabled {
    background-color: $color-background;
    color: $color-text-secondary;
    cursor: not-allowed;
  }
}

.genre-chips {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.genre-chip {
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

  &.selected {
    border-color: $color-primary;
    background-color: $color-primary;
    color: $color-white;
  }
}

.weekday-buttons {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: $spacing-sm;
  margin-bottom: $spacing-md;

  @include mobile {
    grid-template-columns: repeat(4, 1fr);
  }
}

.weekday-btn {
  height: 44px;
  border: 1px solid $color-divider;
  border-radius: $radius-md;
  background-color: $color-white;
  color: $color-text-primary;
  font-size: $font-size-body;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $color-primary;
    background-color: rgba($color-primary, 0.05);
  }

  &.selected {
    border-color: $color-primary;
    background-color: $color-primary;
    color: $color-white;
  }
}

.time-inputs {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: $spacing-md;
  align-items: center;

  .time-separator {
    font-size: $font-size-h3;
    color: $color-text-secondary;
    text-align: center;
  }
}

.error-message {
  color: $color-error;
  font-size: $font-size-body-small;
  margin-top: $spacing-sm;
}
</style>

