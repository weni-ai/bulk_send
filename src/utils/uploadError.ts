import type { AxiosError } from 'axios';

export const parseUploadError = (error: AxiosError): Error => {
  const responseData = error.response?.data as { error?: string };

  if (!responseData || !responseData.error) {
    return new Error('Unknown error while uploading contact import');
  }

  const errorMessage = responseData.error;

  let jsonMessage: string[] = [];
  if (errorMessage) {
    try {
      jsonMessage = JSON.parse(errorMessage);
    } catch {
      jsonMessage = JSON.parse(errorMessage.replaceAll("'", '"')) as string[];
    }
    return new Error(jsonMessage[0]);
  }

  return new Error('Unknown error while uploading contact import');
};
