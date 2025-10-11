<template>
  <InstructorLayout>
    <div class="profile-edit">
      <!-- 헤더 -->
      <div class="profile-edit__header">
        <button class="back-button" @click="handleBack">
          <ArrowLeftIcon :size="24" />
        </button>
        <h1>프로필 관리</h1>
        <BaseButton variant="text" :disabled="!hasChanges" @click="handleSave">저장</BaseButton>
      </div>

      <!-- 프로필 사진 -->
      <section class="profile-edit__section">
        <div class="profile-photo">
          <div class="profile-photo__preview">
            <img v-if="profileImageUrl" :src="profileImageUrl" alt="프로필 사진" />
            <UserIcon v-else :size="64" />
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleImageSelect"
          />
          <BaseButton variant="secondary" @click="fileInput?.click()">
            <CameraIcon :size="20" />
            사진 변경
          </BaseButton>
        </div>
      </section>

      <!-- 기본 정보 -->
      <section class="profile-edit__section">
        <h3 class="section-title">기본 정보</h3>

        <div class="form-fields">
          <BaseInput
            v-model="formData.name"
            label="이름"
            readonly
            hint="이름은 변경할 수 없습니다"
          />

          <BaseInput
            v-model="formData.phone"
            type="tel"
            label="연락처"
            placeholder="010-1234-5678"
            :error="!!errors.phone"
            :errorMessage="errors.phone"
          />

          <BaseInput v-model="formData.email" type="email" label="이메일" readonly />
        </div>
      </section>

      <!-- 전문 분야 -->
      <section class="profile-edit__section">
        <h3 class="section-title">전문 분야</h3>
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
      </section>

      <!-- 자기소개 -->
      <section class="profile-edit__section">
        <h3 class="section-title">자기소개</h3>
        <BaseInput
          v-model="formData.bio"
          textarea
          placeholder="자신의 경력과 강점을 소개해주세요"
          :maxlength="500"
          :showCounter="true"
          :rows="6"
        />
      </section>

      <!-- 경력 -->
      <section class="profile-edit__section">
        <div class="section-header">
          <h3 class="section-title">경력</h3>
          <BaseButton variant="text" @click="showCareerModal = true">
            <PlusIcon :size="16" />
            경력 추가
          </BaseButton>
        </div>

        <div v-if="formData.careers.length > 0" class="item-list">
          <div v-for="(career, index) in formData.careers" :key="index" class="item-card">
            <div class="item-card__content">
              <h4>{{ career.company }}</h4>
              <p class="period">{{ career.period }}</p>
              <p class="description">{{ career.description }}</p>
            </div>
            <div class="item-card__actions">
              <button @click="editCareer(index)">
                <EditIcon :size="16" />
              </button>
              <button @click="deleteCareer(index)">
                <TrashIcon :size="16" />
              </button>
            </div>
          </div>
        </div>

        <BaseEmptyState
          v-else
          title="등록된 경력이 없습니다"
          description="경력을 추가하여 프로필을 완성해보세요"
        />
      </section>

      <!-- 학력 -->
      <section class="profile-edit__section">
        <div class="section-header">
          <h3 class="section-title">학력</h3>
          <BaseButton variant="text" @click="showEducationModal = true">
            <PlusIcon :size="16" />
            학력 추가
          </BaseButton>
        </div>

        <div v-if="formData.educations.length > 0" class="item-list">
          <div v-for="(education, index) in formData.educations" :key="index" class="item-card">
            <div class="item-card__content">
              <h4>{{ education.school }}</h4>
              <p class="period">{{ education.period }}</p>
              <p class="description">{{ education.major }}</p>
            </div>
            <div class="item-card__actions">
              <button @click="editEducation(index)">
                <EditIcon :size="16" />
              </button>
              <button @click="deleteEducation(index)">
                <TrashIcon :size="16" />
              </button>
            </div>
          </div>
        </div>

        <BaseEmptyState
          v-else
          title="등록된 학력이 없습니다"
          description="학력을 추가하여 프로필을 완성해보세요"
        />
      </section>

      <!-- 경력 추가 모달 -->
      <BaseModal
        v-model:isOpen="showCareerModal"
        title="경력 추가"
        @confirm="addCareer"
        @cancel="cancelCareerModal"
      >
        <div class="modal-form">
          <BaseInput v-model="careerForm.company" label="기관명" required />
          <BaseInput v-model="careerForm.period" label="기간" placeholder="2020.01 - 2023.12" required />
          <BaseInput
            v-model="careerForm.description"
            label="설명"
            textarea
            :rows="3"
            placeholder="담당 업무 및 역할"
          />
        </div>
      </BaseModal>

      <!-- 학력 추가 모달 -->
      <BaseModal
        v-model:isOpen="showEducationModal"
        title="학력 추가"
        @confirm="addEducation"
        @cancel="cancelEducationModal"
      >
        <div class="modal-form">
          <BaseInput v-model="educationForm.school" label="학교명" required />
          <BaseInput v-model="educationForm.period" label="기간" placeholder="2016.03 - 2020.02" required />
          <BaseInput v-model="educationForm.major" label="전공" placeholder="무용학과" />
        </div>
      </BaseModal>

      <!-- 변경사항 확인 모달 -->
      <BaseModal
        v-model:isOpen="showConfirmModal"
        title="저장하지 않은 변경사항"
        confirmText="나가기"
        cancelText="계속 작성"
        @confirm="confirmLeave"
        @cancel="showConfirmModal = false"
      >
        <p>저장하지 않은 변경사항이 있습니다.</p>
        <p>정말 나가시겠습니까?</p>
      </BaseModal>
    </div>
  </InstructorLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft as ArrowLeftIcon,
  User as UserIcon,
  Camera as CameraIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
} from 'lucide-vue-next'
import { InstructorLayout } from '@/components/layout'
import { BaseButton, BaseInput, BaseModal, BaseLoading, BaseEmptyState } from '@/components/common'
import { useProfileStore } from '@/stores'
import { DANCE_GENRES } from '@/utils/constants'
import { createImageUrl } from '@/utils/helpers'

const router = useRouter()
const profileStore = useProfileStore()

const fileInput = ref(null)
const profileImageUrl = ref(null)
const originalData = ref(null)
const showCareerModal = ref(false)
const showEducationModal = ref(false)
const showConfirmModal = ref(false)

const formData = reactive({
  name: '',
  phone: '',
  email: '',
  genres: [],
  bio: '',
  careers: [],
  educations: [],
})

const careerForm = reactive({
  company: '',
  period: '',
  description: '',
})

const educationForm = reactive({
  school: '',
  period: '',
  major: '',
})

const errors = reactive({
  phone: '',
})

const hasChanges = computed(() => {
  return JSON.stringify(formData) !== JSON.stringify(originalData.value)
})

const toggleGenre = (genre) => {
  const index = formData.genres.indexOf(genre)
  if (index > -1) {
    formData.genres.splice(index, 1)
  } else {
    formData.genres.push(genre)
  }
}

const handleImageSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 미리보기
  profileImageUrl.value = createImageUrl(file)

  // 업로드
  await profileStore.uploadProfileImage(file)
}

const addCareer = () => {
  if (!careerForm.company || !careerForm.period) return

  formData.careers.push({ ...careerForm })
  cancelCareerModal()
}

const cancelCareerModal = () => {
  showCareerModal.value = false
  careerForm.company = ''
  careerForm.period = ''
  careerForm.description = ''
}

const editCareer = (index) => {
  const career = formData.careers[index]
  careerForm.company = career.company
  careerForm.period = career.period
  careerForm.description = career.description
  formData.careers.splice(index, 1)
  showCareerModal.value = true
}

const deleteCareer = (index) => {
  formData.careers.splice(index, 1)
}

const addEducation = () => {
  if (!educationForm.school || !educationForm.period) return

  formData.educations.push({ ...educationForm })
  cancelEducationModal()
}

const cancelEducationModal = () => {
  showEducationModal.value = false
  educationForm.school = ''
  educationForm.period = ''
  educationForm.major = ''
}

const editEducation = (index) => {
  const education = formData.educations[index]
  educationForm.school = education.school
  educationForm.period = education.period
  educationForm.major = education.major
  formData.educations.splice(index, 1)
  showEducationModal.value = true
}

const deleteEducation = (index) => {
  formData.educations.splice(index, 1)
}

const handleSave = async () => {
  if (!hasChanges.value) return

  await profileStore.updateProfile(formData)
  originalData.value = JSON.parse(JSON.stringify(formData))
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

onMounted(async () => {
  const result = await profileStore.fetchProfile()
  if (result.success) {
    const profile = result.data
    Object.assign(formData, {
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      genres: profile.genres || [],
      bio: profile.bio || '',
      careers: profile.careers || [],
      educations: profile.educations || [],
    })
    profileImageUrl.value = profile.profileImage
    originalData.value = JSON.parse(JSON.stringify(formData))
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.profile-edit {
  padding: 0;
  padding-bottom: $spacing-2xl;

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

  &__section {
    background-color: $color-white;
    padding: $spacing-xl;
    margin-bottom: $spacing-md;
    border-bottom: 8px solid $color-background;
  }
}

.profile-photo {
  @include flex-center;
  flex-direction: column;
  gap: $spacing-lg;

  &__preview {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    background-color: $color-background;
    @include flex-center;
    color: $color-text-secondary;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.section-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  margin: 0 0 $spacing-lg 0;
}

.section-header {
  @include flex-between;
  margin-bottom: $spacing-lg;

  .section-title {
    margin: 0;
  }
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
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

.item-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.item-card {
  @include card-style;
  @include flex-between;
  gap: $spacing-lg;

  &__content {
    flex: 1;

    h4 {
      font-size: $font-size-body;
      font-weight: $font-weight-semibold;
      margin: 0 0 $spacing-xs 0;
    }

    .period {
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      margin: 0 0 $spacing-sm 0;
    }

    .description {
      font-size: $font-size-body-small;
      color: $color-text-primary;
      margin: 0;
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-sm;

    button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background-color: $color-background;
      border-radius: $radius-sm;
      color: $color-text-secondary;
      cursor: pointer;
      transition: all $transition-fast;

      &:hover {
        background-color: $color-primary;
        color: $color-white;
      }

      &:last-child:hover {
        background-color: $color-error;
      }
    }
  }
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}
</style>

