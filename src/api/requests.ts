import axios from 'axios';
import type { AxiosInstance } from 'axios';
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

    return client;
  },
};
