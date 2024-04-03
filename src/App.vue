<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { loadGoogleScripts } from './utils/loadGoogleScripts'
import { useAuthStore } from './stores/AuthStore'
import MainNavbar from '@/components/ui/navbar/MainNavbar.vue'

const { login, logout, init } = useAuthStore()

onMounted(async () => {
  await loadGoogleScripts()
  init()
  loading.value = false
})

const loading = ref<boolean>(true)
</script>

<template>
  <MainNavbar />
  <div v-if="loading">Loading Google API Libraries...</div>
  <RouterView v-else />
</template>

<style scoped>
.navbar {
  width: 100%;
  height: 60px;
  background-color: #333;
}
</style>
