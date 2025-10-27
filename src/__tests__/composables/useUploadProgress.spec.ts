import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUploadProgress } from '@/composables/useUploadProgress';

// mock onBeforeUnmount for this composable
vi.mock('vue', async (importOriginal) => ({
  ...(await importOriginal()),
  onBeforeUnmount: vi.fn(),
}));

describe('useUploadProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initial state is correct', () => {
    const composable = useUploadProgress();
    expect(composable.uploadProgress.value).toBe(0);
    expect(composable.isUploading.value).toBe(false);
  });

  it('maps raw progress [0..1] to [0..33] and sets isUploading', () => {
    const { onUploadProgress, uploadProgress, isUploading } =
      useUploadProgress();
    onUploadProgress(0.5);
    expect(isUploading.value).toBe(true);
    expect(uploadProgress.value).toBeCloseTo(16.5, 1);
  });

  it('starts fake progress when reaching 1 and approaches 99', () => {
    const { onUploadProgress, uploadProgress } = useUploadProgress();
    onUploadProgress(1);
    // First tick will ensure base to >= 33
    vi.advanceTimersByTime(1000);
    expect(uploadProgress.value).toBeGreaterThanOrEqual(33);
    expect(uploadProgress.value).toBeLessThanOrEqual(99);
  });

  it('completeUpload increments to 100 and calls onFinished', async () => {
    const onFinished = vi.fn();
    const { onUploadProgress, completeUpload, uploadProgress } =
      useUploadProgress({ onFinished });

    onUploadProgress(1);
    completeUpload();
    vi.advanceTimersByTime(1000);

    expect(uploadProgress.value).toBe(100);
    expect(onFinished).toHaveBeenCalled();
  });

  it('cancelProgress stops fake and finish timers and resets uploading flag', () => {
    const { onUploadProgress, cancelProgress, isUploading } =
      useUploadProgress();
    onUploadProgress(1);
    expect(isUploading.value).toBe(true);
    cancelProgress();
    vi.advanceTimersByTime(500);
    expect(isUploading.value).toBe(false);
  });

  it('resetProgressState clears progress and timers', () => {
    const { onUploadProgress, resetProgressState, uploadProgress } =
      useUploadProgress();
    onUploadProgress(0.8);
    expect(uploadProgress.value).toBeGreaterThan(0);
    resetProgressState();
    expect(uploadProgress.value).toBe(0);
  });
});
