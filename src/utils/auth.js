/**
 * 检查JWT token是否有效（未过期）
 * @returns {boolean} token是否有效
 */
export const isTokenValid = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  try {
    // 解析JWT的payload部分(第二段)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Base64解码并解析JSON
    const payload = JSON.parse(atob(parts[1]));

    // 检查是否包含过期时间
    if (!payload || !payload.exp) {
      return false;
    }

    // 比较当前时间和过期时间(exp是UTC秒级时间戳)
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch (error) {
    console.error('Token验证失败:', error);
    return false;
  }
};

/**
 * 清除无效token
 */
export const clearInvalidToken = () => {
  if (!isTokenValid()) {
    localStorage.removeItem('token');
  }
};
