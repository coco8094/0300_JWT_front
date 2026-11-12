<script setup>
import { ref, onMounted } from 'vue'
import { searchUsers } from '@/api/admin.ts'
import Loading from '@/components/Loading.vue'

const taskOwner = defineModel()
const isSelect = defineModel('isSelect')
const myUsername = taskOwner.value.username // 先把自己的 username 記住
const myId = taskOwner.value.id // 先把自己的 id 記住
const isLoading = ref(true)

const keyword = ref(taskOwner.value.username)
const users = ref([])
let timer = null

async function getUsers(key) {
  try {
    users.value = []
    isLoading.value = true
    users.value = (await searchUsers(key)).users
    console.log(users.value)
    console.log(users.value.length)
  } catch (err) {
    console.log('api get error: ', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(getUsers)

function selectUser(user) {
  taskOwner.value = {
    username: user.username,
    id: user._id,
  }
  keyword.value = user.username
  isSelect.value = false
}

function checkUser() {
  const user = users.value.find((user) => user.username === keyword.value)
  if (user) {
    taskOwner.value = {
      username: user.username,
      id: user._id,
    }
  } else {
    console.log('沒有這個人!')
    taskOwner.value = {
      username: myUsername,
      id: myId,
    }
    keyword.value = myUsername
  }
}

function inputKeyword() {
  clearTimeout(timer)

  timer = setTimeout(() => {
    getUsers(keyword.value)
  }, 300)
}

async function openSelect() {
  if (isSelect.value) return
  isSelect.value = true
  await getUsers()
}
</script>

<template>
  <div class="relative flex flex-col gap-1">
    <label>Task Owner</label>
    <div class="relative" @click.stop="openSelect">
      <input
        @input="inputKeyword"
        @blur="checkUser"
        class="h-8 w-full border border-[var(--hr-gray)] rounded-[5px] px-1"
        id="taskOwner"
        type="text"
        v-model="keyword"
        placeholder="Search"
      />
      <i class="absolute fa-solid fa-angle-down right-2 top-1/2 -translate-y-1/2"></i>
    </div>
    <div
      v-if="isSelect"
      class="select-scroll absolute top-full z-10 w-full h-[200px] bg-white border border-[var(--hr-gray)] rounded-[5px] flex flex-col overflow-y-auto"
    >
      <button
        type="button"
        @mousedown.prevent="selectUser(user)"
        class="hover:bg-gray-100"
        v-for="user in users"
        :key="user._id"
      >
        {{ user.username }}
      </button>
      <div v-if="isLoading" class="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <Loading :loading="isLoading"></Loading>
      </div>
      <div
        v-if="users.length === 0 && !isLoading"
        class="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex flex-row gap-2"
      >
        <i class="fa-solid fa-user-slash"></i>
        <p class="leading-none">No users found.</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
