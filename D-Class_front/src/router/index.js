import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/demo',
    },
    {
      path: '/demo',
      name: 'ComponentDemo',
      component: () => import('@/views/ComponentDemo.vue'),
    },
  ],
})

export default router
