<script setup>
import { RouterView } from 'vue-router'
import { BaseToast } from '@/components/common'
</script>

<template>
  <div id="app" class="page-wrapper">
    <RouterView />
    <BaseToast />
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
