import apiClient from './client';

// 发送数据示例
export async function getVerifyCode({ phone, type }) {
  // 同样直接获取data部分
  const result = await apiClient.post('/auth/verification-code', { phone, type });
  return result; // 这里是响应的data部分
}

export async function register(data) {
  // 同样直接获取data部分
  const result = await apiClient.post('/auth/register', data);
  return result; // 这里是响应的data部分
}

export async function loginPassword(data) {
  // 同样直接获取data部分
  const result = await apiClient.post('/auth/login/password', data);
  return result; // 这里是响应的data部分
}

export async function resetPassword(data) {
  // 同样直接获取data部分
  const result = await apiClient.post('/auth/reset-password', data);
  return result; // 这里是响应的data部分
}

export async function loginVerifyCode(data) {
  // 同样直接获取data部分
  const result = await apiClient.post('/auth/login/verification-code', data);
  return result; // 这里是响应的data部分
}
