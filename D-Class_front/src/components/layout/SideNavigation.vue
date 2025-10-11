<template>
  <aside class="side-navigation">
    <div class="side-navigation__header">
      <router-link to="/admin" class="side-navigation__logo">
        <h2>D-Class Admin</h2>
      </router-link>
    </div>

    <nav class="side-navigation__nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="side-navigation__item"
        :class="{ 'side-navigation__item--active': isActive(item.path) }"
      >
        <component :is="item.icon" :size="20" />
        <span class="side-navigation__label">{{ item.label }}</span>
        <BaseBadge
          v-if="item.badge && item.badge > 0"
          variant="error"
          size="small"
          dot
          class="side-navigation__badge"
        >
          {{ item.badge }}
        </BaseBadge>
      </router-link>
    </nav>

    <div class="side-navigation__footer">
      <div class="side-navigation__user">
        <UserIcon :size="20" />
        <span>관리자</span>
      </div>
      <button class="side-navigation__logout" @click="handleLogout">
        <LogOutIcon :size="20" />
        <span>로그아웃</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard as DashboardIcon,
  Users as UsersIcon,
  ShieldCheck as ShieldCheckIcon,
  Briefcase as BriefcaseIcon,
  Star as StarIcon,
  MessageSquare as MessageIcon,
  User as UserIcon,
  LogOut as LogOutIcon,
} from 'lucide-vue-next'
import { BaseBadge } from '@/components/common'

const props = defineProps({
  pendingVerifications: {
    type: Number,
    default: 0,
  },
})

const route = useRoute()
const router = useRouter()

// 관리자 네비게이션 아이템
const navItems = computed(() => [
  { path: '/admin/dashboard', label: '대시보드', icon: DashboardIcon },
  { path: '/admin/members', label: '회원 관리', icon: UsersIcon },
  {
    path: '/admin/verifications',
    label: '인증 관리',
    icon: ShieldCheckIcon,
    badge: props.pendingVerifications,
  },
  { path: '/admin/jobs', label: '공고 관리', icon: BriefcaseIcon },
  { path: '/admin/reviews', label: '리뷰 관리', icon: StarIcon },
  { path: '/admin/inquiries', label: '문의/신고 관리', icon: MessageIcon },
])

const isActive = (path) => {
  return route.path.startsWith(path)
}

const handleLogout = () => {
  // TODO: 로그아웃 로직 구현
  router.push('/login')
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.side-navigation {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  background-color: $color-white;
  border-right: 1px solid $color-divider;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  @include custom-scrollbar;

  &__header {
    padding: $spacing-xl;
    border-bottom: 1px solid $color-divider;
  }

  &__logo {
    text-decoration: none;
    color: $color-primary;

    h2 {
      font-size: $font-size-h2;
      font-weight: $font-weight-bold;
      margin: 0;
    }
  }

  &__nav {
    flex: 1;
    padding: $spacing-lg 0;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md $spacing-xl;
    text-decoration: none;
    color: $color-text-primary;
    transition: all $transition-fast;
    position: relative;

    &:hover {
      background-color: $color-background;
      color: $color-primary;
    }

    &--active {
      background-color: rgba($color-primary, 0.1);
      color: $color-primary;
      font-weight: $font-weight-semibold;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: $color-primary;
      }
    }
  }

  &__label {
    flex: 1;
    font-size: $font-size-body;
  }

  &__badge {
    margin-left: auto;
  }

  &__footer {
    padding: $spacing-lg;
    border-top: 1px solid $color-divider;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-md;
    margin-bottom: $spacing-sm;
    background-color: $color-background;
    border-radius: $radius-md;
    font-size: $font-size-body-small;
    color: $color-text-primary;
  }

  &__logout {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    width: 100%;
    padding: $spacing-md;
    background: none;
    border: none;
    color: $color-text-secondary;
    font-size: $font-size-body-small;
    cursor: pointer;
    border-radius: $radius-md;
    transition: all $transition-fast;

    &:hover {
      background-color: $color-background;
      color: $color-error;
    }
  }

  // 태블릿 이하에서는 숨김
  @include mobile {
    display: none;
  }

  @include tablet {
    display: none;
  }
}
</style>

