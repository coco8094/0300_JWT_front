<script setup>
import { useSlots } from 'vue'

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})

const slots = useSlots()
const hasSlot = !!slots.default // 看有沒有傳入 slot
</script>

<template>
  <div v-if="loading" class="loading-container" :class="{ noSlot: !hasSlot }">
    <div class="loading-spinner">
      <span v-for="n in 12" :key="n"></span>
    </div>
    <!--<p>Loading...</p>-->
    <slot></slot>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  height: 60px;
  width: 120px;
  gap: 5px;
  margin: 0 auto;
}

.loading-container.noSlot {
  justify-content: center;
  width: 60px;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  position: relative;
}

.loading-spinner span {
  position: absolute;
  width: 2px;
  height: 5px;
  background: #222;
  border-radius: 5px;

  left: 14px;
  top: 0;

  transform-origin: 1px 12px;

  animation: fade 1.2s linear infinite;
}

/* 12 根的位置 */
.loading-spinner span:nth-child(1) {
  transform: rotate(0deg);
  animation-delay: 0s;
}

.loading-spinner span:nth-child(2) {
  transform: rotate(30deg);
  animation-delay: 0.1s;
}

.loading-spinner span:nth-child(3) {
  transform: rotate(60deg);
  animation-delay: 0.2s;
}

.loading-spinner span:nth-child(4) {
  transform: rotate(90deg);
  animation-delay: 0.3s;
}

.loading-spinner span:nth-child(5) {
  transform: rotate(120deg);
  animation-delay: 0.4s;
}

.loading-spinner span:nth-child(6) {
  transform: rotate(150deg);
  animation-delay: 0.5s;
}

.loading-spinner span:nth-child(7) {
  transform: rotate(180deg);
  animation-delay: 0.6s;
}

.loading-spinner span:nth-child(8) {
  transform: rotate(210deg);
  animation-delay: 0.7s;
}

.loading-spinner span:nth-child(9) {
  transform: rotate(240deg);
  animation-delay: 0.8s;
}

.loading-spinner span:nth-child(10) {
  transform: rotate(270deg);
  animation-delay: 0.9s;
}

.loading-spinner span:nth-child(11) {
  transform: rotate(300deg);
  animation-delay: 1s;
}

.loading-spinner span:nth-child(12) {
  transform: rotate(330deg);
  animation-delay: 1.1s;
}

.loading-container p {
  height: 20px;
}

@keyframes fade {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0.2;
  }
}
</style>
