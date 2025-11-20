<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" class="toast" :class="`toast-${type}`">
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'info', 'warning'].includes(value),
  },
  duration: {
    type: Number,
    default: 3000,
  },
})

const visible = ref(false)
let timeout = null

const show = () => {
  visible.value = true
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => {
    hide()
  }, props.duration)
}

const hide = () => {
  visible.value = false
}

watch(() => props.message, (newMessage) => {
  if (newMessage) {
    show()
  }
})

defineExpose({ show, hide })
</script>

<style scoped>
.toast {
  max-width: 90%;
  word-wrap: break-word;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
