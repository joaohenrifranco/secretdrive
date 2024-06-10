<script setup lang="ts">
import { useFilesStore } from '@/application/FilesStore';
import { useFileInput } from '@/presentation/composables/FileInput';
import { PhArrowsClockwise, PhFile, PhFolder, PhUpload } from '@phosphor-icons/vue';
import { onMounted, ref } from 'vue';

const uploadButton = ref<HTMLButtonElement | null>(null);
const filesStore = useFilesStore();
const fileInput = useFileInput(uploadButton);

onMounted(() => {
  filesStore.listFiles();
});
</script>

<template>
  <div class="home-view" ref="uploadButton">
    <a-float-button-group shape="square">
      <a-float-button
        @click="filesStore.processQueue()"
        :badge="{ count: filesStore.queue.length }"
      >
        <template #icon>
          <PhUpload />
        </template>
      </a-float-button>
      <a-float-button @click="fileInput.handleClick()">
        <template #icon>
          <PhFolder />
        </template>
      </a-float-button>
      <a-float-button @click="filesStore.listFiles()">
        <template #icon>
          <PhArrowsClockwise />
        </template>
      </a-float-button>
    </a-float-button-group>
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
