import type { AxiosInstance } from 'axios';
import getEnv from '@/utils/env';
import createHttpClient from '@/api/http';

export default {
  get $http(): AxiosInstance {
    return createHttpClient(getEnv('INTEGRATIONS_API_BASE_URL'));
  },
};
