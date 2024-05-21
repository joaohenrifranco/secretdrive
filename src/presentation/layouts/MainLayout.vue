<script setup lang="ts">
import { useAuthStore } from '@/application/AuthStore';
import MainNavbar from '@/presentation/components/MainNavbar.vue';
import { ref } from 'vue';
import { RouterView } from 'vue-router';
const authStore = useAuthStore();

const loading = ref<boolean>(true);
const visible = ref(false);

const handleOk = () => {
  authStore.login();
  visible.value = false;
};
</script>

<template>
  <div class="main-layout">
    <MainNavbar />
    <section class="main">
      <RouterView />
    </section>
  </div>
  <a-modal :open="!loading && !authStore.isLogged" @ok="handleOk" hide-cancel ok-text="Login">
    <div>Connect your Google Account to continue</div>
  </a-modal>
</template>

<style scoped>
.main-layout {
  height: 100vh;
  background-color: #f6f6f6;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
