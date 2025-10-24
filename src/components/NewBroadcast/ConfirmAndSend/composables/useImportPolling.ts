import { computed, onBeforeUnmount, ref } from 'vue';
import { ContactImportStatus } from '@/types/contactImport';
import type { ContactImportStore } from '@/stores/contactImport';

export function useImportPolling(contactImportStore: ContactImportStore) {
  const timeoutId = ref<ReturnType<typeof setTimeout> | undefined>(undefined);

  const importNotCompleted = computed(() => {
    return (
      contactImportStore.contactImportInfo.status ===
        ContactImportStatus.PENDING ||
      contactImportStore.contactImportInfo.status ===
        ContactImportStatus.PROCESSING
    );
  });

  const start = async () => {
    if (!contactImportStore.import) {
      return;
    }

    await contactImportStore.getImportInfo(contactImportStore.import.importId);

    if (importNotCompleted.value) {
      timeoutId.value = setTimeout(() => {
        start();
      }, 5000);
    }
  };

  onBeforeUnmount(() => {
    if (timeoutId.value) {
      clearTimeout(timeoutId.value);
    }
  });

  return { importNotCompleted, start };
}
