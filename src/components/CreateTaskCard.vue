<script setup>
import { ref, toRaw, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import BaseButton from '@/components/BaseButton.vue'
import userSelect from './userSelect.vue'
import { createTask } from '@/api/task'

const props = defineProps({
  canEditOwner: {
    type: Boolean,
    default: true,
  },
})

const authStore = useAuthStore()
const toast = useToast()
const isLoading = ref(false)
const redBorder = ref(false)
const taskTitle = ref('')
const taskDeadline = ref('')
const taskOwner = ref({ username: authStore.username, id: authStore.userID })
const taskDescription = ref('')
const isSelect = ref(false)

const emit = defineEmits(['closeTaskCard', 'getUpdateInfo'])

const closeTaskCard = () => {
  emit('closeTaskCard')
}

const getUpdateInfo = () => {
  emit('getUpdateInfo')
}

const clickCreate = async () => {
  console.log('clickCreate!')
  isLoading.value = true
  const request = {}
  if (taskTitle.value === '') {
    toast.error('Please input task title.')
    redBorder.value = true
    isLoading.value = false
    return
  }
  request.title = taskTitle.value

  if (taskDeadline.value !== '') {
    request.deadline = taskDeadline.value
  }

  if (taskOwner.value.id !== authStore.userID) {
    request.owner = taskOwner.value.id
  }

  if (taskDescription.value !== '') {
    request.description = taskDescription.value
  }

  try {
    const createData = await createTask(request)
    console.log(createData)
    toast.success('Changes saved successfully!')
    console.log('create!')
    closeTaskCard() // 新增成功後關閉卡片
    getUpdateInfo() // 讓父組件更新畫面
  } catch (err) {
    toast.error('Failed to save task.')
    console.log('api get error: ', err)
  } finally {
    isLoading.value = false
  }
}
</script>
<template>
  <div
    @click="isSelect = false"
    class="relative flex h-auto max-h-[calc(100vh-40px)] w-[80%] min-[481px]:w-[40%] flex-col rounded-[10px] border border-black bg-white"
  >
    <div
      class="py-2 px-4 w-full flex items-center justify-between border-b border-[var(--hr-gray)]"
    >
      <button class="hover:scale-120" @click="closeTaskCard">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <h2 class="py-2 px-4">Create Task</h2>
    <form novalidate @submit.prevent="clickCreate" class="[&>div]:py-2 [&>div]:px-4">
      <div class="flex flex-col gap-1">
        <label for="title">Task Title<span class="text-red-400">*</span></label>
        <div class="relative">
          <input
            class="h-8 w-full border rounded-[5px] px-1"
            :class="{
              'border-[red]': redBorder,
              'border-[var(--hr-gray)]': !redBorder,
            }"
            @input="redBorder = false"
            type="text"
            minlength="1"
            maxlength="100"
            id="title"
            v-model="taskTitle"
            placeholder="Please input task title"
            required
          />
          <span
            class="text-xs absolute right-1 -bottom-5"
            :class="{ 'text-red-400': (taskTitle.length === 100) | (taskTitle.length === 0) }"
          >
            {{ taskTitle.length }}/100
          </span>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label for="deadline">Deadline</label>
        <input
          class="h-8 border border-[var(--hr-gray)] rounded-[5px] px-1"
          id="deadline"
          type="date"
          v-model="taskDeadline"
        />
      </div>
      <div v-if="canEditOwner">
        <userSelect v-model="taskOwner" v-model:isSelect="isSelect"></userSelect>
      </div>
      <!--
      <div class="flex flex-col gap-1" v-if="canEditOwner">
        <label for="taskOwner">Task Owner</label>
        <input
          class="h-8 border border-[var(--hr-gray)] rounded-[5px] px-1"
          id="taskOwner"
          type="text"
          placeholder="還沒寫，之後再寫...須加上 v-if=role === admin 並考慮一下怎麼做出可以選取所有user的 component"
        />
      </div>-->
      <div class="flex flex-col gap-1">
        <label for="description">Description</label>
        <div class="relative">
          <textarea
            class="w-full border border-[var(--hr-gray)] rounded-[5px] p-1"
            maxlength="1000"
            id="description"
            v-model="taskDescription"
            rows="5"
          ></textarea>
          <span
            class="text-xs absolute right-1 -bottom-3"
            :class="{ 'text-red-400': taskDescription.length === 1000 }"
          >
            {{ taskDescription.length }}/1000
          </span>
        </div>
      </div>

      <div class="w-full flex flex-row justify-around">
        <BaseButton
          type="button"
          @click="closeTaskCard"
          style="background-color: var(--list-gray); color: black"
          >Cancel</BaseButton
        >
        <BaseButton type="submit" :loading="isLoading">{{
          isLoading ? 'Creating...' : 'Create'
        }}</BaseButton>
      </div>
    </form>
  </div>
</template>
