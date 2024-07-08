import { GoogleAuthAPI, type TokenData } from '@/infrastructure/apis/GoogleAuthAPI';
import { LocalStorage } from '@/infrastructure/local/LocalStorage';
import router from '@/infrastructure/router';
import { defineStore } from 'pinia';
import { ref } from 'vue';

const LOCAL_STORAGE_KEY = 'tokenData';

export const useAuthStore = defineStore('AuthStore', () => {
  const isLogged = ref(false);
  const tokenStorage = new LocalStorage<string>(LOCAL_STORAGE_KEY);

  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    if (to.meta.public || authStore.isLogged) {
      return next();
    }
    return next({ name: 'login' });
  });

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
    router.push({ name: 'login' });
  }

  function init() {
    const access_token = tokenStorage.load();
    isLogged.value = !!access_token;
    GoogleAuthAPI.initClient(access_token);
  }

  function getExpirationDate(): Date | null {
    return tokenStorage.getExpirationDate();
  }

  return {
    isLogged,
    login,
    logout,
    init,
    getExpirationDate,
  };
});
