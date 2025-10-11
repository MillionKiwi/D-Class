<template>
  <AcademyLayout>
    <div class="academy-edit">
      <!-- 헤더 -->
      <div class="academy-edit__header">
        <button class="back-button" @click="handleBack">
          <ArrowLeftIcon :size="24" />
        </button>
        <h1>학원 정보 관리</h1>
        <BaseButton variant="text" :disabled="!hasChanges" @click="handleSave">저장</BaseButton>
      </div>

      <!-- 대표 이미지 -->
      <section class="academy-edit__section">
        <div class="academy-image">
          <div class="academy-image__preview">
            <img v-if="imageUrl" :src="imageUrl" alt="학원 대표 이미지" />
            <BuildingIcon v-else :size="64" />
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
            이미지 변경
          </BaseButton>
        </div>
      </section>

      <!-- 기본 정보 -->
      <section class="academy-edit__section">
        <h3 class="section-title">기본 정보</h3>

        <div class="form-fields">
          <BaseInput
            v-model="formData.name"
            label="학원명"
            placeholder="학원명을 입력하세요"
            required
            :error="!!errors.name"
            :errorMessage="errors.name"
          />

          <BaseInput
            v-model="formData.businessName"
            label="사업자명"
            readonly
            hint="사업자명은 변경할 수 없습니다"
          />

          <div class="form-field">
            <label class="form-label">
              주소 <span class="required">*</span>
            </label>
            <BaseInput
              v-model="formData.address"
              placeholder="주소를 검색하세요"
              readonly
              :error="!!errors.address"
              :errorMessage="errors.address"
              @click="handleAddressSearch"
            />
          </div>

          <BaseInput
            v-model="formData.phone"
            type="tel"
            label="연락처"
            placeholder="02-1234-5678"
            required
            :error="!!errors.phone"
            :errorMessage="errors.phone"
          />

          <BaseInput v-model="formData.email" type="email" label="이메일" readonly />
        </div>
      </section>

      <!-- 운영 정보 -->
      <section class="academy-edit__section">
        <h3 class="section-title">운영 정보</h3>

        <div class="form-fields">
          <BaseInput
            v-model="formData.operatingHours"
            label="운영 시간"
            placeholder="평일 10:00 - 22:00"
          />

          <div class="form-field">
            <label class="form-label">주요 장르</label>
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
          </div>
        </div>
      </section>

      <!-- 학원 소개 -->
      <section class="academy-edit__section">
        <h3 class="section-title">학원 소개</h3>
        <BaseInput
          v-model="formData.description"
          textarea
          placeholder="학원을 소개해주세요"
          :maxlength="1000"
          :showCounter="true"
          :rows="8"
        />
      </section>

      <!-- 편의시설 -->
      <section class="academy-edit__section">
        <h3 class="section-title">편의시설</h3>
        <div class="facility-chips">
          <button
            v-for="facility in facilities"
            :key="facility.value"
            type="button"
            :class="['facility-chip', { selected: formData.facilities.includes(facility.value) }]"
            @click="toggleFacility(facility.value)"
          >
            <component :is="facility.icon" :size="16" />
            {{ facility.label }}
          </button>
        </div>
      </section>

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
  </AcademyLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft as ArrowLeftIcon,
  Building as BuildingIcon,
  Camera as CameraIcon,
  Star as StarIcon,
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
  UserCheck as UserCheckIcon,
  ShieldCheck as ShieldCheckIcon,
  Bell as BellIcon,
  Settings as SettingsIcon,
  HelpCircle as HelpCircleIcon,
  LogOut as LogOutIcon,
  ChevronRight as ChevronRightIcon,
  Car as CarIcon,
  Droplet as DropletIcon,
  Lock as LockIcon,
  Wifi as WifiIcon,
} from 'lucide-vue-next'
import { AcademyLayout } from '@/components/layout'
import { BaseButton, BaseInput, BaseModal, BaseBadge } from '@/components/common'
import { useProfileStore } from '@/stores'
import { DANCE_GENRES } from '@/utils/constants'
import { createImageUrl } from '@/utils/helpers'

const router = useRouter()
const profileStore = useProfileStore()

const fileInput = ref(null)
const imageUrl = ref(null)
const originalData = ref(null)
const showConfirmModal = ref(false)

const formData = reactive({
  name: '',
  businessName: '',
  address: '',
  phone: '',
  email: '',
  operatingHours: '',
  genres: [],
  description: '',
  facilities: [],
})

const errors = reactive({
  name: '',
  address: '',
  phone: '',
})

const facilities = [
  { value: 'parking', label: '주차', icon: CarIcon },
  { value: 'shower', label: '샤워실', icon: DropletIcon },
  { value: 'locker', label: '락커', icon: LockIcon },
  { value: 'wifi', label: 'WiFi', icon: WifiIcon },
]

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

const toggleFacility = (facility) => {
  const index = formData.facilities.indexOf(facility)
  if (index > -1) {
    formData.facilities.splice(index, 1)
  } else {
    formData.facilities.push(facility)
  }
}

const handleImageSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 미리보기
  imageUrl.value = createImageUrl(file)

  // 업로드
  await profileStore.uploadProfileImage(file)
}

const handleAddressSearch = () => {
  // TODO: 주소 검색 API 연동
  alert('주소 검색 기능은 준비 중입니다.')
}

const handleSave = async () => {
  if (!hasChanges.value) return

  // 검증
  if (!formData.name) {
    errors.name = '학원명을 입력해주세요'
    return
  }
  if (!formData.address) {
    errors.address = '주소를 입력해주세요'
    return
  }

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
      businessName: profile.businessName || '',
      address: profile.address || '',
      phone: profile.phone,
      email: profile.email,
      operatingHours: profile.operatingHours || '',
      genres: profile.genres || [],
      description: profile.description || '',
      facilities: profile.facilities || [],
    })
    imageUrl.value = profile.image
    originalData.value = JSON.parse(JSON.stringify(formData))
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.academy-edit {
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

.academy-image {
  @include flex-center;
  flex-direction: column;
  gap: $spacing-lg;

  &__preview {
    width: 160px;
    height: 160px;
    border-radius: $radius-lg;
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

.form-fields {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.form-field {
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
}

.genre-chips,
.facility-chips {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.genre-chip,
.facility-chip {
  padding: $spacing-sm $spacing-md;
  border: 1px solid $color-divider;
  border-radius: $radius-full;
  background-color: $color-white;
  color: $color-text-primary;
  font-size: $font-size-body-small;
  cursor: pointer;
  transition: all $transition-fast;
  display: flex;
  align-items: center;
  gap: $spacing-xs;

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
</style>

