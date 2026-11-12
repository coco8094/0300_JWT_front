<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
import { ref } from 'vue'
import Loading from '@/components/Loading.vue'
import TaskCard from '@/components/TaskCard.vue'
import { getTodayTasks } from '@/api/task'

const authStore = useAuthStore()
const myTask = ref([])
const pagination = ref({})
const isLoading = ref(true)
const todo = ref([])
const doing = ref([])
const done = ref([])
const isOpenCard = ref(false)
const cardInfo = ref('')

async function loadTodayTasks() {
  try {
    isLoading.value = true
    myTask.value = (await getTodayTasks(authStore.userID)).result
    todo.value = myTask.value.filter((task) => task.status === 'todo')
    doing.value = myTask.value.filter((task) => task.status === 'doing')
    done.value = myTask.value.filter((task) => task.status === 'done')
  } catch (err) {
    console.log('api get error: ', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadTodayTasks()
})

async function getUpdateInfo() {
  await loadTodayTasks()
  console.log('儲存後重新抓資料!')
  console.log(myTask.value)
}

const openCard = (task) => {
  cardInfo.value = task
  isOpenCard.value = true
  console.log(cardInfo.value)
}
</script>

<template>
  <div class="container">
    <h1>Welcome, {{ authStore.username }}!</h1>
    <hr />
    <p class="p-role">{{ authStore.role }}</p>
    <div class="quick-overview-cards">
      <div>
        <div v-if="isLoading" class="loading-wrapper">
          <Loading :loading="isLoading"></Loading>
        </div>
        <p v-if="!isLoading" class="task-number">{{ myTask.length }}</p>
        <p class="task-label">Today's Tasks</p>
      </div>
      <div>
        <div v-if="isLoading" class="loading-wrapper">
          <Loading :loading="isLoading"></Loading>
        </div>
        <p v-if="!isLoading" class="task-number">{{ todo.length + doing.length }}</p>
        <p class="task-label">In Progress</p>
      </div>
      <div>
        <div v-if="isLoading" class="loading-wrapper">
          <Loading :loading="isLoading"></Loading>
        </div>
        <p v-if="!isLoading" class="task-number">
          {{ ((done.length / myTask.length) * 100).toFixed(0) }}%
        </p>
        <p class="task-label">Today's Progress</p>
      </div>
    </div>
    <div class="task-list">
      <div class="div-task task-header">
        <div>Task</div>
        <div>Description</div>
        <div>Status</div>
      </div>
      <div class="div-task" v-for="task in myTask" :key="task._id" @click="openCard(task)">
        <div>{{ task.title }}</div>
        <div>{{ task.description }}</div>
        <div>{{ task.status }}</div>
      </div>
      <Loading :loading="isLoading">Loading...</Loading>
    </div>
    <div class="task-card" v-if="isOpenCard">
      <TaskCard
        @closeTaskCard="isOpenCard = false"
        @getUpdateInfo="getUpdateInfo()"
        :info="cardInfo"
      ></TaskCard>
    </div>
  </div>
</template>

<style scoped>
.container {
  background-color: #fff;
  width: 90%;
  height: 90%;
  border-radius: 30px;
  display: flex;
  flex-direction: column;
}

.container h1 {
  text-align: left;
  margin: 15px;
}

.container hr {
  margin: 0 10px;
  border: none;
  border-top: 1px solid var(--hr-gray);
}

.container p.p-role {
  margin: 5px 10px;
  color: #ccc;
}

.container .quick-overview-cards {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.container .quick-overview-cards > div {
  border: 1px solid #ccc;
  border-radius: 15px;
  width: clamp(70px, 20vw, 150px); /* clamp(最小值, 理想值, 最大值) */
  aspect-ratio: 1 / 1; /* 元素的高度跟寬度一樣 */
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  container-type: inline-size;
}

.container .quick-overview-cards .loading-wrapper,
.container .quick-overview-cards .task-number {
  height: 75%;

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 50cqw;
  font-weight: bold;
}

.container .quick-overview-cards .task-label {
  height: 25%;

  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(12px, 10cqw, 20px);
  text-align: center;
}

.container div.task-list {
  /*height: 300px;*/
  flex: 1;
  margin: 20px;
  overflow-y: auto;
}

.container div.task-list > div.div-task.task-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--nav-choose-blue);
}

.container div.task-list .div-task {
  display: grid;
  grid-template-columns: 30% 55% 15%;
  flex-direction: row;
  height: 50px;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid gray;
}

.container div.task-list > .div-task:nth-child(odd) {
  background-color: var(--background-blue);
}

.container div.task-list > .div-task:nth-child(even) {
  background-color: var(--list-gray);
}

.container div.task-list div.div-task:not(.task-header):hover {
  background-color: var(--nav-hover-blue);
}

.container div.task-list .div-task:last-child {
  border-bottom: none;
}

.container div.task-list .div-task div {
  padding: 0 5px;
  flex: 1;
  white-space: nowrap; /* 不換行 */
  overflow: hidden; /* 超出的隱藏 */
  text-overflow: ellipsis; /* 超出的部分顯示 ... */
}

.container .task-card {
  position: fixed; /* position: fixed -> 把元素固定在 viewport（瀏覽器可視區域）上 */
  inset: 0; /* inset: 0 -> top: 0, right: 0, bottom: 0, left: 0 */
  background-color: rgba(0, 0, 0, 0.7);
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

@media (max-width: 768px) {
  .container {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .container h1 {
    margin-left: 45px;
    margin-top: 9px;
  }

  .container .quick-overview-cards {
    gap: 5px;
  }

  .container .quick-overview-cards > div {
    width: clamp(70px, 30vw, 140px); /* clamp(最小值, 理想值, 最大值) */
  }
}
</style>
