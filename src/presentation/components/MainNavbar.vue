<script setup lang="ts">
import { useAuthStore } from '@/application/AuthStore';
import { useFilesStore } from '@/application/FilesStore';
import UploadButton from '@/presentation/components/UploadButton.vue';

const filesStore = useFilesStore();
const authStore = useAuthStore();
</script>

<template>
  <a-page-header title="Secret Drive" :show-back="false">
    <template #extra>
      {{ filesStore.queue }}
      <a-button @click="filesStore.listFiles()">Refresh files</a-button>
      <a-button @click="filesStore.processQueue()">Process queue</a-button>
      <a-input @change="filesStore.setPassword($event.target.value)"></a-input>
      <UploadButton />
      <a-avatar v-if="authStore.isLogged" icon="G" @click="authStore.logout" />
    </template>
  </a-page-header>
</template>
