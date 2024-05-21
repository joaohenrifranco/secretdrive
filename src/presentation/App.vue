<script setup>
import { useAuthStore } from '@/application/AuthStore';
import MainLayout from '@/presentation/layouts/MainLayout.vue';
import { onMounted, ref } from 'vue';
import { initGoogleScripts } from '../services/apis/loadGoogleScripts';

const authStore = useAuthStore();
const loading = ref(true);

onMounted(async () => {
  await initGoogleScripts();
  authStore.init();
  loading.value = false;
});
</script>

<template>
  <a-spin v-if="loading" size="40" tip="Loading Google APIs..." class="spin" />
  <MainLayout v-else />
</template>

<style scoped>
.spin {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
