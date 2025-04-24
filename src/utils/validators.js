// 验证手机号码
export const validatePhone = (phone) => {
  const phoneRegex = /^1[3456789]\d{9}$/;
  return phoneRegex.test(phone);
};

// 验证密码
export const validatePassword = (password) => {
  // 密码要求：8-20位，包含数字和字母
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
  return passwordRegex.test(password);
};

// 验证验证码
export const validateVerificationCode = (code) => {
  const codeRegex = /^\d{6}$/;
  return codeRegex.test(code);
};

// 验证用户名
export const validateUsername = (username) => {
  // 用户名要求：3-20位，只能包含字母、数字、下划线
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// 验证邮箱
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 验证年龄（18-100岁）
export const validateAge = (age) => {
  const ageNum = parseInt(age);
  return !isNaN(ageNum) && ageNum >= 18 && ageNum <= 100;
};
