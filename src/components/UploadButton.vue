<script setup lang="ts">
import { useFilesStore } from '@/stores/FilesStore';
import { ref } from 'vue';

const filesStore = useFilesStore();
const hiddenInput = ref<HTMLInputElement | null>(null);

const handleInputChange = () => {
  const files = hiddenInput.value?.files;
  if (files && files.length) {
    filesStore.addToQueue(files);
  }
};
</script>
<template>
  <a-button @click="hiddenInput?.click()"> Upload </a-button>
  <input ref="hiddenInput" type="file" style="display: none" @change="handleInputChange" />
</template>
