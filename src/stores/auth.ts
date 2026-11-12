import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 'auth'：Pinia 用來辨認這個 Store 的 ID
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const role = ref(localStorage.getItem('role') || '')
  const userID = ref(localStorage.getItem('userID') || '')

  function setInfo(newUsername: string, newRole: string, newUserID: string) {
    username.value = newUsername
    localStorage.setItem('username', newUsername)
    role.value = newRole
    localStorage.setItem('role', newRole)
    userID.value = newUserID
    localStorage.setItem('userID', newUserID)
    console.log('username: ', username.value)
    console.log('role: ', role.value)
    console.log('userID: ', userID.value)
  }

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
    // 即使按 F5 重新整理，localStorage 還在，Pinia 初始化時就可以把它讀回來
    // localStorage → 同一個網站的資料可以跨分頁、重新整理、重新開啟瀏覽器保留
    // sessionStorage → 每個分頁各自獨立，缺點是 F5 後還在(同一個分頁內重新整理會保留)，關掉頁面後會消失
    console.log('token: ', token.value)
  }

  function logout() {
    token.value = ''
    username.value = ''
    role.value = ''

    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
  }

  return { token, username, role, userID, setInfo, setToken, logout }
})
