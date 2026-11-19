<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import CreateTaskCard from '@/components/CreateTaskCard.vue'
import TaskCard from '@/components/TaskCard.vue'
import { getAllTasks } from '@/api/task'
import { useAuthStore } from '@/stores/auth'
import {
  useTaskFilters,
  type Task,
  type TaskStatus,
  type SortBy,
} from '@/composables/useTaskFilters'
import Calendar from '@/components/Calendar.vue'
import TaskFilter from '@/components/TaskFilter.vue'

const authStore = useAuthStore()
const isLoading = ref(true)

const isOpenCreatedCard = ref(false)
const isOpenTaskCard = ref(false)
const isBoard = ref(false)
const aCardInfo = ref()
const tasks = ref([])
const { filters, visibleTasks, resetFilters } = useTaskFilters(tasks)
//const todo = ref([])
//const doing = ref([])
//const done = ref([])

interface ATask {
  _id: number | string
  title: string
  status: TaskStatus
  createdAt: string
  updatedAt?: string // 後面加 ? 代表「這個欄位可有可無」
  deadline?: string // 截止日也設成可有可無，避免有些 task 沒填截止日
}

async function loadTasks() {
  try {
    isLoading.value = true
    tasks.value = (await getAllTasks(authStore.userID)).result
    //todo.value = tasks.value.filter((task) => task.status === 'todo')
    //doing.value = tasks.value.filter((task) => task.status === 'doing')
    //done.value = tasks.value.filter((task) => task.status === 'done')
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

const openTaskCard = (aTask: ATask) => {
  isOpenTaskCard.value = true
  aCardInfo.value = aTask
  console.log(aCardInfo.value)
  console.log(isOpenTaskCard.value)
}
</script>

<template>
  <div class="bg-white rounded-3xl h-[95%] w-[95%] flex flex-col px-5 pb-5 text-xs md:text-base">
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
    <div>
      <TaskFilter :isBoard="isBoard" v-model="filters"></TaskFilter>
    </div>
    <!-- 任務卡片區  -->
    <div v-if="!isBoard" class="flex flex-col gap-5 flex-1 min-h-0">
      <Calendar
        :tasks="visibleTasks"
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
