<script setup lang="ts">
import { useAuthStore } from '@/application/AuthStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
</script>

<template>
  <a-page-header title="Secret Drive" :show-back="false" class="main-navbar">
    <template #extra>
      <a-avatar v-if="authStore.isLogged" icon="G" @click="router.push('login')" style="cursor: pointer;"/>
    </template>
  </a-page-header>
</template>

<style>
.main-navbar {
  box-shadow: 0 2px 8px #f0f0f0;
}
</style>
