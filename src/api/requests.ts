import axios from 'axios';
import type { AxiosInstance } from 'axios';
import camelcaseKeys from 'camelcase-keys';
import { useAuthStore } from '@/stores/auth';
import getEnv from '@/utils/env';

export default {
  get $http(): AxiosInstance {
    const authStore = useAuthStore();

    const client = axios.create({
      baseURL: getEnv('API_BASE_URL'),
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
  },
};
