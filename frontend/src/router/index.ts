import { createRouter, createWebHistory } from 'vue-router'
import { TOKEN_KEY } from '@/utils/constants'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
        },
        {
          path: 'expenses',
          name: 'Expenses',
          component: () => import('@/views/Expenses.vue'),
        },
        {
          path: 'budgets',
          name: 'Budgets',
          component: () => import('@/views/Budgets.vue'),
          meta: { requiresRole: 'creator' },
        },
        {
          path: 'reports',
          name: 'Reports',
          component: () => import('@/views/Reports.vue'),
        },
        {
          path: 'calendar',
          name: 'Calendar',
          component: () => import('@/views/Calendar.vue'),
        },
        {
          path: 'todos',
          name: 'Todos',
          component: () => import('@/views/Todos.vue'),
        },
        {
          path: 'inventory',
          name: 'Inventory',
          component: () => import('@/views/Inventory.vue'),
        },
        {
          path: 'shopping-list',
          name: 'ShoppingList',
          component: () => import('@/views/ShoppingList.vue'),
        },
        {
          path: 'family',
          name: 'Family',
          component: () => import('@/views/Family.vue'),
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/Settings.vue'),
        },
      ],
    },
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'Login',
          component: () => import('@/views/auth/Login.vue'),
        },
        {
          path: 'register',
          name: 'Register',
          component: () => import('@/views/auth/Register.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (to.meta.requiresAuth && !token) {
    next('/auth/login')
  } else {
    next()
  }
})

export default router
