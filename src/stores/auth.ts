import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
  }),
  actions: {
    setToken(authToken: string) {
      authToken = authToken.replace('Bearer', '').trim();
      this.token = authToken;
    },
  },
});
