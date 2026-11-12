<script setup>
defineProps({
  type: {
    // type = button / submit...
    type: String,
    default: 'button',
  },
  variant: {
    type: Array,
    default: () => ['primary'],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
/*   disabled: {
    type: Boolean,
    default: false,
  }, 
*/
</script>

<template>
  <button :type="type" :class="['base-button', ...variant.map((item) => `base-button--${item}`)]">
    <!-- :disabled="disabled"-->
    <span v-if="loading" class="spinner"></span>
    <span>
      <slot />
    </span>
  </button>
</template>

<style scoped>
.spinner {
  display: inline-block; /* span 預設 display: inline，改成 inline-block 可以調整 width 和 height */
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  /*
  animation-name: spin; 我要使用一個叫做 spin 的動畫，動畫寫在底下 @keyframes spin
  animation-duration: 0.7s; 轉一圈 0.7 秒
  animation-timing-function: linear; 速度保持一樣
  animation-iteration-count: infinite; 不要停，一直重複
  */
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
/*
.base-button {
  border: none;
  border-radius: 30px;
  padding: 12px 12px;
  white-space: nowrap;
  box-shadow:
    3px 3px 6px rgba(0, 0, 0, 0.3),
    -2px -2px 6px rgba(255, 255, 255, 0.08);
}
*/
.base-button * {
  margin: 0 5px;
}

.base-button:hover {
  transform: scale(1.05);
}

.base-button:active {
  /* :active 偽類 正在按下去 */
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.25);
}

.base-button--primary {
  border: none;
  border-radius: 30px;
  padding: 12px 12px;
  white-space: nowrap;
  box-shadow:
    3px 3px 6px rgba(0, 0, 0, 0.3),
    -2px -2px 6px rgba(255, 255, 255, 0.08);
  background: var(--button-blue);
  color: var(--button-word-gray);
}

.base-button--circleNone {
  all: unset;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 25px;
  width: 25px;
  border-radius: 50%;
  cursor: pointer;
}

.base-button--circleNone:hover {
  background-color: var(--nav-hover-blue);
  color: black;
}

.base-button--circleNowPage {
  background: var(--button-blue);
  color: var(--button-word-gray);
  cursor: pointer;
}
</style>
