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


const appTheme = {
  "token": {
    "fontSize": 16,
    "borderRadius": 2,
    "wireframe": false,
    "colorPrimary": "#221827"
  },
  // algorithm: theme.darkAlgorithm,
};

</script>

<template>
  <a-config-provider :theme="appTheme">
    <LoadingView v-if="loading" />
    <MainView v-else />
  </a-config-provider>
</template>

<style scoped></style>
