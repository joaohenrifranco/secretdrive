<template>
  {{ access_token }}
  <div>
    <h1>SecretDrive</h1>
    <button @click="getToken" v-if="!access_token">Get access token</button>
    <button @click="revokeToken" v-if="access_token">Revoke token</button>
    <br />
    <br />
    <button @click="listFiles" v-if="access_token">List files</button>
    <ul>
      <li v-for="file in files" :key="file.id">{{ file.id }} - {{ file.name }}</li>
    </ul>
    <br />
    <input ref="fileSelectRef" type="file" id="upload-encrypted" />
    <input v-model="password" id="password" type="text" placeholder="Enter the password" />
    <input
      id="upload-encrypted"
      type="button"
      value="Upload Encrypted"
      @click="handleUploadClick"
    />
    <button @click="mockUpload">Mock upload</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useFilesStore } from '../stores/FilesStore'

const fileSelectRef = ref<HTMLInputElement | null>(null)
const { uploadFile } = useFilesStore

const handleUploadClick = async () => {
  const file = fileSelectRef.value?.files?.[0]
}

onMounted(() => {
  initClient()
})
</script>
