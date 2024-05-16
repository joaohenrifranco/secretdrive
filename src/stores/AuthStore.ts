import { GoogleAuthAPI, type TokenData } from '@/apis/GoogleAuthAPI';
import { LocalStorage } from '@/services/LocalStorage';
import { defineStore } from 'pinia';
import { ref } from 'vue';

const LOCAL_STORAGE_KEY = 'tokenData';

export const useAuthStore = defineStore('AuthStore', () => {
  const isLogged = ref(false);
  const tokenStorage = new LocalStorage<TokenData>(LOCAL_STORAGE_KEY);

  GoogleAuthAPI.onTokenChange = (tokenData: TokenData) => {
    isLogged.value = !!tokenData.access_token;
    tokenStorage.save(tokenData);
  };

  function login() {
    GoogleAuthAPI.requestToken('consent');
  }

  function logout() {
    GoogleAuthAPI.revokeToken();
    tokenStorage.clear();
    isLogged.value = false;
  }

  function init() {
    const tokenData = tokenStorage.load();
    GoogleAuthAPI.initClient(tokenData?.access_token);
  }

  return {
    isLogged,
    login,
    logout,
    init,
  };
});
