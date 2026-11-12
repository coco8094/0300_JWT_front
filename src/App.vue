<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/BaseButton.vue'
import { useToast } from 'vue-toastification'
import { ref, computed } from 'vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const isCollapsed = ref(true)

const pageTitle = computed(() => {
  switch (route.name) {
    case 'home':
      return 'Home'
    case 'profile':
      return 'Profile'
    case 'tasks':
      return 'Task'
    case 'password':
      return 'Password'
    case 'admin-users':
      return 'Admin'
    default:
      return ''
  }
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
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
      <div class="main-menu h-[50px]" @click="toggleSidebar">
        <i :class="isCollapsed ? 'fa-solid fa-angle-right' : 'fa-solid fa-angle-left'"></i>
        <span>主選單</span>
      </div>
      <nav class="[&>a]:h-[50px]">
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
    <main class="flex flex-1 h-screen w-full justify-center items-center flex-col">
      <div
        v-if="route.name !== 'login'"
        class="bg-white w-[calc(100%-45px)] ml-[45px] md:w-full md:ml-0 h-[50px] flex shrink-0 justify-start items-center"
      >
        <h2 class="md:px-4">{{ pageTitle }}</h2>
      </div>
      <div class="flex-1 w-full overflow-auto flex justify-center items-center">
        <RouterView />
      </div>
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
  background-color: #fff;
}

aside.collapsed {
  align-items: flex-start;
}

aside.collapsed .main-menu span,
aside.collapsed nav span,
aside.collapsed .sidebar-button {
  display: none;
}

aside nav {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto; /**/
  background-color: white;
}

aside.collapsed {
  width: 45px;
}

aside .main-menu,
aside nav a {
  border: none;
  padding: 10px;
  width: 100%;
  text-decoration: none;
  background-color: white;
  color: black;
}

aside .main-menu:hover,
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

aside .main-menu *,
aside nav a * {
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

@media (max-width: 768px) {
  aside .main-menu {
    position: fixed;
    top: 0;
    left: 45px;
    z-index: 1001;
  }

  aside {
    background-color: var(--transparent-background-black);
    position: fixed;
    top: 50px;
    inset: 0;
    width: 100%;
    height: 100vh;

    transform: translateX(-100%);
    transition: transform 0.3s ease;

    z-index: 1000;
  }

  aside:not(.collapsed) {
    transform: translateX(0);
  }

  aside:not(.collapsed) .main-menu {
    left: 0;
  }

  aside:not(.collapsed) nav {
    position: fixed;
    top: 50px;
  }

  aside:not(.collapsed) .router-link-active,
  aside:not(.collapsed) .router_active {
    width: 100%;
  }

  aside .main-menu:hover {
    background-color: white;
  }

  aside.collapsed .main-menu:hover i {
    background-color: white;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
