<template>
  <AppLayout>
    <div class="posting-edit-page page-container">
      <div class="page-header">
        <button class="back-btn" @click="handleBack">←</button>
        <h1 class="page-title">{{ isEdit ? '공고 수정' : '구인 공고 등록' }}</h1>
        <Button @click="handleSave" :loading="saving">저장</Button>
      </div>

      <form @submit.prevent="handleSave" class="posting-form">
        <Input
          v-model="form.title"
          label="공고 제목"
          placeholder="예: 주말 발레 강사 모집"
          :error="errors.title"
          required
        />

        <div class="input-wrapper">
          <label class="input-label">
            근무 지역 <span class="required-star">*</span>
          </label>
          <select v-model="form.region" class="select-field" required>
            <option value="">지역 선택</option>
            <option v-for="region in regions" :key="region.value" :value="region.value">
              {{ region.label }}
            </option>
          </select>
        </div>

        <div class="input-wrapper">
          <label class="input-label">
            무용 장르 <span class="required-star">*</span>
          </label>
          <div class="genre-chips">
            <span
              v-for="genre in genreOptions"
              :key="genre.value"
              :class="['genre-chip', { selected: form.genres.includes(genre.value) }]"
              @click="toggleGenre(genre.value)"
            >
              {{ genre.label }}
            </span>
          </div>
        </div>

        <Input
          v-model="form.classes"
          label="담당 수업"
          placeholder="예: 초등반, 성인취미반"
          :error="errors.classes"
          required
        />

        <div class="input-wrapper">
          <label class="input-label">
            근무 요일 <span class="required-star">*</span>
          </label>
          <div class="day-chips">
            <span
              v-for="day in days"
              :key="day.value"
              :class="['day-chip', { selected: form.work_days.includes(day.value) }]"
              @click="toggleDay(day.value)"
            >
              {{ day.label }}
            </span>
          </div>
        </div>

        <Input
          v-model="form.work_time"
          label="근무 시간"
          placeholder="예: 14:00-18:00"
          :error="errors.work_time"
          required
        />

        <div class="input-wrapper">
          <label class="input-label">
            급여 정보 <span class="required-star">*</span>
          </label>
          <div class="salary-group">
            <select v-model="form.salary_type" class="select-field" style="flex: 0 0 120px">
              <option value="hourly">시급</option>
              <option value="monthly">월급</option>
            </select>
            <input
              v-model.number="form.salary"
              type="number"
              class="input-field"
              placeholder="금액 입력"
              required
            />
          </div>
        </div>

        <Input
          v-model="form.preferred_qualifications"
          label="우대 사항"
          placeholder="예: 경력 3년 이상"
        />

        <div class="input-wrapper">
          <label class="input-label">상세 설명</label>
          <textarea
            v-model="form.description"
            class="textarea-field"
            placeholder="공고 상세 설명을 입력하세요"
            rows="6"
          ></textarea>
        </div>

        <Input
          v-model="form.address"
          label="주소"
          placeholder="서울시 강남구 테헤란로 123"
          :error="errors.address"
          required
        />

        <div class="form-actions">
          <Button type="submit" :loading="saving" full-width>등록하기</Button>
        </div>
      </form>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useJobPostingStore } from '@/stores/jobPosting'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Input from '@/components/common/Input.vue'
import Button from '@/components/common/Button.vue'

const router = useRouter()
const route = useRoute()
const jobPostingStore = useJobPostingStore()
const showToast = inject('toast')

const isEdit = computed(() => !!route.params.id)

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
  { value: 'etc', label: '기타' },
]

const days = [
  { value: 'monday', label: '월' },
  { value: 'tuesday', label: '화' },
  { value: 'wednesday', label: '수' },
  { value: 'thursday', label: '목' },
  { value: 'friday', label: '금' },
  { value: 'saturday', label: '토' },
  { value: 'sunday', label: '일' },
]

const form = reactive({
  title: '',
  region: '',
  district: '',
  genres: [],
  classes: '',
  work_days: [],
  work_time: '',
  salary_type: 'hourly',
  salary: '',
  preferred_qualifications: '',
  description: '',
  address: '',
  lat: null,
  lng: null,
})

const errors = reactive({})
const saving = ref(false)

const fetchPosting = async () => {
  if (isEdit.value) {
    const result = await jobPostingStore.fetchPostingDetail(route.params.id)
    if (result.success) {
      const posting = result.data
      form.title = posting.title
      form.region = posting.region
      form.district = posting.district
      form.genres = posting.genres || []
      form.classes = posting.classes || ''
      form.work_days = posting.work_days || []
      form.work_time = posting.work_time || ''
      form.salary_type = posting.salary_type || 'hourly'
      form.salary = posting.salary || ''
      form.preferred_qualifications = posting.preferred_qualifications || ''
      form.description = posting.description || ''
      form.address = posting.address || ''
    }
  }
}

const toggleGenre = (genre) => {
  const index = form.genres.indexOf(genre)
  if (index > -1) {
    form.genres.splice(index, 1)
  } else {
    form.genres.push(genre)
  }
}

const toggleDay = (day) => {
  const index = form.work_days.indexOf(day)
  if (index > -1) {
    form.work_days.splice(index, 1)
  } else {
    form.work_days.push(day)
  }
}

const validateForm = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })

  let isValid = true

  if (!form.title) {
    errors.title = '공고 제목을 입력해주세요'
    isValid = false
  }

  if (!form.region) {
    isValid = false
  }

  if (form.genres.length === 0) {
    isValid = false
  }

  if (!form.classes) {
    errors.classes = '담당 수업을 입력해주세요'
    isValid = false
  }

  if (form.work_days.length === 0) {
    isValid = false
  }

  if (!form.work_time) {
    errors.work_time = '근무 시간을 입력해주세요'
    isValid = false
  }

  if (!form.salary || form.salary <= 0) {
    isValid = false
  }

  if (!form.address) {
    errors.address = '주소를 입력해주세요'
    isValid = false
  }

  return isValid
}

const handleSave = async () => {
  if (!validateForm()) {
    showToast('필수 항목을 모두 입력해주세요', 'error')
    return
  }

  saving.value = true
  try {
    let result
    if (isEdit.value) {
      result = await jobPostingStore.updatePosting(route.params.id, form)
    } else {
      result = await jobPostingStore.createPosting(form)
    }

    if (result.success) {
      showToast(
        isEdit.value ? '공고가 수정되었습니다' : '관리자 검토 후 공고가 게시됩니다',
        'success'
      )
      router.push('/academy/postings')
    } else {
      showToast(result.error || '공고 등록에 실패했습니다', 'error')
    }
  } catch (error) {
    showToast('공고 등록에 실패했습니다', 'error')
  } finally {
    saving.value = false
  }
}

const handleBack = () => {
  if (confirm('작성 중인 공고가 있습니다. 나가시겠습니까?')) {
    router.push('/academy/postings')
  }
}

onMounted(() => {
  if (isEdit.value) {
    fetchPosting()
  }
})
</script>

<style scoped>
.posting-edit-page {
  padding: var(--spacing-lg);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-primary);
  padding: var(--spacing-sm);
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  flex: 1;
  text-align: center;
}

.genre-chips,
.day-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.genre-chip,
.day-chip {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: white;
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-full);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.genre-chip:hover,
.day-chip:hover {
  border-color: var(--color-primary);
}

.genre-chip.selected,
.day-chip.selected {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.select-field {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-sm);
  font-size: 16px;
  background-color: white;
  min-height: 48px;
}

.select-field:focus {
  outline: none;
  border-color: var(--color-primary);
  border-width: 2px;
}

.salary-group {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.textarea-field {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
}

.textarea-field:focus {
  outline: none;
  border-color: var(--color-primary);
  border-width: 2px;
}

.form-actions {
  margin-top: var(--spacing-3xl);
}
</style>
