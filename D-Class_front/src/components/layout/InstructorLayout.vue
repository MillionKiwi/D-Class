<template>
  <div class="instructor-layout">
    <AppHeader show-search show-notification :notification-count="notificationCount" />

    <main class="instructor-layout__main">
      <slot />
    </main>

    <BottomNavigation type="instructor" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import BottomNavigation from './BottomNavigation.vue'

// TODO: 실제 알림 개수는 store에서 가져오기
const notificationCount = ref(3)
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.instructor-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $color-background;

  &__main {
    flex: 1;
    padding-bottom: calc($nav-height + $spacing-lg);
    overflow-x: hidden;

    @include desktop {
      padding-bottom: $spacing-lg;
    }
  }
}
</style>

