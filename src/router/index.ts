import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import Profile from '@/views/Profile.vue'
import Tasks from '@/views/Tasks.vue'
import Password from '@/views/Password.vue'
import AdminUsers from '@/views/AdminUsers.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: Tasks,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/password',
      name: 'password',
      component: Password,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUsers,
      meta: {
        requiresAuth: true,
        role: 'admin',
      },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  // to 是「使用者現在要去的路由」
  // 可使用 to.path / to.name / to.meta.requiresAuth / to.meta.role

  if (to.meta.requiresAuth && !authStore.token) {
    console.log('請先登入，將跳轉回登入頁')
    return '/login'
  }

  if (to.meta.role && authStore.role !== to.meta.role) {
    console.log(authStore.role)
    console.log(to.meta.role)
    console.log('沒有admin權限，將跳轉回首頁')
    return '/'
  }
})

export default router
