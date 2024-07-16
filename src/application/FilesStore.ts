import { DriveAPI } from '@/infrastructure/apis/DriveAPI';
import { Crypt } from '@/infrastructure/local/Crypt';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useFilesStore = defineStore('FilesStore', () => {
  const password = ref('');
  const queue = ref<{ name: string; stream: ReadableStream }[]>([]);
  const isProcessingQueue = ref(false);
  const isDownloading = ref(false);
  const isListLoading = ref(false);
  const isDeleting = ref(false);
  const files = ref<{ id: string | undefined; name: string | undefined }[]>([]);

  const isPasswordSet = computed<boolean>(() => password.value.length > 0);
  const isLoading = computed(
    () => isProcessingQueue.value || isDownloading.value || isListLoading.value || isDeleting.value,
  );

  const setPassword = (newPassword: string) => {
    password.value = newPassword;
  };

  const removePassword = () => {
    password.value = '';
  };

  async function reloadFilesList() {
    isListLoading.value = true;
    const response = await DriveAPI.listFiles();

    files.value = await Promise.all(
      response.map(async (f) => ({
        id: f.id,
        name: (await Crypt.decryptString(f.name, password.value)) ?? 'unknown_name',
      })),
    );

    isListLoading.value = false;
  }

  async function deleteFiles(fileIds: string[]) {
    isDeleting.value = true;
    await DriveAPI.deleteFiles(fileIds);
    isDeleting.value = false;
    await reloadFilesList();
  }

  async function uploadFile(name: string, stream: ReadableStream) {
    const encryptedStream = await Crypt.encrypt(stream, password.value);
    const encryptedName = await Crypt.encryptString(name, password.value);
    await DriveAPI.uploadFile(encryptedName, encryptedStream);
    await reloadFilesList();
  }

  async function addToQueue(fileList: FileList) {
    for (const file of fileList) {
      queue.value.push({ name: file.name, stream: file.stream() });
    }
  }

  async function processQueue() {
    isProcessingQueue.value = true;
    for (const { name, stream } of queue.value) {
      queue.value = queue.value.slice(1);
      await uploadFile(name, stream);
    }
    queue.value = [];
    isProcessingQueue.value = false;
  }

  async function downloadFile(fileId: string) {
    const stream = await DriveAPI.downloadFile(fileId);
    const descryptedStream = Crypt.decrypt(stream, password.value);
    const name = files.value.find((f) => f.id === fileId)?.name;

    if (!name || !descryptedStream) {
      throw new Error('Failed to download file');
    }

    function streamToArray(stream: ReadableStream<Uint8Array>) {
      return new Response(stream).arrayBuffer();
    }
    // create blob and download
    const blob = new Blob([await streamToArray(await descryptedStream)]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  }

  async function downloadFiles(fileIds: string[]) {
    isDownloading.value = true;
    for (const fileId of fileIds) {
      await downloadFile(fileId);
    }
    isDownloading.value = false;
  }

  return {
    isProcessingQueue,
    files,
    queue,
    password,
    setPassword,
    removePassword,
    fetchFilesList: reloadFilesList,
    deleteFiles,
    uploadFile,
    addToQueue,
    processQueue,
    downloadFiles,
    isPasswordSet,
    isLoading,
  };
});
