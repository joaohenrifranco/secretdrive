import { Crypt } from '@/services/Crypt';
import { DriveAPI } from '@/services/DriveAPI';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFilesStore = defineStore('FilesStore', () => {
  const password = ref('');
  const queue = ref<{ name: string; stream: ReadableStream }[]>([]);

  const setPassword = (newPassword: string) => {
    password.value = newPassword;
  };

  const files = ref<{ id: string | undefined; name: string | undefined }[]>([]);

  async function listFiles() {
    files.value = await DriveAPI.listFiles();
  }

  async function uploadFile(name: string, stream: ReadableStream) {
    const encryptedStream = await Crypt.encrypt(stream, password.value);
    await DriveAPI.uploadFile(name, encryptedStream);
  }

  async function addToQueue(fileList: FileList) {
    for (const file of fileList) {
      queue.value.push({ name: file.name, stream: file.stream() });
    }
  }

  async function processQueue() {
    for (const { name, stream } of queue.value) {
      await uploadFile(name, stream);
    }
    // queue.value = [];
  }

  async function downloadFile(fileId: string) {
    const stream = await DriveAPI.downloadFile(fileId);
    return Crypt.decrypt(stream, password.value);
  }

  return {
    setPassword,
    listFiles,
    uploadFile,
    downloadFile,
    addToQueue,
    processQueue,
    files,
    queue,
    password,
  };
});
