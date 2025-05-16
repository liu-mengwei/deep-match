import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

// 简单的错误提示函数
const showErrorMessage = (message) => {
  // 可以使用 alert，或者在页面中创建一个临时元素显示错误
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '20px';
  errorDiv.style.left = '50%';
  errorDiv.style.transform = 'translateX(-50%)';
  errorDiv.style.backgroundColor = '#ff4d4f';
  errorDiv.style.color = 'white';
  errorDiv.style.padding = '10px 20px';
  errorDiv.style.borderRadius = '4px';
  errorDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
  errorDiv.style.zIndex = '9999';
  errorDiv.textContent = message;

  document.body.appendChild(errorDiv);

  // 3秒后自动移除
  setTimeout(() => {
    if (document.body.contains(errorDiv)) {
      document.body.removeChild(errorDiv);
    }
  }, 3000);
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 可选，用于添加认证令牌等
apiClient.interceptors.request.use(
  (config) => {
    // 从本地存储获取令牌
    const token = localStorage.getItem('token');

    // 如果令牌存在，添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器 - 直接返回 response.data
apiClient.interceptors.response.use(
  (response) => {
    // 成功响应直接返回数据部分
    return response.data;
  },
  (error) => {
    // 处理响应错误
    const errorMsg = error.response?.data?.message || '服务器连接失败';
    const errorCode = error.response?.status || '未知错误';

    // 显示错误消息
    showErrorMessage(`请求错误 (${errorCode}): ${errorMsg}`);

    console.error('请求错误', { code: errorCode, message: errorMsg });
    return Promise.reject(error);
  },
);

export default apiClient;
