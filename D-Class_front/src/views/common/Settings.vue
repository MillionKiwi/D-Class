<template>
  <div class="settings">
    <!-- 헤더 -->
    <div class="settings__header">
      <button class="back-button" @click="$router.back()">
        <ArrowLeftIcon :size="24" />
      </button>
      <h1>설정</h1>
      <div style="width: 44px"></div>
    </div>

    <!-- 메뉴 목록 -->
    <div class="settings__content">
      <section class="settings__section">
        <div class="menu-list">
          <router-link to="/settings/account" class="menu-item">
            <div class="menu-item__icon">
              <UserIcon :size="20" />
            </div>
            <span class="menu-item__text">계정 설정</span>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>

          <router-link to="/settings/notifications" class="menu-item">
            <div class="menu-item__icon">
              <BellIcon :size="20" />
            </div>
            <span class="menu-item__text">알림 설정</span>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>

          <router-link to="/support" class="menu-item">
            <div class="menu-item__icon">
              <HelpCircleIcon :size="20" />
            </div>
            <span class="menu-item__text">고객센터</span>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeft as ArrowLeftIcon,
  User as UserIcon,
  Bell as BellIcon,
  HelpCircle as HelpCircleIcon,
  ChevronRight as ChevronRightIcon,
} from 'lucide-vue-next'
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.settings {
  min-height: 100vh;
  background-color: $color-background;

  &__header {
    @include flex-between;
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;

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

  &__content {
    padding: $spacing-lg;
  }

  &__section {
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;
    overflow: hidden;
  }
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  border-bottom: 1px solid $color-divider;
  text-decoration: none;
  transition: all $transition-fast;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: $color-background;
  }

  &__icon {
    @include flex-center;
    width: 40px;
    height: 40px;
    background-color: $color-background;
    border-radius: $radius-md;
    color: $color-primary;
    flex-shrink: 0;
  }

  &__text {
    flex: 1;
    font-size: $font-size-body;
    color: $color-text-primary;
  }

  &__arrow {
    color: $color-text-secondary;
    flex-shrink: 0;
  }
}
</style>

