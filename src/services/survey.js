import apiClient from './client';

// 发送数据示例
export async function getSurveyDraft() {
  const result = await apiClient.get(`/survey/draft`);
  return result; // 这里是响应的data部分
}

export async function saveSurveyDraft(data) {
  const result = await apiClient.post('/survey/draft', data);
  return result; // 这里是响应的data部分
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
