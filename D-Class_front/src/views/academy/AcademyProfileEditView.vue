<template>
  <AppLayout>
    <div class="academy-profile-edit-page page-container">
      <div class="page-header">
        <button class="back-btn" @click="handleBack">←</button>
        <h1 class="page-title">학원 정보 관리</h1>
        <Button @click="handleSave" :loading="saving">저장</Button>
      </div>

      <form @submit.prevent="handleSave" class="profile-form">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img v-if="form.academy_image" :src="form.academy_image" alt="학원 이미지" />
            <div v-else class="avatar-placeholder">🏢</div>
            <button type="button" class="avatar-change-btn" @click="handleImageChange">
              📷
            </button>
          </div>
        </div>

        <Input v-model="form.academy_name" label="학원명" required />
        <Input v-model="form.name" label="담당자명" disabled />
        <Input v-model="form.email" type="email" label="이메일" disabled />
        <Input v-model="form.address" label="주소" placeholder="주소를 입력하세요" required />
        <Input v-model="form.phone" type="tel" label="연락처" placeholder="02-1234-5678" />

        <Input v-model="form.operating_hours" label="운영 시간" placeholder="예: 09:00-18:00" />

        <div class="input-wrapper">
          <label class="input-label">
            주요 장르 <span class="required-star">*</span>
          </label>
          <div class="genre-chips">
            <span
              v-for="genre in genreOptions"
              :key="genre.value"
              :class="['genre-chip', { selected: form.main_genres.includes(genre.value) }]"
              @click="toggleGenre(genre.value)"
            >
              {{ genre.label }}
            </span>
          </div>
        </div>

        <div class="input-wrapper">
          <label class="input-label">학원 소개</label>
          <textarea
            v-model="form.description"
            class="textarea-field"
            placeholder="학원 소개를 입력하세요 (최대 1000자)"
            maxlength="1000"
            rows="6"
          ></textarea>
          <span class="char-count">{{ form.description.length }}/1000</span>
        </div>

        <div class="form-actions">
          <Button type="submit" :loading="saving" full-width>저장</Button>
        </div>
      </form>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Input from '@/components/common/Input.vue'
import Button from '@/components/common/Button.vue'

const router = useRouter()
const authStore = useAuthStore()
const showToast = inject('toast')

const genreOptions = [
  { value: 'ballet', label: '발레' },
  { value: 'contemporary', label: '현대무용' },
  { value: 'korean', label: '한국무용' },
  { value: 'jazz', label: '재즈댄스' },
  { value: 'hiphop', label: '힙합' },
  { value: 'ballroom', label: '볼룸댄스' },
]

const form = reactive({
  academy_name: '',
  name: '',
  email: '',
  address: '',
  phone: '',
  operating_hours: '',
  main_genres: [],
  description: '',
  academy_image: null,
})

const saving = ref(false)
const hasChanges = ref(false)

const fetchProfile = async () => {
  const user = authStore.user
  if (user) {
    form.academy_name = user.academy_name || ''
    form.name = user.name || ''
    form.email = user.email || ''
    form.address = user.address || ''
    form.phone = user.phone || ''
    form.operating_hours = user.operating_hours || ''
    form.main_genres = user.main_genres || []
    form.description = user.description || ''
    form.academy_image = user.academy_image || null
  }
}

const toggleGenre = (genre) => {
  const index = form.main_genres.indexOf(genre)
  if (index > -1) {
    form.main_genres.splice(index, 1)
  } else {
    form.main_genres.push(genre)
  }
  hasChanges.value = true
}

const handleImageChange = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        form.academy_image = event.target.result
        hasChanges.value = true
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

const handleSave = async () => {
  saving.value = true
  try {
    const formData = new FormData()
    formData.append('academy_name', form.academy_name)
    formData.append('address', form.address)
    formData.append('phone', form.phone)
    formData.append('operating_hours', form.operating_hours)
    formData.append('main_genres', JSON.stringify(form.main_genres))
    if (form.description) {
      formData.append('description', form.description)
    }
    // 이미지는 실제 파일 업로드 구현 필요

    const response = await apiClient.patch(API_ENDPOINTS.USERS.ACADEMY, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    showToast('학원 정보가 저장되었습니다', 'success')
    await authStore.fetchCurrentUser()
    hasChanges.value = false
    router.push('/academy/manage')
  } catch (error) {
    showToast('저장 중 오류가 발생했습니다', 'error')
  } finally {
    saving.value = false
  }
}

const handleBack = () => {
  if (hasChanges.value) {
    if (confirm('저장하지 않은 변경사항이 있습니다. 나가시겠습니까?')) {
      router.push('/academy/manage')
    }
  } else {
    router.push('/academy/manage')
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.academy-profile-edit-page {
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

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-3xl);
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-divider);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 60px;
}

.avatar-change-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-primary);
  border: 2px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.genre-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.genre-chip {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: white;
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-full);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.genre-chip:hover {
  border-color: var(--color-primary);
}

.genre-chip.selected {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.textarea-field {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 150px;
}

.textarea-field:focus {
  outline: none;
  border-color: var(--color-primary);
  border-width: 2px;
}

.char-count {
  display: block;
  text-align: right;
  margin-top: var(--spacing-xs);
  font-size: 12px;
  color: var(--color-text-secondary);
}

.form-actions {
  margin-top: var(--spacing-3xl);
}
</style>
