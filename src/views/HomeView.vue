<template>
  <div class="home-view">
    <div class="file-grid">
      <div class="file" v-for="file in filesStore.files" :key="file.id">
        <ph-file :size="32" />
        {{ file.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhFile } from '@phosphor-icons/vue';
import { onMounted, ref } from 'vue';
import { useFilesStore } from '../stores/FilesStore';
const fileSelectRef = ref<HTMLInputElement | null>(null);
const filesStore = useFilesStore();

const handleUploadClick = async () => {
  const file = fileSelectRef.value?.files?.[0];
};

onMounted(() => {
  filesStore.listFiles();
});
</script>

<style scoped>
.home-view {
  display: flex;
  width: 100%;
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
