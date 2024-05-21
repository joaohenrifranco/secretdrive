import ExplorerView from '@/presentation/views/explorer/ExplorerView.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ExplorerView,
    },
  ],
});

export default router;
