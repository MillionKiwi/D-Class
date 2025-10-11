<template>
  <div class="component-demo">
    <div class="container">
      <h1>공통 컴포넌트 데모</h1>

      <!-- Button 데모 -->
      <section class="demo-section">
        <h2>Buttons</h2>
        <div class="demo-grid">
          <BaseButton @click="handleButtonClick('Primary')">Primary Button</BaseButton>
          <BaseButton variant="secondary" @click="handleButtonClick('Secondary')">
            Secondary Button
          </BaseButton>
          <BaseButton variant="text" @click="handleButtonClick('Text')">Text Button</BaseButton>
          <BaseButton variant="danger" @click="handleButtonClick('Danger')">Danger Button</BaseButton>
          <BaseButton disabled>Disabled Button</BaseButton>
          <BaseButton :loading="isLoading" @click="handleLoading">Loading Button</BaseButton>
          <BaseButton block>Block Button</BaseButton>
        </div>
      </section>

      <!-- Input 데모 -->
      <section class="demo-section">
        <h2>Inputs</h2>
        <div class="demo-form">
          <BaseInput
            v-model="formData.email"
            label="이메일"
            type="email"
            placeholder="이메일을 입력하세요"
            required
          />

          <BaseInput
            v-model="formData.name"
            label="이름"
            placeholder="이름을 입력하세요"
            required
            :error="!!errorMessage"
            :errorMessage="errorMessage"
          />

          <BaseInput
            v-model="formData.bio"
            label="자기소개"
            placeholder="자기소개를 입력하세요"
            textarea
            :maxlength="200"
            :showCounter="true"
          />

          <BaseInput
            v-model="formData.readonly"
            label="읽기 전용"
            readonly
            :modelValue="'읽기 전용 필드입니다'"
          />
        </div>
      </section>

      <!-- Card 데모 -->
      <section class="demo-section">
        <h2>Cards</h2>
        <div class="demo-grid">
          <BaseCard>
            <h3>기본 카드</h3>
            <p>카드 컨텐츠입니다.</p>
          </BaseCard>

          <BaseCard clickable @click="handleCardClick">
            <h3>클릭 가능한 카드</h3>
            <p>클릭해보세요!</p>
          </BaseCard>

          <BaseCard :selected="isCardSelected" clickable @click="toggleCard">
            <h3>선택 가능한 카드</h3>
            <p>{{ isCardSelected ? '선택됨' : '선택 안됨' }}</p>
          </BaseCard>
        </div>
      </section>

      <!-- Badge 데모 -->
      <section class="demo-section">
        <h2>Badges</h2>
        <div class="demo-flex">
          <BaseBadge>Default</BaseBadge>
          <BaseBadge variant="primary">Primary</BaseBadge>
          <BaseBadge variant="success">인증 완료</BaseBadge>
          <BaseBadge variant="warning">대기중</BaseBadge>
          <BaseBadge variant="error">반려</BaseBadge>
          <BaseBadge variant="info">정보</BaseBadge>
          <BaseBadge variant="primary" size="small">Small</BaseBadge>
          <BaseBadge variant="error" dot>3</BaseBadge>
        </div>
      </section>

      <!-- Modal 데모 -->
      <section class="demo-section">
        <h2>Modal</h2>
        <BaseButton @click="openModal">모달 열기</BaseButton>

        <BaseModal
          v-model:isOpen="isModalOpen"
          title="확인 모달"
          @confirm="handleModalConfirm"
          @cancel="handleModalCancel"
        >
          <p>이것은 모달 컨텐츠입니다.</p>
          <p>확인 또는 취소를 선택하세요.</p>
        </BaseModal>
      </section>

      <!-- Toast 데모 -->
      <section class="demo-section">
        <h2>Toast</h2>
        <div class="demo-flex">
          <BaseButton @click="showToast('success')">Success Toast</BaseButton>
          <BaseButton @click="showToast('error')">Error Toast</BaseButton>
          <BaseButton @click="showToast('warning')">Warning Toast</BaseButton>
          <BaseButton @click="showToast('info')">Info Toast</BaseButton>
        </div>
      </section>

      <!-- Loading 데모 -->
      <section class="demo-section">
        <h2>Loading</h2>
        <div class="demo-grid">
          <div>
            <h3>Spinner</h3>
            <BaseLoading type="spinner" inline />
          </div>
          <div>
            <h3>Skeleton</h3>
            <BaseLoading type="skeleton" inline :lines="3" />
          </div>
        </div>
        <BaseButton @click="toggleFullscreenLoading">Fullscreen Loading 토글</BaseButton>
        <BaseLoading v-if="showFullscreenLoading" type="spinner" fullscreen text="로딩중..." />
      </section>

      <!-- Empty State 데모 -->
      <section class="demo-section">
        <h2>Empty State</h2>
        <BaseEmptyState
          title="데이터가 없습니다"
          description="아직 등록된 항목이 없습니다. 새로운 항목을 추가해보세요."
        >
          <template #action>
            <BaseButton @click="handleEmptyAction">항목 추가하기</BaseButton>
          </template>
        </BaseEmptyState>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import {
  BaseButton,
  BaseInput,
  BaseCard,
  BaseBadge,
  BaseModal,
  BaseLoading,
  BaseEmptyState,
} from '@/components/common'

const { success, error, warning, info } = useToast()

// Button 상태
const isLoading = ref(false)

// Form 데이터
const formData = ref({
  email: '',
  name: '',
  bio: '',
  readonly: '읽기 전용 필드입니다',
})
const errorMessage = ref('')

// Card 상태
const isCardSelected = ref(false)

// Modal 상태
const isModalOpen = ref(false)

// Loading 상태
const showFullscreenLoading = ref(false)

// 핸들러 함수
const handleButtonClick = (type) => {
  success(`${type} 버튼이 클릭되었습니다!`)
}

const handleLoading = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    success('로딩 완료!')
  }, 2000)
}

const handleCardClick = () => {
  info('카드가 클릭되었습니다!')
}

const toggleCard = () => {
  isCardSelected.value = !isCardSelected.value
}

const openModal = () => {
  isModalOpen.value = true
}

const handleModalConfirm = () => {
  success('확인 버튼이 클릭되었습니다!')
  isModalOpen.value = false
}

const handleModalCancel = () => {
  info('취소 버튼이 클릭되었습니다!')
}

const showToast = (type) => {
  const messages = {
    success: '성공적으로 처리되었습니다!',
    error: '오류가 발생했습니다.',
    warning: '주의가 필요합니다.',
    info: '정보 메시지입니다.',
  }

  const toastFunctions = { success, error, warning, info }
  toastFunctions[type](messages[type])
}

const toggleFullscreenLoading = () => {
  showFullscreenLoading.value = !showFullscreenLoading.value
  if (showFullscreenLoading.value) {
    setTimeout(() => {
      showFullscreenLoading.value = false
    }, 3000)
  }
}

const handleEmptyAction = () => {
  success('항목 추가 버튼이 클릭되었습니다!')
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.component-demo {
  padding: $spacing-2xl 0;
  min-height: 100vh;

  h1 {
    margin-bottom: $spacing-2xl;
    text-align: center;
  }

  .demo-section {
    margin-bottom: $spacing-3xl;
    padding: $spacing-xl;
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;

    h2 {
      margin-bottom: $spacing-xl;
      padding-bottom: $spacing-md;
      border-bottom: 2px solid $color-divider;
    }

    h3 {
      margin-bottom: $spacing-md;
    }
  }

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-lg;
  }

  .demo-flex {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-md;
  }

  .demo-form {
    max-width: 600px;
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }
}
</style>

