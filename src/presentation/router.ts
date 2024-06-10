import { useAuthStore } from '@/application/AuthStore';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'explorer',
      component: () => import('@/presentation/views/explorer/ExplorerView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      meta: { public: true },
      component: () => import('@/presentation/views/login/LoginView.vue'),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  authStore.setOnLogout(() => router.push({ name: 'login' }));

  if (to.meta.public || authStore.isLogged) {
    return next();
  }

  return next({ name: 'login' });
});

export default router;
