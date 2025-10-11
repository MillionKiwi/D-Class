<template>
  <header class="app-header">
    <div class="app-header__container">
      <!-- 좌측: 로고 -->
      <div class="app-header__left">
        <router-link to="/" class="app-header__logo">
          <h1>D-Class</h1>
        </router-link>
      </div>

      <!-- 중앙: 제목 (선택적) -->
      <div v-if="title" class="app-header__center">
        <h2>{{ title }}</h2>
      </div>

      <!-- 우측: 액션 버튼들 -->
      <div class="app-header__right">
        <slot name="actions">
          <!-- 검색 아이콘 (강사) -->
          <button
            v-if="showSearch"
            class="app-header__icon-btn"
            @click="handleSearch"
            aria-label="검색"
          >
            <SearchIcon :size="24" />
          </button>

          <!-- 새 공고 등록 (학원) -->
          <button
            v-if="showAddJob"
            class="app-header__icon-btn"
            @click="handleAddJob"
            aria-label="새 공고 등록"
          >
            <PlusIcon :size="24" />
          </button>

          <!-- 알림 아이콘 -->
          <button
            v-if="showNotification"
            class="app-header__icon-btn app-header__notification"
            @click="handleNotification"
            aria-label="알림"
          >
            <BellIcon :size="24" />
            <span v-if="notificationCount > 0" class="app-header__notification-badge">
              {{ notificationCount > 99 ? '99+' : notificationCount }}
            </span>
          </button>
        </slot>
      </div>
    </div>
  </header>
</template>

<script setup>
import { Bell as BellIcon, Search as SearchIcon, Plus as PlusIcon } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  showSearch: {
    type: Boolean,
    default: false,
  },
  showAddJob: {
    type: Boolean,
    default: false,
  },
  showNotification: {
    type: Boolean,
    default: true,
  },
  notificationCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['search', 'add-job', 'notification'])
const router = useRouter()

const handleSearch = () => {
  emit('search')
  router.push('/search')
}

const handleAddJob = () => {
  emit('add-job')
  router.push('/academy/jobs/create')
}

const handleNotification = () => {
  emit('notification')
  router.push('/notifications')
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.app-header {
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
  background-color: $color-white;
  border-bottom: 1px solid $color-divider;
  height: $header-height;

  &__container {
    @include flex-between;
    max-width: 100%;
    height: 100%;
    padding: 0 $spacing-lg;
  }

  &__left,
  &__right {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    flex: 1;
  }

  &__right {
    justify-content: flex-end;
  }

  &__center {
    flex: 1;
    text-align: center;

    h2 {
      font-size: $font-size-h3;
      font-weight: $font-weight-semibold;
      margin: 0;
    }
  }

  &__logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: $color-primary;
    transition: color $transition-fast;

    &:hover {
      color: $color-primary-dark;
    }

    h1 {
      font-size: $font-size-h2;
      font-weight: $font-weight-bold;
      margin: 0;
    }
  }

  &__icon-btn {
    @include touch-target;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: $color-text-primary;
    cursor: pointer;
    border-radius: $radius-sm;
    transition: all $transition-fast;

    &:hover {
      background-color: $color-background;
      color: $color-primary;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &__notification {
    position: relative;
  }

  &__notification-badge {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    background-color: $color-accent;
    color: $color-white;
    font-size: 10px;
    font-weight: $font-weight-bold;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // 데스크톱 대응
  @include desktop {
    &__container {
      padding: 0 $spacing-2xl;
    }
  }
}
</style>

