<template>
  <div :class="['card', { 'card-clickable': clickable }]" @click="handleClick">
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  clickable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped>
.card-clickable {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.12);
}

.card-clickable:active {
  transform: translateY(0);
}
</style>
