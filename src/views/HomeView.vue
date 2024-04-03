<template></template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useFileStore } from '../stores/FilesStore'

const fileSelectRef = ref<HTMLInputElement | null>(null)
const { uploadFile } = useFileStore

const handleUploadClick = async () => {
  const file = fileSelectRef.value?.files?.[0]
}
</script>
