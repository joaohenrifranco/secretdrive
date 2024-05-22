<script setup lang="ts">
import { useAuthStore } from '@/application/AuthStore';

const authStore = useAuthStore();
</script>

<template>
  <a-page-header title="Secret Drive" :show-back="false" class="main-navbar">
    <template #extra>
      <a-avatar v-if="authStore.isLogged" icon="G" @click="authStore.logout" />
    </template>
  </a-page-header>
</template>

<style>
.main-navbar {
  box-shadow: 0 2px 8px #f0f0f0;
}
</style>
