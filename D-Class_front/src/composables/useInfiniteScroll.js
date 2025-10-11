import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 무한 스크롤을 위한 Composable
 */

export function useInfiniteScroll(callback, options = {}) {
  const { threshold = 100, enabled = true } = options

  const isLoading = ref(false)
  const hasMore = ref(true)

  const handleScroll = () => {
    if (!enabled || isLoading.value || !hasMore.value) return

    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = document.documentElement.scrollTop
    const clientHeight = document.documentElement.clientHeight

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      loadMore()
    }
  }

  const loadMore = async () => {
    if (isLoading.value || !hasMore.value) return

    isLoading.value = true
    try {
      const result = await callback()
      // callback에서 hasMore 상태를 반환하도록 함
      if (result !== undefined) {
        hasMore.value = result
      }
    } catch (error) {
      console.error('무한 스크롤 로딩 중 오류:', error)
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    hasMore.value = true
    isLoading.value = false
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    isLoading,
    hasMore,
    loadMore,
    reset,
  }
}

