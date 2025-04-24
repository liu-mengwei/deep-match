import { loginPassword, loginVerifyCode } from '@/services/auth';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
  },

  actions: {
    async login(credentials) {
      this.isLoading = true;
      this.error = null;

      try {
        let res;
        if (credentials.loginType === 'password') {
          res = await loginPassword({
            phone: credentials.phone,
            password: credentials.password,
          });
        } else {
          res = await loginVerifyCode({
            phone: credentials.phone,
            verification_code: credentials.verificationCode,
          });
        }

        this.setAuth(res.token, res.user);
        return res;
      } finally {
        this.isLoading = false;
      }
    },

    async register(userData) {
      this.isLoading = true;
      this.error = null;

      try {
        // 在实际应用中，这里会是一个API请求
        // 模拟注册成功
        const response = await new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              token: 'fake-jwt-token',
              user: {
                id: 1,
                phone: userData.phone,
                gender: userData.gender,
                nickname: '用户' + Math.floor(Math.random() * 10000),
              },
            });
          }, 1000);
        });

        this.setAuth(response.token, response.user);
        return response;
      } catch (error) {
        this.error = error.message || '注册失败';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      try {
        // 在实际应用中，可能会有一个API请求来使token失效
        this.clearAuth();
      } catch (error) {
        console.error('登出失败:', error);
      }
    },

    setAuth(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    clearAuth() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
