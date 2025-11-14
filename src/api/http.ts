import axios from 'axios';
import type { AxiosInstance } from 'axios';
import camelcaseKeys from 'camelcase-keys';
import { useAuthStore } from '@/stores/auth';

export default function createHttpClient(baseURL: string): AxiosInstance {
  const authStore = useAuthStore();

  const client = axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${authStore.token}`,
    },
  });

  client.interceptors.response.use(
    (response) => {
      response.data = camelcaseKeys(response.data, { deep: true });
      return response;
    },
    (error) => Promise.reject(error),
  );

  return client;
}
