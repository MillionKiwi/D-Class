<template>
  <div class="academy-layout">
    <AppHeader show-add-job show-notification :notification-count="notificationCount" />

    <main class="academy-layout__main">
      <slot />
    </main>

    <BottomNavigation type="academy" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import BottomNavigation from './BottomNavigation.vue'

// TODO: 실제 알림 개수는 store에서 가져오기
const notificationCount = ref(5)
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.academy-layout {
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

