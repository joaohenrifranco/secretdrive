<script setup>
import { useAuthStore } from '@/application/AuthStore';
import { initGoogleScripts } from '@/infrastructure/apis/loadGoogleScripts';
import MainView from '@/presentation/views/MainView.vue';
import { onMounted, ref } from 'vue';
import LoadingView from './views/LoadingView.vue';

const authStore = useAuthStore();
const loading = ref(true);

onMounted(async () => {
  await initGoogleScripts();
  authStore.init();
  loading.value = false;
});
</script>

<template>
  <LoadingView v-if="loading" />
  <MainView v-else />
</template>

<style scoped></style>
