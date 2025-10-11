<template>
  <div class="signup-select-role">
    <div class="signup-select-role__container">
      <!-- 진행 단계 -->
      <div class="signup-select-role__progress">
        <div class="progress-step active">1</div>
        <div class="progress-line"></div>
        <div class="progress-step">2</div>
        <div class="progress-line"></div>
        <div class="progress-step">3</div>
      </div>

      <div class="signup-select-role__header">
        <h1>회원가입</h1>
        <p>어떤 유형으로 가입하시나요?</p>
      </div>

      <!-- 역할 선택 카드 -->
      <div class="signup-select-role__cards">
        <BaseCard
          v-for="role in roles"
          :key="role.value"
          :selected="selectedRole === role.value"
          clickable
          class="role-card"
          @click="selectedRole = role.value"
        >
          <div class="role-card__icon">
            <component :is="role.icon" :size="48" />
          </div>
          <h3 class="role-card__title">{{ role.label }}</h3>
          <p class="role-card__description">{{ role.description }}</p>
        </BaseCard>
      </div>

      <!-- 액션 버튼 -->
      <div class="signup-select-role__actions">
        <BaseButton variant="secondary" @click="handleBack">이전</BaseButton>
        <BaseButton :disabled="!selectedRole" @click="handleNext">다음</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User as UserIcon, Building as BuildingIcon } from 'lucide-vue-next'
import { BaseCard, BaseButton } from '@/components/common'
import { USER_ROLES } from '@/utils/constants'

const router = useRouter()

const selectedRole = ref(null)

const roles = [
  {
    value: USER_ROLES.INSTRUCTOR,
    label: '강사',
    description: '무용 강사로 구직 활동을 하고 싶어요',
    icon: UserIcon,
  },
  {
    value: USER_ROLES.ACADEMY,
    label: '학원',
    description: '학원/기관으로 무용 강사를 구인하고 싶어요',
    icon: BuildingIcon,
  },
]

const handleBack = () => {
  router.push('/login')
}

const handleNext = () => {
  if (!selectedRole.value) return
  
  // 선택한 역할을 쿼리로 전달
  router.push({
    path: '/signup/info',
    query: { role: selectedRole.value },
  })
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.signup-select-role {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-background;
  padding: $spacing-lg;

  &__container {
    width: 100%;
    max-width: 600px;
    background-color: $color-white;
    border-radius: $radius-xl;
    box-shadow: $shadow-card;
    padding: $spacing-3xl $spacing-2xl;

    @include mobile {
      padding: $spacing-2xl $spacing-lg;
    }
  }

  &__progress {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-3xl;

    .progress-step {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: $color-disabled;
      color: $color-white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: $font-weight-semibold;
      font-size: $font-size-body;

      &.active {
        background-color: $color-primary;
      }
    }

    .progress-line {
      width: 60px;
      height: 2px;
      background-color: $color-divider;

      @include mobile {
        width: 40px;
      }
    }
  }

  &__header {
    text-align: center;
    margin-bottom: $spacing-3xl;

    h1 {
      font-size: $font-size-h1;
      margin: 0 0 $spacing-md 0;
    }

    p {
      font-size: $font-size-body;
      color: $color-text-secondary;
      margin: 0;
    }
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-lg;
    margin-bottom: $spacing-3xl;

    @include mobile {
      grid-template-columns: 1fr;
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-md;
  }
}

.role-card {
  text-align: center;
  padding: $spacing-2xl !important;
  transition: all $transition-fast;

  &__icon {
    color: $color-primary;
    margin-bottom: $spacing-lg;
    display: flex;
    justify-content: center;
  }

  &__title {
    font-size: $font-size-h3;
    margin: 0 0 $spacing-md 0;
  }

  &__description {
    font-size: $font-size-body-small;
    color: $color-text-secondary;
    margin: 0;
    line-height: $line-height-relaxed;
  }
}
</style>

