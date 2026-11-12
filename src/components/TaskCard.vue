<script setup>
import { ref, toRaw, onMounted, onUnmounted, defineProps, defineEmits } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { updateTask, deleteTask } from '@/api/task'
import BaseButton from '@/components/BaseButton.vue'

/*
HTML使用:
      <TaskCard
        @closeTaskCard="isOpenCard = false" 回傳關閉按鈕
        :info="cardInfo" 傳入 single task 物件(object)
        :can-edit-owner="true" admin 是否可編輯 owner
      ></TaskCard>
*/

const props = defineProps({
  info: {
    type: Object,
    required: true,
  },
  canEditOwner: {
    type: Boolean,
    default: false,
  },
})

const toast = useToast()
const authStore = useAuthStore()
const role = authStore.role
const isEdit = ref(false)
const showMenu = ref(false)
const currentForm = ref(structuredClone(toRaw(props.info)))
const editForm = ref({})
const isLoading = ref(false)
const showDeleteDialog = ref(false)

currentForm.value.deadline = currentForm.value.deadline?.split('T')[0] || ''

const emit = defineEmits(['closeTaskCard', 'getUpdateInfo'])

const closeTaskCard = () => {
  emit('closeTaskCard')
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = () => {
  showMenu.value = false
}

onMounted(() => {
  // 如果不寫在 onMounted 裡面，component 每次初始化就會直接加監聽，component 被刪掉之後，這個監聽還留著
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  //onUnmounted: TaskCard 被移除的時候，把剛才加上的 document click 監聽移除掉
  document.removeEventListener('click', closeMenu)
})

const editTask = () => {
  editForm.value = structuredClone(toRaw(currentForm.value))
  editForm.value.deadline = editForm.value.deadline?.split('T')[0] || ''
  // Vue 的 Proxy 不能直接被 structuredClone() 做深拷貝，需先用 toRaw() 拿到原始物件
  isEdit.value = true
}

const clickDelete = async () => {
  isLoading.value = true
  try {
    await deleteTask(currentForm.value._id)
    toast.success('Task deleted successfully!')
    closeTaskCard()
    emit('getUpdateInfo')
  } catch (err) {
    toast.error('Failed to delete task.')
    console.log('api get error: ', err)
  } finally {
    isLoading.value = false
  }
}

const saveEdit = async () => {
  isLoading.value = true
  const request = {}
  if (editForm.value.title !== currentForm.value.title) {
    if (editForm.value.title === '') {
      toast.error('Please input task title.')
      isLoading.value = false
      return
    }
    request.title = editForm.value.title
  }
  if (editForm.value.status !== currentForm.value.status) {
    request.status = editForm.value.status
  }
  if (editForm.value.deadline !== currentForm.value.deadline) {
    request.deadline = editForm.value.deadline
  }
  if (editForm.value.description !== currentForm.value.description) {
    request.description = editForm.value.description
  }
  console.log(request)
  if (Object.keys(request).length === 0) {
    console.log('未更改資料!')
    isEdit.value = false
    isLoading.value = false
    return
  }

  try {
    const updateData = await updateTask(currentForm.value._id, request)
    emit('getUpdateInfo')
    console.log(updateData)
    currentForm.value = updateData
    currentForm.value.deadline = currentForm.value.deadline?.split('T')[0] || ''
    isEdit.value = false
    toast.success('Changes saved successfully!')
  } catch (err) {
    toast.error('Failed to save task.')
    console.log('api get error: ', err)
  } finally {
    isLoading.value = false
  }
  console.log('save!')
}
</script>

<template>
  <!-- 編輯模式 -->
  <div class="task-card-container" v-if="isEdit">
    <div class="div_title">
      <button @click="closeTaskCard"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <h2>Edit Task</h2>
    <form novalidate @submit.prevent="saveEdit">
      <div class="edit_detail bottom-span">
        <label for="title">Task Title<span>*</span></label>
        <input
          type="text"
          minlength="1"
          maxlength="100"
          id="title"
          v-model="editForm.title"
          placeholder="Please input task title"
          required
        />
        <span
          class="character-count"
          :class="{ 'max-character-count': editForm.title.length === 100 }"
        >
          {{ editForm.title.length }}/100
        </span>
      </div>
      <div class="edit_detail">
        <label for="status">Status</label>
        <select id="status" v-model="editForm.status">
          <option value="todo">Todo</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div class="edit_detail">
        <label for="deadline">Deadline</label>
        <input id="deadline" type="date" v-model="editForm.deadline" />
      </div>
      <div class="edit_detail" v-if="canEditOwner">
        <label for="taskOwner">Task Owner</label>
        <input
          id="taskOwner"
          type="text"
          placeholder="還沒寫，之後再寫...須加上 v-if=role === admin 並考慮一下怎麼做出可以選取所有user的 component"
        />
      </div>
      <div class="edit_detail bottom-span">
        <label for="description">Description</label>
        <textarea
          maxlength="1000"
          id="description"
          v-model="editForm.description"
          rows="5"
        ></textarea>
        <span
          class="character-count"
          :class="{ 'max-character-count': editForm.description.length === 1000 }"
        >
          {{ editForm.description.length }}/1000
        </span>
      </div>
      <div class="save_cancel">
        <BaseButton
          type="button"
          @click="isEdit = false"
          style="background-color: var(--list-gray); color: black"
          >Cancel</BaseButton
        >
        <BaseButton type="submit" :loading="isLoading">{{
          isLoading ? 'Saving...' : 'Save'
        }}</BaseButton>
      </div>
    </form>
  </div>

  <!-- view/delete 模式 -->
  <div class="task-card-container" v-else>
    <div class="div_title">
      <button @click="closeTaskCard"><i class="fa-solid fa-xmark"></i></button>
      <button @click.stop="toggleMenu">
        <!-- @click.stop="toggleMenu"是讓他執行toggleMenu，但因為他也在document.addEventListener('click', closeMenu)範圍內，所以我他不要冒泡到外面執行closeMenu -->
        <i class="fa-solid fa-ellipsis-vertical"></i>
      </button>
    </div>
    <h2
      :class="{
        'title-medium': currentForm.title?.length > 30,
        'title-small': currentForm.title?.length > 50,
      }"
    >
      {{ currentForm.title }}
    </h2>
    <div class="div_detail">
      <i class="fa-solid fa-clock"></i>
      <p>Created time</p>
      <p>{{ currentForm.createdAt.split('T')[0] }}</p>
    </div>
    <div class="div_detail">
      <i class="fa-solid fa-circle"></i>
      <p>Status</p>
      <p>{{ currentForm.status }}</p>
    </div>
    <div class="div_detail">
      <i class="fa-solid fa-user"></i>
      <p>Owner</p>
      <p>{{ currentForm.owner.username }}</p>
    </div>
    <!-- 先註解掉，之後把 API 的 Create Task 和 Update Task 改成回傳有 createdBy.username 再改這邊
    <div class="div_detail">
      <i class="fa-solid fa-user-plus"></i>
      <p>Created By</p>
      <p>{{ currentForm.createdBy.username }}</p>
    </div>
    <div class="div_detail">
      <i class="fa-solid fa-user-pen"></i>
      <p>Updated by</p>
      <p>{{ currentForm.updatedBy.username }}</p>
    </div>
    -->
    <div class="div_detail">
      <i class="fa-solid fa-calendar-days"></i>
      <p>Deadline</p>
      <p>{{ currentForm.deadline }}</p>
    </div>
    <div class="div_detail_description">
      <p>Task Description</p>
      <p>{{ currentForm.description }}</p>
    </div>
    <div class="edit_delete" v-if="showMenu">
      <button @click="editTask"><i class="fa-solid fa-pen"></i>edit</button>
      <button @click="showDeleteDialog = true"><i class="fa-solid fa-trash"></i>delete</button>
    </div>
    <div class="check_delete" v-if="showDeleteDialog">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <h3>Delete?</h3>
      <p>Are you sure you want to delete this task?</p>
      <div class="button_check_delete">
        <BaseButton
          type="button"
          @click="showDeleteDialog = false"
          style="background-color: var(--list-gray); color: black"
          >Cancel</BaseButton
        >
        <BaseButton type="button" :loading="isLoading" @click="clickDelete">{{
          isLoading ? 'Deleting...' : 'Delete'
        }}</BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-card-container {
  max-height: calc(100vh - 40px);
  border: 1px solid black;
  border-radius: 10px;
  width: 40%;
  height: auto;
  background-color: #fff;
  display: flex;
  /*justify-content: center;
  align-items: center;*/
  flex-direction: column;
  position: relative;
}

h2 {
  overflow-wrap: anywhere;
}

label span {
  color: red;
}

input,
select {
  height: 2rem;
  border: 1px solid var(--hr-gray);
  border-radius: 5px;
  padding: 0 5px;
}

textarea {
  border: 1px solid var(--hr-gray);
  border-radius: 5px;
  padding: 5px;
  resize: none; /* 不能被使用者拖曳改大小，使用 resize: vertical 可上下拖曳調整高度 */
}

.task-card-container .edit_detail {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.task-card-container .edit_detail span.character-count {
  position: absolute;
  bottom: -2px;
  right: 20px;
  font-size: 12px;
}

.task-card-container .edit_detail span.character-count.max-character-count {
  color: red;
}

.div_title,
h2,
.div_detail,
.div_detail_description,
.edit_detail,
.save_cancel,
.check_delete .task-card-container form > div {
  padding: 8px 15px;
}

.edit_detail.bottom-span {
  padding-bottom: 16px;
}

.task-card-container .div_title {
  border-bottom: 1px solid var(--hr-gray);
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-card-container .save_cancel {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-card-container .div_title button:hover {
  transform: scale(1.2);
}

.task-card-container .div_detail {
  display: grid;
  grid-template-columns: 10% 40% 50%;
  align-items: center;
}

.task-card-container .div_detail p {
  white-space: nowrap;
}

.task-card-container .div_detail_description {
  margin: 10px;
  background-color: rgb(230, 230, 230);
  border-radius: 10px;
  min-height: 0;
}

.task-card-container .div_detail_description p:first-child {
  line-height: 2;
}

.task-card-container .div_detail_description p:last-child {
  font-size: 0.9rem;
  min-height: 0;
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
}

.task-card-container .edit_delete {
  position: absolute;
  right: 0px;
  top: 30px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--hr-gray);
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 1);
  border-radius: 5px;
}

.task-card-container .edit_delete button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 8px;
  border-radius: 5px;
}

.task-card-container .edit_delete button:hover {
  background-color: rgb(230, 230, 230);
}

p {
  overflow-wrap: break-word;
}

.task-card-container .check_delete {
  position: absolute;
  z-index: 100;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  border: 1px solid rgb(200, 200, 200);
  border-radius: 12px;
  box-shadow: 0 20px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  white-space: nowrap; /* 不換行 */
  gap: 15px;
  padding: 20px;
}

.task-card-container .check_delete i {
  color: red;
  font-size: 50px;
}

.task-card-container .check_delete .button_check_delete {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

@media (max-width: 480px) {
  .task-card-container {
    width: 80%;
  }

  h2.title-medium {
    font-size: 20px;
  }

  h2.title-small {
    font-size: 16px;
  }
}
</style>
