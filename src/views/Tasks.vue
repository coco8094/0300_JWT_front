<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import CreateTaskCard from '@/components/CreateTaskCard.vue'
import ChooseSort from '@/components/ChooseSort.vue'
import TaskCard from '@/components/TaskCard.vue'
import { getAllTasks } from '@/api/task'
import { useAuthStore } from '@/stores/auth'
import Calendar from '@/components/Calendar.vue'

const authStore = useAuthStore()
const isLoading = ref(true)

const isOpenCreatedCard = ref(false)
const isOpenTaskCard = ref(false)
const isOpenSortCard = ref(false)
const isBoard = ref(false)
const aCardInfo = ref()
const asc = ref(true)
const sortBy = ref('deadline')
const tasks = ref([])
const todo = ref([])
const doing = ref([])
const done = ref([])

async function loadTasks() {
  try {
    isLoading.value = true
    tasks.value = (await getAllTasks(authStore.userID)).result
    todo.value = tasks.value.filter((task) => task.status === 'todo')
    doing.value = tasks.value.filter((task) => task.status === 'doing')
    done.value = tasks.value.filter((task) => task.status === 'done')
    console.log('資料類別: ', typeof tasks.value)
  } catch (err) {
    console.log('api get error: ', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadTasks()
})

async function getUpdateInfo() {
  await loadTasks()
}

const sortedTasks = computed(() => {
  console.log('sortedTasks!!!')

  let modifier1, modifier2
  modifier1 = asc.value === true ? 1 : -1
  if (sortBy.value === 'createdAt') {
    modifier2 = 1
  } else if (sortBy.value === 'updatedAt') {
    modifier2 = 10
  } else if (sortBy.value === 'deadline') {
    modifier2 = 100
  } else {
    modifier2 = 1000
  }

  return modifier1 * modifier2
  /*
  return [...tasks.value].sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1
    if (a[sortBy.value] < b[sortBy.value]) return -1 * modifier
    if (a[sortBy.value] > b[sortBy.value]) return 1 * modifier
    return 0
  })*/
})

const openTaskCard = (aTask) => {
  isOpenTaskCard.value = true
  aCardInfo.value = aTask
  console.log(aCardInfo.value)
  console.log(isOpenTaskCard.value)
}

const closeDivs = () => {
  isOpenSortCard.value = false
}
</script>

<template>
  <div
    @click="closeDivs"
    class="bg-white rounded-3xl h-[95%] w-[95%] flex flex-col px-5 pb-5 text-xs md:text-base"
  >
    <!-- board / Calendar 按鈕 -->
    <div class="flex flex-row justify-between">
      <div
        class="flex flex-row gap-2 md:gap-6 md:[&>button]:py-4 [&>button]:gap-1 [&>button]:flex [&>button]:items-center"
      >
        <button
          @click="isBoard = true"
          :class="['border-b-2', isBoard ? 'border-[rgb(0,0,255)]' : 'border-transparent']"
        >
          <i class="fa-brands fa-trello"></i>
          Board
        </button>
        <button
          @click="isBoard = false"
          :class="['border-b-2', isBoard ? 'border-transparent' : 'border-[rgb(0,0,255)]']"
        >
          <i class="fa-regular fa-calendar-days"></i>
          Calendar
        </button>
      </div>
      <div class="flex items-center">
        <button
          @click="isOpenCreatedCard = true"
          class="bg-[var(--button-blue)] text-[var(--button-word-gray)] rounded-3xl p-2 whitespace-nowrap hover:bg-[#5b4b7d]"
        >
          <i class="fa-solid fa-plus"></i> Create Task
        </button>
        <div
          v-if="isOpenCreatedCard"
          class="fixed inset-0 flex h-screen w-screen items-center justify-center bg-black/70 z-[2000]"
        >
          <CreateTaskCard
            @closeTaskCard="isOpenCreatedCard = false"
            @getUpdateInfo="getUpdateInfo"
          ></CreateTaskCard>
        </div>
      </div>
    </div>
    <hr class="border-t border-[var(--hr-gray)]" />
    <!-- 篩選區 -->
    <div class="flex flex-row py-2 gap-3">
      <!-- 搜尋框 -->
      <div class="border rounded-2xl px-2 flex items-center gap-2">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" placeholder="search title" class="focus:outline-none" />
      </div>
      <!-- 排序 -->
      <div @click.stop class="relative">
        <div class="border rounded-2xl px-2 hover:bg-[var(--nav-hover-blue)]">
          <button @click="isOpenSortCard = !isOpenSortCard">
            <i v-if="asc" class="fa-solid fa-arrow-down-short-wide"></i>
            <i v-if="!asc" class="fa-solid fa-arrow-up-short-wide"></i>
          </button>
        </div>
        <div v-if="isOpenSortCard" class="absolute top-full mt-1 bg-white">
          <ChooseSort v-model:asc="asc" v-model:sortBy="sortBy"></ChooseSort>
        </div>
      </div>
      <!-- status: todo, doing or done(日曆格式) -->
      <div>status</div>
      <!-- deadlineFrom(Board格式) -->
      <div>deadlineFrom</div>
      <!-- deadlineTo(Board格式) -->
      <div>deadlineTo</div>
    </div>
    <!-- 任務卡片區  -->
    <div v-if="!isBoard" class="flex flex-col gap-5 flex-1 min-h-0">
      <Calendar
        :tasks="tasks"
        v-model:isLoading="isLoading"
        @open-taskcard="openTaskCard"
      ></Calendar>
    </div>
    <div
      class="fixed inset-0 bg-black/70 flex justify-center items-center z-[2000]"
      v-if="isOpenTaskCard"
      @click.stop
    >
      <TaskCard
        @closeTaskCard="isOpenTaskCard = false"
        @getUpdateInfo="getUpdateInfo()"
        :info="aCardInfo"
      ></TaskCard>
    </div>
  </div>
</template>
