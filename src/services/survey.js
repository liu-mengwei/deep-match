import apiClient from './client';

// 获取草稿
export async function getSurveyDraft() {
  const result = await apiClient.get(`/survey/draft`);
  return result; // 这里是响应的data部分
}

// 创建新草稿
export async function createSurveyDraft(data) {
  const result = await apiClient.post('/survey/draft', data);
  return result;
}

// 更新现有草稿
export async function updateSurveyDraft(data) {
  const result = await apiClient.put('/survey/draft', data);
  return result;
}

export async function deleteSurveyDraft() {
  const result = await apiClient.delete(`/survey/draft`);
  return result; // 这里是响应的data部分
}

export async function submitSurvey(data) {
  const result = await apiClient.post('/survey/submit', data);
  return result; // 这里是响应的data部分
}

export async function getSubmittedSurvey() {
  const result = await apiClient.get(`/survey/result`);
  return result; // 这里是响应的data部分
}
