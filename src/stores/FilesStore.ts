import { Crypt } from '@/services/Crypt'
import { DriveAPI } from '@/services/DriveAPI'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFileStore = defineStore('FileStore', () => {
  const password = ref('')

  const setPassword = (newPassword: string) => {
    password.value = newPassword
  }

  const files = ref<{ id: string | undefined; name: string | undefined }[]>([])

  async function listFiles() {
    files.value = await DriveAPI.listFiles()
  }

  async function addFile(name: string, stream: ReadableStream) {
    const encryptedStream = await Crypt.encrypt(stream, password.value)
    await DriveAPI.uploadFile(name, encryptedStream)
  }

  async function downloadFile(fileId: string) {
    const stream = await DriveAPI.downloadFile(fileId)
    return Crypt.decrypt(stream, password.value)
  }

  return {
    setPassword,
    listFiles,
    addFile,
    downloadFile,
    files
  }
})
