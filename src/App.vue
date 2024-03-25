<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { loadGoogleScripts } from './utils/loadGoogleScripts'

onMounted(async () => {
  await loadGoogleScripts()
  loading.value = false
})

const loading = ref<boolean>(true)
</script>

<template>
  <nav style=""></nav>
  <div v-if="loading">Loading Google API Libraries...</div>
  <RouterView v-else />
</template>

<style scoped></style>
