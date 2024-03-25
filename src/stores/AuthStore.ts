import { GoogleAuth } from '@/services/GoogleAuthAPI'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const AuthStore = defineStore('AuthStore', () => {
  const isLogged = ref(false)

  GoogleAuth.onTokenChange = (token: string) => {
    isLogged.value = !!token
  }

  function login() {
    GoogleAuth.requestToken()
  }

  function logout() {
    GoogleAuth.revokeToken()
  }

  return {
    isLogged,
    login,
    logout
  }
})
