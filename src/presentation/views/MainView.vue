<script setup lang="ts">
import { useAuthStore } from '@/application/AuthStore';
import MainNavbar from '@/presentation/views/MainNavbar.vue';
import { RouterView } from 'vue-router';
const authStore = useAuthStore();

const handleOk = () => {
  authStore.login();
};
</script>

<template>
  <div class="main-view">
    <MainNavbar />
    <RouterView />
  </div>
  <a-modal :open="!authStore.isLogged" @ok="handleOk" hide-cancel ok-text="Login">
    <div>Connect your Google Account to continue</div>
  </a-modal>
</template>

<style scoped>
.main-view {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
