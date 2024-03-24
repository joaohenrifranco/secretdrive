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
  </div>
</template>

<script setup lang="ts">
import * as openpgp from 'openpgp'
import { onMounted, ref } from 'vue'

const client = ref<google.accounts.oauth2.TokenClient | null>(null)
const access_token = ref<string | null>(null)
const files = ref<gapi.client.drive.File[]>([])
const password = ref<string | null>(null)
const fileSelectRef = ref<HTMLInputElement | null>(null)

async function encrypt(inputStream: ReadableStream, password: string): Promise<ReadableStream> {
  const message = await openpgp.createMessage({ binary: inputStream })

  const encrypted = await openpgp.encrypt({
    message, // input as Message object
    passwords: password,
    format: 'binary' // don't ASCII armor (for Uint8Array output)
  })

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encrypted.getReader().read())
      controller.close()
    }
  })
}

async function upload(encryptedStream: ReadableStream): Promise<string | undefined> {
  // using gapi
  const response = await gapi.client.drive.files.create({
    resource: {
      name: 'encrypted-file',
      mimeType: 'application/octet-stream'
    },
    media: {
      body: encryptedStream
    }
  })

  return response.result.id
}

const handleUploadClick = async () => {
  const file = fileSelectRef.value?.files?.[0]

  if (!file) {
    console.error('No file selected')
    return
  }

  if (!password.value) {
    console.error('No password provided')
    return
  }

  const encryptedStream = await encrypt(file?.stream(), password.value)
  const fileId = await upload(encryptedStream)

  console.log('File uploaded with id:', fileId)
}

const getToken = () => {
  client.value?.requestAccessToken()
}

const saveToken = (token: string) => {
  access_token.value = token
  localStorage.setItem('access_token', token)
  console.log('access token saved')
}

const loadToken = () => {
  const token = localStorage.getItem('access_token')
  if (token) {
    access_token.value = token
    console.log('access token loaded')
  }
}

const removeToken = () => {
  localStorage.removeItem('access_token')
  access_token.value = null
  console.log('access token removed')
}

const revokeToken = () => {
  if (!access_token.value) {
    console.error('No access token to revoke')
    return
  }
  google.accounts.oauth2?.revoke(access_token.value, () => console.log('access token revoked'))
  removeToken()
}

const handleTokenResponse = async (tokenResponse: google.accounts.oauth2.TokenResponse) => {
  saveToken(tokenResponse.access_token)
  access_token.value = tokenResponse.access_token
}

const listFiles = async () => {
  if (!access_token.value) {
    console.error('No access token available')
    return
  }

  const response = await gapi.client.drive.files.list({
    pageSize: 20,
    fields: 'files(id, name)'
  })

  files.value = response.result.files ?? []
}

const initClient = async () => {
  if (!google || !google.accounts || !google.accounts.oauth2) {
    console.error('Google Accounts OAuth2 is not available')
    return
  }

  loadToken()

  client.value = google.accounts.oauth2.initTokenClient({
    client_id: '1028248986339-5tvr5e00e160ckqj5vuka7dokr3ipjol.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/drive.file',
    prompt: 'consent',
    callback: handleTokenResponse
  })
}

onMounted(() => {
  initClient()
})
</script>
