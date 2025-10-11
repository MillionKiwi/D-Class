import { ref } from 'vue'

/**
 * Loading 상태 관리를 위한 Composable
 */

// 전역 로딩 상태
const globalLoading = ref(false)

export function useLoading() {
  const loading = ref(false)

  const start = () => {
    loading.value = true
  }

  const stop = () => {
    loading.value = false
  }

  const startGlobal = () => {
    globalLoading.value = true
  }

  const stopGlobal = () => {
    globalLoading.value = false
  }

  // 비동기 함수를 로딩 상태와 함께 실행
  const withLoading = async (fn, useGlobal = false) => {
    try {
      if (useGlobal) {
        startGlobal()
      } else {
        start()
      }
      return await fn()
    } finally {
      if (useGlobal) {
        stopGlobal()
      } else {
        stop()
      }
    }
  }

  return {
    loading,
    globalLoading,
    start,
    stop,
    startGlobal,
    stopGlobal,
    withLoading,
  }
}

