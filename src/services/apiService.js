/**
 * API 服务封装
 * 当前使用 mock 数据，未来可替换为真实 API
 */

import { mockApiService } from './mockApiService';

// 切换 API 来源的标志
const USE_MOCK = true; // 设为 false 时使用真实 API

// API 服务
const apiService = {
  // 用户相关
  async getCurrentUser() {
    if (USE_MOCK) {
      return mockApiService.getCurrentUser();
    }
    // 实际 API 实现
    // const response = await fetch('/api/auth/profile');
    // return response.json();
  },

  // 问卷草稿相关
  async getSurveyDraft() {
    if (USE_MOCK) {
      return mockApiService.getSurveyDraft();
    }
    // 实际 API 实现
  },

  async saveSurveyDraft(data) {
    if (USE_MOCK) {
      return mockApiService.saveSurveyDraft(data);
    }
    // 实际 API 实现
  },

  async deleteSurveyDraft() {
    if (USE_MOCK) {
      return mockApiService.deleteSurveyDraft();
    }
    // 实际 API 实现
  },

  // 问卷提交相关
  async submitSurvey(data) {
    if (USE_MOCK) {
      return mockApiService.submitSurvey(data);
    }
    // 实际 API 实现
  },

  async getSubmittedSurvey() {
    if (USE_MOCK) {
      return mockApiService.getSubmittedSurvey();
    }
    // 实际 API 实现
  },
};

export default apiService;
