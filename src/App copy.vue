<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/BaseButton.vue'
import { useToast } from 'vue-toastification'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const isCollapsed = ref(window.innerWidth <= 768) // 手機模式預設選單閉合

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  console.log(isCollapsed.value)
}

const logout = () => {
  authStore.logout()
  toast.success('登出成功!')
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="layout">
    <aside v-if="route.name !== 'login'" :class="{ collapsed: isCollapsed }">
      <nav>
        <div class="main-menu" @click="toggleSidebar">
          <i class="fa-solid fa-bars"></i>
          <span>主選單</span>
        </div>
        <RouterLink :to="{ name: 'home' }">
          <i class="fa-solid fa-gauge"></i>
          <span>總覽</span>
        </RouterLink>
        <RouterLink :to="{ name: 'profile' }">
          <!--$route.path提供目前網址路徑-->
          <i class="fa-solid fa-user"></i>
          <span>個人資料</span>
        </RouterLink>
        <RouterLink :to="{ name: 'tasks' }">
          <i class="fa-solid fa-calendar-check"></i>
          <span>任務</span>
        </RouterLink>
        <RouterLink :to="{ name: 'password' }">
          <i class="fa-solid fa-lock"></i>
          <span>修改密碼</span>
        </RouterLink>
        <RouterLink :to="{ name: 'admin-users' }" v-if="authStore.role === 'admin'">
          <i class="fa-solid fa-users-gear"></i>
          <span>管理者</span>
        </RouterLink>
      </nav>
      <div class="sidebar-button">
        <BaseButton @click="logout"
          ><i class="fa-solid fa-right-from-bracket"></i><span>登出</span>
        </BaseButton>
      </div>
    </aside>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  background-color: var(--background-blue);
}

h1 {
  text-align: center;
}

.layout {
  display: flex;
  height: 100vh;
  flex-direction: row;
  /* gap: 20px; */
  align-items: flex-start;
}

aside {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 130px;
  height: 100vh;
}

aside.collapsed {
  width: 45px;
}

aside.collapsed nav span,
aside.collapsed .sidebar-button {
  display: none;
}

nav {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto; /**/
  background-color: white;
}

nav .main-menu,
nav a {
  border: none;
  padding: 10px;
  width: 100%;
  height: 50px;
  text-decoration: none;
  color: black;
}

nav .main-menu:hover,
nav a:hover {
  background-color: var(--nav-hover-blue);
}

.router-link-active,
.router_active {
  width: 130px;
  border-left: 2px solid blue;
  padding-left: 8px;
  background-color: var(--nav-choose-blue);
  /*router-link-active：只要路徑「包含」就會亮（可能多個亮）
    router-link-exact-active：完全符合才亮*/
}

aside.collapsed .router-link-active,
aside.collapsed .router_active {
  width: 45px;
}

nav .main-menu *,
nav a * {
  padding: 5px;
}

aside .sidebar-button {
  margin-top: auto;
  margin-bottom: 10px;
}

aside .sidebar-button button * {
  margin: 0 2px;
}

/*-----------------------------------------------------*/

main {
  flex: 1; /* 在 Flex 父元素裡，讓這個元素自動吃掉剩餘空間 */
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column; /* 排列順序 */
}

@media (max-width: 768px) {
}
</style>
