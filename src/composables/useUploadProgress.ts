import { ref, onBeforeUnmount, type Ref } from 'vue';

type UseUploadProgressOptions = {
  onFinished?: () => void;
};

export type UseUploadProgress = {
  uploadProgress: Ref<number>;
  isUploading: Ref<boolean>;
  resetProgressState: () => void;
  onUploadProgress: (rawProgress?: number | null) => void;
  completeUpload: () => void;
  cancelProgress: () => void;
};

export function useUploadProgress(
  options: UseUploadProgressOptions = {},
): UseUploadProgress {
  const uploadProgress = ref(0);
  const isUploading = ref(false);
  const isFakeProgressActive = ref(false);

  let fakeProgressTimer: ReturnType<typeof setInterval> | undefined;
  let finishProgressTimer: ReturnType<typeof setInterval> | undefined;

  const clearTimer = (timer: ReturnType<typeof setInterval> | undefined) => {
    if (timer) {
      clearInterval(timer);
    }
  };

  const resetProgressState = () => {
    uploadProgress.value = 0;
    isFakeProgressActive.value = false;
    clearTimer(fakeProgressTimer);
    fakeProgressTimer = undefined;
    clearTimer(finishProgressTimer);
    finishProgressTimer = undefined;
  };

  const stopFakeProgress = () => {
    clearTimer(fakeProgressTimer);
    fakeProgressTimer = undefined;
    isFakeProgressActive.value = false;
  };

  const startFakeProgress = () => {
    if (isFakeProgressActive.value) return;
    isFakeProgressActive.value = true;

    if (uploadProgress.value < 33) uploadProgress.value = 33;

    const TICK_MS = 100;
    fakeProgressTimer = setInterval(() => {
      if (!isUploading.value) return;
      if (uploadProgress.value >= 99) return;

      const remainder = 99 - uploadProgress.value;
      const increment = Math.max(0.1, remainder * 0.02);
      uploadProgress.value = Math.min(99, uploadProgress.value + increment);
    }, TICK_MS);
  };

  const completeUpload = () => {
    stopFakeProgress();
    clearTimer(finishProgressTimer);
    finishProgressTimer = undefined;

    const TICK_MS = 50;
    finishProgressTimer = setInterval(() => {
      const remainder = 100 - uploadProgress.value;
      if (remainder <= 0) {
        clearTimer(finishProgressTimer);
        finishProgressTimer = undefined;
        options.onFinished?.();
        return;
      }
      const increment = Math.max(1, remainder * 0.2);
      uploadProgress.value = Math.min(100, uploadProgress.value + increment);
    }, TICK_MS);
  };

  const onUploadProgress = (rawProgress?: number | null) => {
    if (!isUploading.value) {
      isUploading.value = true;
    }
    const clamped = Math.max(0, Math.min(rawProgress ?? 0, 1));
    const mapped = clamped * 33;
    if (mapped > uploadProgress.value) {
      uploadProgress.value = mapped;
    }
    if (clamped >= 1) {
      startFakeProgress();
    }
  };

  const cancelProgress = () => {
    stopFakeProgress();
    clearTimer(finishProgressTimer);
    finishProgressTimer = undefined;
    isUploading.value = false;
  };

  onBeforeUnmount(() => {
    stopFakeProgress();
    clearTimer(finishProgressTimer);
    finishProgressTimer = undefined;
  });

  return {
    uploadProgress,
    isUploading,
    resetProgressState,
    onUploadProgress,
    completeUpload,
    cancelProgress,
  };
}
