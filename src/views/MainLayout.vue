<script setup lang="ts">
import { useAuthStore } from '@/stores/AuthStore';
import { useFilesStore } from '@/stores/FilesStore';
import UploadButton from '@/views/components/UploadButton.vue';
import { ref } from 'vue';
import { RouterView } from 'vue-router';

const authStore = useAuthStore();
const filesStore = useFilesStore();

const loading = ref<boolean>(true);
const visible = ref(false);

const handleOk = () => {
  authStore.login();
  visible.value = false;
};
</script>

<template>
  <div class="main-layout">
    <a-page-header title="Secret Drive" :show-back="false">
      <template #extra>
        {{ filesStore.queue }}
        <a-button @click="filesStore.listFiles()">Refresh files</a-button>
        <a-button @click="filesStore.processQueue()">Process queue</a-button>
        <a-input @change="filesStore.setPassword($event.target.value)"></a-input>
        <upload-button />
        <a-avatar v-if="authStore.isLogged" icon="G" @click="authStore.logout" />
      </template>
    </a-page-header>
    <section class="main">
      <RouterView />
    </section>
  </div>
  <a-modal :open="!loading && !authStore.isLogged" @ok="handleOk" hide-cancel ok-text="Login">
    <div>Connect your Google Account to continue</div>
  </a-modal>
</template>

<style scoped>
.main {
  height: 100%;
  background-color: #f6f6f6;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
