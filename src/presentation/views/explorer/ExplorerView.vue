<script setup lang="ts">
import { useFilesStore } from '@/application/FilesStore';
import { useFileInput } from '@/presentation/composables/FileInput';
import { PhArrowsClockwise, PhDownload, PhFolder, PhTrash, PhUpload } from '@phosphor-icons/vue';
import { computed, onMounted, ref } from 'vue';

const uploadButton = ref<HTMLButtonElement | null>(null);
const filesStore = useFilesStore();
const fileInput = useFileInput(uploadButton);

onMounted(() => {
  filesStore.fetchFilesList();
});

const expandedKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);

const treeData = computed(() => {
  return filesStore.files.map((file) => ({
    title: file.name,
    key: file.id ?? '',
    isLeaf: true,
  }));
});

const handleDeleteClick = () => {
  filesStore.deleteFiles(selectedKeys.value);
  selectedKeys.value = [];
};

const handleDownloadClick = () => {
  filesStore.downloadFiles(selectedKeys.value);
  selectedKeys.value = [];
};

const handleUploadClick = () => {
  filesStore.processQueue();
};


</script>

<template>
  <div class="home-view" ref="uploadButton">
    <a-float-button-group shape="square">
      <a-float-button
        @click="handleUploadClick"
        :badge="{ count: filesStore.queue.length }"
        v-if="filesStore.queue.length > 0"
        tooltip="Upload Opened Files"
        :disabled="filesStore.isProcessingQueue"
      >
        <template #icon>
          <PhUpload />
        </template>
      </a-float-button>
      <a-float-button @click="fileInput.handleClick()" tooltip="Open Files">
        <template #icon>
          <PhFolder />
        </template>
      </a-float-button>
      <a-float-button @click="filesStore.fetchFilesList()" tooltip="Refresh File List">
        <template #icon>
          <PhArrowsClockwise />
        </template>
      </a-float-button>
      <a-float-button
        @click="handleDownloadClick"
        tooltip="Download Selected"
        :badge="{ count: selectedKeys.length }"
        v-if="selectedKeys.length"
      >
        <template #icon>
          <PhDownload />
        </template>
      </a-float-button>
      <a-float-button
        @click="handleDeleteClick"
        tooltip="Delete Selected"
        :badge="{ count: selectedKeys.length }"
        v-if="selectedKeys.length"
      >
        <template #icon>
          <PhTrash />
        </template>
      </a-float-button>
    </a-float-button-group>
    <a-directory-tree
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      :tree-data="treeData"
      multiple
    />
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 20px;
}
</style>
