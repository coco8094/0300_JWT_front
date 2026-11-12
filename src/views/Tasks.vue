<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import CreateTaskCard from '@/components/CreateTaskCard.vue'
import ChooseSort from '@/components/ChooseSort.vue'
import Loading from '@/components/Loading.vue'
import TaskCard from '@/components/TaskCard.vue'
import { getAllTasks } from '@/api/task'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isLoading = ref(true)

const isOpenCreatedCard = ref(false)
const isOpenTaskCard = ref(false)
const isBoard = ref(false)
const isOpenMore = ref(false)
const popoverRef = ref(null)
const divListStyle = ref({})
const aCardInfo = ref()
const asc = ref(true)
const sortBy = ref('deadline')
const openSortCard = ref(false)
const tasks = ref([])
const todo = ref([])
const doing = ref([])
const done = ref([])

const today = new Date()

async function loadTasks() {
  try {
    isLoading.value = true
    tasks.value = (await getAllTasks(authStore.userID)).result
    todo.value = tasks.value.filter((task) => task.status === 'todo')
    doing.value = tasks.value.filter((task) => task.status === 'doing')
    done.value = tasks.value.filter((task) => task.status === 'done')
    console.log(tasks.value)
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

const getTasksForDay = (dayDate) => {
  const dayTasks = tasks.value.filter((task) => task.deadline.split('T')[0] === dayDate)
  const remainingCount = dayTasks.length - 1 // 格子只放得下 2 張卡片，超過兩個需要顯示 + remainingCount more按鈕，例如有 11 個 task 則需顯示 +10 more
  const hasMore = remainingCount > 1
  const showTask = hasMore ? dayTasks.slice(0, 1) : dayTasks.slice(0, 2)
  return { dayTasks, remainingCount, hasMore, showTask }
}

const getCalendarGrid = (year, month) => {
  // month 輸入 0-11 (例如 9 代表 10月)
  // new Date(年份, 月份, 日期): 建立一個指定日期的物件
  const firstDayIndex = new Date(year, month, 1).getDay() // new Date(year, month, 1): 取得當月第一天, getDay(): 取得「星期幾」（int）
  const totalDays = new Date(year, month + 1, 0).getDate() // new Date(year, month + 1, 0): 取得下個月的第 0 天，也就是這個月的最後一天, getDate(): 取得幾號

  const calendarDays = []

  // 1. 補齊前面空白格子（如果是從週一開始，邏輯會稍微不同，這裡以週日為每週第一天示範）
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push({ date: '', isCurrentMonth: false })
  }

  // 2. 填入當月日期
  for (let i = 1; i <= totalDays; i++) {
    const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    calendarDays.push({
      date: i,
      month: month + 1,
      year: year,
      fullDate: fullDate,
      isCurrentMonth: true,
      ...getTasksForDay(fullDate),
    })
  }

  // 3. 補齊後面格子讓總數是 7 的倍數 (填滿 35 或 42 格)
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push({ date: '', isCurrentMonth: false })
  }
  console.log(calendarDays)

  return calendarDays
}

// 1. 用 computed 快取月曆格子（只有 year 或 month 變動時才會重新執行）
const listCalendarDays = computed(() => {
  return getCalendarGrid(calendar.year, calendar.month)
})

// 2. 直接用上面算好的陣列長度去除以 7，完全不重複運算
const calendarRowsCount = computed(() => {
  return listCalendarDays.value.length / 7
})

const calendar = reactive({
  currentDate: new Date(),
  //selectedDay: today.getDate(), // 一開始是今天（例如 28）

  monthEnglish: new Date().toLocaleString('en-US', { month: 'long' }),
  year: new Date().getFullYear(),
  month: new Date().getMonth(),

  updateMonthDisplay() {
    this.monthEnglish = this.currentDate.toLocaleString('en-US', { month: 'long' })
    this.year = this.currentDate.getFullYear()
    this.month = this.currentDate.getMonth()
  },

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
    this.updateMonthDisplay()
  },

  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
    this.updateMonthDisplay()
  },
  /*
  resetToToday() {
    this.currentDate = new Date();
    this.selectedDay = today.getDate(); // 這裡把選中的日子重設回今天
    this.updateMonthDisplay();
  },

  // ⭐️ 關鍵：點擊日曆某一格時，要呼叫這個方法去更新 selectedDay！
  selectDay(day) {
    this.selectedDay = day; 
  }*/
})

// 3. 判斷某個日期是不是「今天」（方便你在畫面上加藍框）
const isToday = (year, month, day) => {
  return year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate()
}

const openTaskCard = (aTask) => {
  isOpenTaskCard.value = true
  aCardInfo.value = aTask
  console.log(aCardInfo.value)
  console.log(isOpenTaskCard.value)
}

const openMoreButton = async (e) => {
  isOpenMore.value = true

  if (isOpenMore.value) {
    const btnEl = e.currentTarget
    const btnRect = btnEl.getBoundingClientRect()

    await nextTick()
    const popoverEl = popoverRef.value
    if (!popoverEl) return

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const gap = 8

    divListStyle.value = { maxHeight: '250px', maxWidth: '250px' }

    if (btnRect.bottom > screenHeight - 250 - gap) {
      divListStyle.value.bottom = `${screenHeight - btnRect.bottom - gap}px`
    } else {
      divListStyle.value.top = `${btnRect.top - gap}px`
    }

    if (btnRect.right > screenWidth - 250 - gap) {
      divListStyle.value.right = `${screenWidth - btnRect.left + gap}px`
    } else {
      divListStyle.value.left = `${btnRect.right + gap}px`
    }

    console.log('目前計算的位置:', divListStyle.value)
  }
}

const closeDivs = () => {
  openSortCard.value = false
  isOpenMore.value = false
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
          <button @click="openSortCard = !openSortCard">
            <i v-if="asc" class="fa-solid fa-arrow-down-short-wide"></i>
            <i v-if="!asc" class="fa-solid fa-arrow-up-short-wide"></i>
          </button>
        </div>
        <div v-if="openSortCard" class="absolute top-full mt-1 bg-white">
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
    <!-- 任務卡片區 -->
    <div v-if="!isBoard" class="border rounded-xl p-5 flex flex-col gap-5 flex-1 min-h-0">
      <div class="flex flex-row gap-2 justify-center">
        <button class="hover:scale-125" @click="calendar.prevMonth()">
          <i class="fa-solid fa-angle-left"></i>
        </button>
        <button>{{ calendar.monthEnglish }}</button>
        <button>{{ calendar.year }}</button>
        <button class="hover:scale-125" @click="calendar.nextMonth()">
          <i class="fa-solid fa-angle-right"></i>
        </button>
      </div>
      <div
        class="border rounded-xl flex-1 min-h-0 grid grid-cols-7 overflow-hidden"
        :style="{
          gridTemplateRows: `auto repeat(${calendarRowsCount}, 1fr)`,
        }"
      >
        <div class="bg-gray-200 py-1 text-center text-xs font-semibold text-gray-500">SUN</div>
        <div class="bg-gray-200 py-1 text-center text-xs font-semibold text-gray-500">MON</div>
        <div class="bg-gray-200 py-1 text-center text-xs font-semibold text-gray-500">TUE</div>
        <div class="bg-gray-200 py-1 text-center text-xs font-semibold text-gray-500">WED</div>
        <div class="bg-gray-200 py-1 text-center text-xs font-semibold text-gray-500">THU</div>
        <div class="bg-gray-200 py-1 text-center text-xs font-semibold text-gray-500">FRI</div>
        <div class="bg-gray-200 py-1 text-center text-xs font-semibold text-gray-500">SAT</div>

        <div
          v-for="day in listCalendarDays"
          :key="day"
          class="border border-gray-200 bg-white p-2 grid grid-rows-3 text-gray-600 gap-1 overflow-hidden"
        >
          <div v-if="day.isCurrentMonth" class="flex justify-end">
            <span
              class="text-sm font-medium text-center rounded-full w-6 h-6 flex items-center justify-center"
              :class="isToday(day.year, day.month, day.date) ? 'bg-[var(--nav-choose-blue)]' : ''"
              >{{ day.date }}</span
            >
          </div>
          <button
            v-for="showdaytask in day.showTask"
            :key="showdaytask._id"
            class="border border-gray-200 rounded flex flex-row items-center w-full min-w-0 hover:bg-gray-200 transition-colors duration-200"
            @click="openTaskCard(showdaytask)"
          >
            <div class="h-2 w-2 rounded-full bg-green-500 m-2 flex-shrink-0"></div>
            <!-- 綠色圓點 (設定 flex-shrink-0 確保它不會被擠壓變形) -->
            <div class="truncate min-w-0">
              <!--使用 truncate 代表 1.overflow-hidden（超出隱藏）2.text-ellipsis（使用刪節號表示超出）3.whitespace-nowrap（強制不換行）
              可能須搭配 min-w-0 允許被壓縮，並且外層搭配 min-w-0 及 w-full-->
              {{ showdaytask.title }}
            </div>
          </button>
          <div v-if="day.hasMore" @click.stop>
            <button
              class="text-xs text-gray-400 hover:scale-105 hover:text-gray-600"
              @click="(e) => openMoreButton(e)"
            >
              +{{ day.remainingCount }} more
            </button>
            <!--              :style="{
                top: popoverStyle.top + 'px',
                left: popoverStyle.left + 'px',
                maxHeight: '250px' /* 限制最大高度，超過會出現捲軸 */,
              }"-->
            <div
              v-if="isOpenMore"
              ref="popoverRef"
              class="fixed z-50 w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-4 overflow-y-auto"
              :style="divListStyle"
            >
              <h3 class="font-bold text-gray-700 mb-2">智慧彈出卡片</h3>
              <p class="text-sm text-gray-500">
                我會自動偵測按鈕跟畫面邊緣的距離，決定要長在按鈕上方、下方、左邊還是右邊！
              </p>
              <div v-for="i in 15" :key="i" class="text-xs text-gray-400 mt-1">
                任務細節項目 {{ i }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="fixed inset-0 bg-black/70 flex justify-center items-center z-[2000]"
      v-if="isOpenTaskCard"
    >
      <TaskCard
        @closeTaskCard="isOpenTaskCard = false"
        @getUpdateInfo="getUpdateInfo()"
        :info="aCardInfo"
      ></TaskCard>
    </div>
  </div>
</template>
