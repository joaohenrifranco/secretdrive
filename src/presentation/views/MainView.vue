<script setup lang="ts">
import MainNavbar from '@/presentation/views/MainNavbar.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <div class="main-view">
    <MainNavbar />
    <RouterView />
  </div>
</template>

<style scoped>
.main-view {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
