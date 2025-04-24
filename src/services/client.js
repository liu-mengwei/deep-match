import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 可选，用于添加认证令牌等
// apiClient.interceptors.request.use(
//   (config) => {
//     // 从本地存储获取令牌
//     const token = localStorage.getItem('token');

//     // 如果令牌存在，添加到请求头
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

// 响应拦截器 - 直接返回 response.data
apiClient.interceptors.response.use(
  (response) => {
    // 成功响应直接返回数据部分
    return response.data;
  },
  (error) => {
    // 处理响应错误
    // 请求设置时出现问题
    console.error('请求错误', { code: error.status, message: error.response?.data?.message || '' });
    return Promise.reject(error);
  },
);

export default apiClient;
