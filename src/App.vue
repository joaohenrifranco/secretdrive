<script setup lang="ts">
import '@arco-design/web-vue/dist/arco.css'
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/AuthStore'
import { loadGoogleScripts } from './utils/loadGoogleScripts'
const { login, logout, init } = useAuthStore()

onMounted(async () => {
  await loadGoogleScripts()
  init()
  loading.value = false
})

const loading = ref<boolean>(true)
</script>

<template>
  <a-layout style="width: 100vw; height: 100vh">
    <a-page-header title="Secret Drive" :show-back="false" />
    <a-layout>
      <a-layout-sider>Sider</a-layout-sider>
      <a-layout-content
        ><div v-if="loading">Loading Google API Libraries...</div>
        <RouterView
      /></a-layout-content>
    </a-layout>
    <a-layout-footer>Footer</a-layout-footer>
  </a-layout>
</template>

<style scoped></style>
