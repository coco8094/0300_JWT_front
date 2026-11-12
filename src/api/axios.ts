import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
// useRouter() 是 Vue Router 的 Composition API，需要在 Vue 的 component setup context 裡使用
// ts 檔案可直接使用 import router from '@/router'

const api = axios.create({
  baseURL: 'https://zero300-jwt-api.onrender.com',
})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  // const authStore = useAuthStore()  這行不能放外面
  // 因為 import 會先執行，如果有其他檔案 import axios.ts，但 pinia 還沒準備好，就會報錯
  // 但 .vue 沒有這個問題，因為 <script setup> 是 Vue component 的 setup context，當這個 component 被建立時，Pinia 已經透過 app.use(pinia) 初始化了。
  const token = authStore.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push({ name: 'login' })
    }

    return Promise.reject(error) // 建立一個「失敗的 Promise」，把這個 error 繼續往後傳
    // 如果寫 return error 會把這個 error 當成一個成功的回傳值，需要 Promise.reject(error) 才會失敗跑進 catch
  },
)

export default api
