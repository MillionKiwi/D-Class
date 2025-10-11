import { ref } from 'vue'

/**
 * Toast 메시지 관리를 위한 Composable
 */

const toasts = ref([])
let toastId = 0

export function useToast() {
  const show = (message, type = 'info', duration = 3000) => {
    const id = toastId++
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
    }

    toasts.value.push(toast)

    // 지정된 시간 후 자동으로 제거
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const remove = (id) => {
    const index = toasts.value.findIndex((toast) => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message, duration) => {
    return show(message, 'success', duration)
  }

  const error = (message, duration) => {
    return show(message, 'error', duration)
  }

  const warning = (message, duration) => {
    return show(message, 'warning', duration)
  }

  const info = (message, duration) => {
    return show(message, 'info', duration)
  }

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts,
    show,
    remove,
    success,
    error,
    warning,
    info,
    clear,
  }
}

