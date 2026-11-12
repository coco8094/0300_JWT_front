import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { POSITION } from 'vue-toastification'

import './assets/main.css'

const app = createApp(App)

app.use(Toast, {
  timeout: 2000,
  position: POSITION.TOP_CENTER,
  hideProgressBar: true,

  transition: {
    // transition 是 Vue Toastification 提供的「動畫設定入口」
    enter: 'slide-enter-active', // Toast 第一次出現的時候，使用這個 class
    leave: 'slide-leave-active', // Toast 消失的時候，使用這個 class
    move: 'slide-move', // Toast 排列位置改變時的動畫
  },
})

app.use(createPinia())
app.use(router)

app.mount('#app')
