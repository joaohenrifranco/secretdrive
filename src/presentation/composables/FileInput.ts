import { useFilesStore } from '@/application/FilesStore';
import { ref, watch, type Ref } from 'vue';

const createHiddenInput = (parentNode: HTMLElement, handleInputChange: () => void) => {
  if (!parentNode.appendChild) {
    throw new Error('Parent node is not an appendable HTMLElement');
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.style.display = 'none';
  input.addEventListener('change', handleInputChange);
  parentNode.appendChild(input);
  return input;
};

export function useFileInput(parentRef: Ref<HTMLElement | null>) {
  const filesStore = useFilesStore();
  const hiddenInput = ref<HTMLInputElement | null>(null);

  watch(parentRef, (newParent) => {
    if (newParent) {
      hiddenInput.value = createHiddenInput(newParent, handleInputChange);
    }
  });

  const handleInputChange = () => {
    const files = hiddenInput.value?.files;
    if (files && files.length) {
      filesStore.addToQueue(files);
    }
  };

  return {
    handleClick: () => hiddenInput.value?.click(),
  };
}
