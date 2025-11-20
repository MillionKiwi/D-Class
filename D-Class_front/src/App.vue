<script setup>
import { onMounted, ref, provide } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Toast from '@/components/common/Toast.vue'

const authStore = useAuthStore()
const toastRef = ref(null)

const showToast = (message, type = 'info', duration = 3000) => {
  if (toastRef.value) {
    toastRef.value.message = message
    toastRef.value.type = type
    toastRef.value.duration = duration
    toastRef.value.show()
  }
}

provide('toast', showToast)

onMounted(async () => {
  await authStore.init()
})
</script>

<template>
  <RouterView />
  <Toast ref="toastRef" />
</template>

<style>
/* 전역 스타일은 main.css에 정의 */
</style>