import { GoogleAuthAPI, type TokenData } from '@/infrastructure/apis/GoogleAuthAPI';
import { LocalStorage } from '@/infrastructure/local/LocalStorage';
import { defineStore } from 'pinia';
import { ref } from 'vue';

const LOCAL_STORAGE_KEY = 'tokenData';

export const useAuthStore = defineStore('AuthStore', () => {
  const isLogged = ref(false);
  const tokenStorage = new LocalStorage<string>(LOCAL_STORAGE_KEY);

  GoogleAuthAPI.onTokenChange = (tokenData: TokenData) => {
    isLogged.value = !!tokenData.access_token;
    tokenStorage.save(tokenData.access_token, tokenData.expires_at);
  };

  function login() {
    GoogleAuthAPI.requestToken('consent');
  }

  function logout() {
    GoogleAuthAPI.revokeToken();
    tokenStorage.clear();
    isLogged.value = false;
    onLogout?.();
  }

  function init() {
    const access_token = tokenStorage.load();
    isLogged.value = !!access_token;
    GoogleAuthAPI.initClient(access_token);
  }

  function getExpirationDate(): Date | null {
    return tokenStorage.getExpirationDate();
  }

  let onLogout: (() => void) | null = null;
  function setOnLogout(callback: () => void) {
    onLogout = callback;
  }

  return {
    isLogged,
    login,
    logout,
    init,
    getExpirationDate,
    setOnLogout,
  };
});
