<template>
  <div class="home-view">
    <div class="file-grid">
      <div
        class="file"
        v-for="file in filesStore.files"
        :key="file.id"
        @click="file.id && filesStore.downloadFile(file.id)"
      >
        <PhFile :size="32" />
        {{ file.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFilesStore } from '@/application/FilesStore';
import { PhFile } from '@phosphor-icons/vue';
import { onMounted } from 'vue';
const filesStore = useFilesStore();

onMounted(() => {
  filesStore.listFiles();
});
</script>

<style scoped>
.home-view {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 20px;
}

.file-grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.file {
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100px;
  height: 80px;
  gap: 10px;
  padding: 5px 10px;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0 0 5px (0, 0, 0, 0.1);
  cursor: pointer;
  text-overflow: ellipsis;
}
</style>