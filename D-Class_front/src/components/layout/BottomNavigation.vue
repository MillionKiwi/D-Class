<template>
  <nav class="bottom-navigation">
    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="bottom-navigation__item"
      :class="{ 'bottom-navigation__item--active': isActive(item.path) }"
    >
      <component :is="item.icon" :size="24" />
      <span class="bottom-navigation__label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Home as HomeIcon,
  FileText as FileTextIcon,
  Heart as HeartIcon,
  User as UserIcon,
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
  Star as StarIcon,
  Building as BuildingIcon,
} from 'lucide-vue-next'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['instructor', 'academy'].includes(value),
  },
})

const route = useRoute()

// 역할별 네비게이션 아이템
const navItems = computed(() => {
  if (props.type === 'instructor') {
    // 강사: 홈(공고 목록), 지원 현황, 찜한 공고, 마이페이지
    return [
      { path: '/instructor/jobs', label: '홈', icon: HomeIcon },
      { path: '/instructor/applications', label: '지원 현황', icon: FileTextIcon },
      { path: '/instructor/favorites', label: '찜한 공고', icon: HeartIcon },
      { path: '/instructor/profile', label: '마이페이지', icon: UserIcon },
    ]
  } else if (props.type === 'academy') {
    // 학원: 공고 관리, 지원자 관리, 리뷰 관리, 학원 관리
    return [
      { path: '/academy/jobs', label: '공고 관리', icon: BriefcaseIcon },
      { path: '/academy/applicants', label: '지원자 관리', icon: UsersIcon },
      { path: '/academy/reviews', label: '리뷰 관리', icon: StarIcon },
      { path: '/academy/profile', label: '학원 관리', icon: BuildingIcon },
    ]
  }
  return []
})

const isActive = (path) => {
  return route.path.startsWith(path)
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $z-index-fixed;
  display: flex;
  height: $nav-height;
  background-color: $color-white;
  border-top: 1px solid $color-divider;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    text-decoration: none;
    color: $color-text-secondary;
    transition: all $transition-fast;
    @include touch-target;

    &:hover {
      background-color: rgba($color-primary, 0.05);
    }

    &:active {
      transform: scale(0.95);
    }

    &--active {
      color: $color-primary;

      .bottom-navigation__label {
        font-weight: $font-weight-semibold;
      }
    }
  }

  &__label {
    font-size: $font-size-caption;
    line-height: 1;
  }

  // 데스크톱에서는 숨김
  @include desktop {
    display: none;
  }
}
</style>

