import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function submitAnswers(answers) {
  try {
    const response = await apiClient.post('/assessment', { answers });
    console.log(response, 'response');
    return response.data;
  } catch (error) {
    console.error('Error submitting answers:', error);
    throw error;
  }
}
