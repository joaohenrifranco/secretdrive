<script setup lang="ts">
import { useAuthStore } from '@/application/AuthStore';
import { useFilesStore } from '@/application/FilesStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const filesStore = useFilesStore();
</script>

<template>
  <a-page-header title="Secret Drive" :show-back="false" class="main-navbar">
    <template #extra>
      <div class="nav-left">
        <a-spin v-if="filesStore.isLoading" />
        <a-avatar
          v-if="authStore.isLogged"
          icon="G"
          @click="router.push('login')"
          style="cursor: pointer"
        />
      </div>
    </template>
  </a-page-header>
</template>

<style>
.main-navbar {
  box-shadow: 0 2px 8px #f0f0f0;

  .nav-left {
    display: flex;
    align-items: center;
    gap: 30px;
  }
}
</style>
