import { defineStore } from "pinia";
import { ref } from "vue";

export const useAccessTokenStore = defineStore('accessToken', {
  state() {
    return {
      accessToken: ref<any>()
    }
  },

  actions: {
    setToken(token: string | null) {
      this.accessToken = token;
    },

    getToken() {
      return this.accessToken;
    },
    
    clearToken() {
      this.accessToken = '';
    },

    set(token: string) {
      this.setToken(token);
    },

    get() {
      return this.accessToken;
    },
    
    clear() {
      this.clearToken();
    }
  },

  persist: true
});