<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'

function initGsi() {
  return new Promise((resolve) => {
    const gsiScriptTag = document.createElement('script')
    gsiScriptTag.src = 'https://accounts.google.com/gsi/client'
    gsiScriptTag.async = true
    gsiScriptTag.defer = true
    gsiScriptTag.onload = resolve
    document.body.appendChild(gsiScriptTag)
  })
}

function initGapi() {
  return new Promise((resolve) => {
    const gapiScriptTag = document.createElement('script')
    gapiScriptTag.src = 'https://apis.google.com/js/api.js'
    gapiScriptTag.async = true
    gapiScriptTag.defer = true
    gapiScriptTag.onload = resolve
    document.body.appendChild(gapiScriptTag)
  })
}

function loadGapiClient() {
  return new Promise((resolve) => {
    gapi.load('client:auth2', resolve)
  })
}

async function initGapiClient() {
  const API_KEY = 'AIzaSyCJAOid4cx0eD1EdI8oSCgnJtAc4I-SrlE'
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'

  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC]
  })
}

onMounted(async () => {
  await initGsi()
  await initGapi()
  await loadGapiClient()
  await initGapiClient()
  loading.value = false
})

const loading = ref<boolean>(true)
</script>

<template>
  <div v-if="loading">Loading Google API Libraries...</div>
  <RouterView v-else />
</template>

<style scoped></style>
