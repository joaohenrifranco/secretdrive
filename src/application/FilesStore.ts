import { DriveAPI } from '@/infrastructure/apis/DriveAPI';
import { Crypt } from '@/infrastructure/local/Crypt';
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
    queue.value = [];
  }

  async function downloadFile(fileId: string) {
    const stream = await DriveAPI.downloadFile(fileId);
    const descryptedStream = Crypt.decrypt(stream, password.value);

    function streamToArray(stream: ReadableStream<Uint8Array>) {
      return new Response(stream).arrayBuffer();
    }
    // create blob and download
    const blob = new Blob([await streamToArray(await descryptedStream)]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileId;
    a.click();
  }

  return {
    setPassword,
    listFiles,
    downloadFile,
    addToQueue,
    processQueue,
    files,
    queue,
    password,
  };
});
