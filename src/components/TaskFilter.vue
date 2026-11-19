<script setup>
import { ref, computed, onMounted, onBeforeUnmount, defineProps, defineModel } from 'vue'
import ChooseSort from '@/components/ChooseSort.vue'

const props = defineProps({
  isBoard: {
    type: Boolean,
    default: false,
  },
})

const filters = defineModel()

const asc = ref(true)
const sortBy = ref('deadline')
const isOpenSortCard = ref(false)
const sortButtonRef = ref(null)
const chooseSortRef = ref(null)

function handleClickOutside(event) {
  if (!isOpenSortCard.value) return

  const target = event.target
  const clickedTrigger = sortButtonRef.value?.contains(target)
  const clickedPanel = chooseSortRef.value?.contains(target)

  // 點擊的既不是 B 按鈕，也不是打開的 div 內部，就關閉
  if (!clickedTrigger && !clickedPanel) {
    isOpenSortCard.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="flex flex-row py-2 gap-3">
    <!-- 搜尋框 -->
    <div class="border rounded-2xl px-2 flex items-center gap-2">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input
        type="text"
        placeholder="search title"
        class="focus:outline-none"
        v-model="filters.keyword"
      />
    </div>
    <!-- 排序 -->
    <div v-if="isBoard" class="relative">
      <div class="border rounded-2xl px-2 hover:bg-[var(--nav-hover-blue)]">
        <button ref="sortButtonRef" @click="isOpenSortCard = !isOpenSortCard">
          <i v-if="asc" class="fa-solid fa-arrow-down-short-wide"></i>
          <i v-if="!asc" class="fa-solid fa-arrow-up-short-wide"></i>
        </button>
      </div>
      <div v-if="isOpenSortCard" ref="chooseSortRef" class="absolute top-full mt-1 bg-white">
        <ChooseSort v-model:asc="asc" v-model:sortBy="sortBy"></ChooseSort>
      </div>
    </div>
    <!-- status: todo, doing or done(日曆格式) -->
    <div v-if="!isBoard">status</div>
    <!-- deadlineFrom(Board格式) -->
    <div v-if="isBoard">deadlineFrom</div>
    <!-- deadlineTo(Board格式) -->
    <div v-if="isBoard">deadlineTo</div>
  </div>
</template>
