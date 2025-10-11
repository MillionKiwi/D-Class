import { ref } from 'vue'

/**
 * Modal 관리를 위한 Composable
 */

export function useModal() {
  const isOpen = ref(false)
  const modalData = ref(null)

  const open = (data = null) => {
    modalData.value = data
    isOpen.value = true
    // 모달 열릴 때 body 스크롤 방지
    document.body.style.overflow = 'hidden'
  }

  const close = () => {
    isOpen.value = false
    modalData.value = null
    // body 스크롤 복원
    document.body.style.overflow = ''
  }

  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  return {
    isOpen,
    modalData,
    open,
    close,
    toggle,
  }
}

