<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  await authStore.init()
})
</script>

<template>
  <RouterView />
</template>

<style>
/* 전역 스타일은 main.css에 정의 */
</style>