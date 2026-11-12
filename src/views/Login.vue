<script setup lang="ts">
import { ref, reactive } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth' // @ = src/
import { useRouter } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'
import api from '@/api/axios'

const router = useRouter()
const toast = useToast()
const isLoading = ref(false)
const isRegister = ref(true)
const username = ref('')
const password = ref('')
const email = ref('')
const phone = ref('')
const showPassword = ref(false)
const inputError = reactive({
  username: '',
  password: '',
  email: '',
  phone: '',
})

const resetInput = () => {
  username.value = ''
  password.value = ''
  email.value = ''
  phone.value = ''
  showPassword.value = false
}

const resetInputError = () => {
  Object.assign(inputError, {
    username: '',
    password: '',
    email: '',
    phone: '',
  })
}

const changeButton = (state: 'login' | 'register') => {
  isRegister.value = state === 'register'
  resetInputError()
  resetInput()
}

const checkInput = (state: 'login' | 'register') => {
  // (state: 'login' | 'register' = 'login') => typeScript: state 只會是 'login' 或 'register'，預設為 'login'
  let errorCount = 0
  resetInputError()

  if (!username.value) {
    inputError.username = '請輸入使用者名稱'
    errorCount++
  } else if (username.value.length < 3) {
    inputError.username = '請輸入至少 3 個字元'
    errorCount++
  }

  if (!password.value) {
    inputError.password = '請輸入密碼'
    errorCount++
  } else if (password.value.length < 8) {
    inputError.password = '請輸入至少 8 個字元'
    errorCount++
  }

  if (state === 'register') {
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      inputError.email = 'Email 格式不正確'
      errorCount++
    }

    if (phone.value && !/^09\d{8}$/.test(phone.value)) {
      inputError.phone = '手機號碼格式不正確'
      errorCount++
    }
  }
  return errorCount
}

const login = async () => {
  isLoading.value = true
  const errorCount = checkInput('login')
  if (errorCount > 0) {
    isLoading.value = false
    return
  }

  const payload = {
    username: username.value,
    password: password.value,
  }

  try {
    const res = await api.post('/jwt/auth/login', payload)
    const authStore = useAuthStore()
    authStore.setToken(res.data.token)
    resetInput()
    const info = await api.get('/jwt/user/profile')
    authStore.setInfo(info.data.username, info.data.role, info.data._id)
    toast.success('登入成功!')
    router.push({ name: 'home' }) // 跳轉頁面
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message === 'Invalid username or password.') {
        toast.error('使用者名稱或密碼錯誤')
      }
    }
  } finally {
    isLoading.value = false
  }
}

const register = async () => {
  isLoading.value = true
  const errorCount = checkInput('register')
  if (errorCount > 0) {
    isLoading.value = false
    return
  }

  const payload = {
    username: username.value,
    password: password.value,
    ...(email.value && { email: email.value }),
    ...(phone.value && { phone: phone.value }),
  }

  try {
    const res = await api.post('/jwt/auth/register', payload)
    resetInput()
    toast.success('註冊成功!')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message === 'Username already exists.') {
        inputError.username = '使用者已存在'
      }
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="outer">
    <div class="container">
      <div>
        <h1>任務系統</h1>
      </div>
      <div class="button_none">
        <button :class="{ clickme: isRegister }" @click="changeButton('register')">註冊</button>
        <button :class="{ clickme: !isRegister }" @click="changeButton('login')">登入</button>
      </div>
      <form novalidate @submit.prevent="register" v-if="isRegister">
        <div class="form-group">
          <label for="register-username">使用者名稱<span>*</span></label>
          <input
            type="text"
            minlength="3"
            maxlength="15"
            id="register-username"
            :class="{ errorMessageInput: inputError.username }"
            v-model="username"
            placeholder="請輸入使用者名稱"
            required
          />
          <p v-if="inputError.username" class="errorMessage">
            <i class="fa-solid fa-triangle-exclamation"></i>{{ inputError.username }}
          </p>
        </div>
        <div class="form-group">
          <label for="register-password">密碼<span>*</span></label>
          <div class="password-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="register-password"
              :class="{ errorMessageInput: inputError.password }"
              v-model="password"
              placeholder="請輸入密碼"
              required
            />
            <i
              class="fa-solid"
              :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
              @click="showPassword = !showPassword"
            ></i>
          </div>
          <p v-if="inputError.password" class="errorMessage">
            <i class="fa-solid fa-triangle-exclamation"></i>{{ inputError.password }}
          </p>
        </div>
        <div class="form-group">
          <label for="register-email">電子郵件</label>
          <input
            type="email"
            id="register-email"
            :class="{ errorMessageInput: inputError.email }"
            v-model="email"
            placeholder="example@domain.com"
          />
          <p v-if="inputError.email" class="errorMessage">
            <i class="fa-solid fa-triangle-exclamation"></i>{{ inputError.email }}
          </p>
        </div>
        <div class="form-group">
          <label for="register-phone">電話號碼</label>
          <input
            type="tel"
            pattern="09[0-9]{8}"
            id="register-phone"
            :class="{ errorMessageInput: inputError.phone }"
            v-model="phone"
            placeholder="0912345678"
          />
          <p v-if="inputError.phone" class="errorMessage">
            <i class="fa-solid fa-triangle-exclamation"></i>{{ inputError.phone }}
          </p>
        </div>
        <div class="form-group">
          <BaseButton type="submit" :loading="isLoading">{{
            isLoading ? '註冊中...' : '註冊'
          }}</BaseButton>
        </div>
      </form>
      <form novalidate @submit.prevent="login" v-else>
        <div class="form-group">
          <label for="login-username">使用者名稱<span>*</span></label>
          <input
            type="text"
            minlength="3"
            maxlength="15"
            id="login-username"
            :class="{ errorMessageInput: inputError.username }"
            v-model="username"
            placeholder="請輸入使用者名稱"
            required
          />
          <p v-if="inputError.username" class="errorMessage">
            <i class="fa-solid fa-triangle-exclamation"></i>{{ inputError.username }}
          </p>
        </div>
        <div class="form-group">
          <label for="login-password">密碼<span>*</span></label>
          <div class="password-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="login-password"
              :class="{ errorMessageInput: inputError.password }"
              v-model="password"
              placeholder="請輸入密碼"
              required
            />
            <i
              class="fa-solid"
              :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
              @click="showPassword = !showPassword"
            ></i>
          </div>
          <p v-if="inputError.password" class="errorMessage">
            <i class="fa-solid fa-triangle-exclamation"></i>{{ inputError.password }}
          </p>
        </div>
        <div class="form-group">
          <BaseButton type="submit" :loading="isLoading">{{
            isLoading ? '登入中...' : '登入'
          }}</BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.outer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
}

.container {
  display: flex;
  align-items: center;
  flex-direction: column;
  border: 1px solid gray;
  border-radius: 15px;
  width: 400px;
  background-color: var(--starlight-blue);
  color: var(--starlight-silver);
}

.container h1 {
  margin-top: 15px;
}

.container .button_none button {
  border: none;
  background: none;
  padding: 2px;
  color: inherit;
  cursor: pointer;
  margin: 10px;
}

.container .button_none button:hover {
  color: white;
  transform: scale(1.15);
}

.container .button_none button.clickme {
  border-bottom: 2px solid white;
}

.container form {
  width: 100%;
}

.container form .form-group {
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  margin: 10px 0;
}

.container form .form-group > * {
  margin: 0 0 5px 0;
}

.container form .form-group input {
  border: 2px solid var(--starlight-blue);
  border-radius: 30px;
  padding-left: 10px;
  height: 30px;
  width: 50%;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 1);
  box-sizing: border-box;
  background-color: var(--nav-hover-blue);
  color: black;
}

.container form .form-group input::placeholder {
  color: rgba(0, 0, 0, 0.25);
}

.container form .form-group input:hover {
  border: 2px solid rgb(21, 56, 131);
}

.container form .form-group input:focus {
  outline: none;
}

.container form .form-group input.errorMessageInput {
  border: 2px solid red;
  box-shadow: none;
}

.container form .form-group .errorMessage {
  color: red;
}

.container form .form-group .password-wrapper {
  position: relative;
  width: 50%;
}

.container form .form-group .password-wrapper input {
  width: 100%;
  padding-right: 35px;
}

.container form .form-group .password-wrapper i {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: rgb(126, 126, 126);
}

@media (max-width: 480px) {
  .container {
    width: 80%;
  }

  .container form .form-group input {
    width: 75%;
  }

  .container form .form-group .password-wrapper {
    position: relative;
    width: 75%;
  }
}
</style>
