<template>
  {{ access_token }}
  <div>
    <h1>Google Identity Services Authorization Token model</h1>
    <button @click="getToken">Get access token</button><br /><br />
    <button @click="revokeToken">Revoke token</button>
    <button @click="listFiles">List files</button>
    <div>{{ files }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const client = ref<google.accounts.oauth2.TokenClient | null>(null)
const access_token = ref<string | null>(null)
const files = ref<gapi.client.drive.File[]>([])

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

const handleTokenResponse = (tokenResponse: google.accounts.oauth2.TokenResponse) => {
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
    fields: "files(id, name)",
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
    scope: 'https://www.googleapis.com/auth/drive.metadata.readonly',
    callback: handleTokenResponse
  })
}

onMounted(() => {
  initClient()
})
</script>
