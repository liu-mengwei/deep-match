<template>
  <div class="forgot-password-container">
    <div class="form-card">
      <div class="header">
        <h1>{{ currentStep === 1 ? '找回密码' : '重置密码' }}</h1>
        <p>{{ currentStep === 1 ? '验证手机号码后重置密码' : '请设置新的登录密码' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="forgot-password-form">
        <!-- 步骤1: 验证手机号 -->
        <template v-if="currentStep === 1">
          <div class="form-group">
            <label for="phone">手机号码</label>
            <div class="input-with-icon">
              <i class="icon">📱</i>
              <input
                id="phone"
                type="tel"
                v-model="formStep1.phone"
                placeholder="请输入注册手机号码"
                :class="{ 'error-input': errors.phone }"
              />
            </div>
            <div v-if="errors.phone" class="error-text">{{ errors.phone }}</div>
          </div>

          <div class="form-group verification-code">
            <label for="verificationCode">验证码</label>
            <div class="code-group">
              <div class="input-with-icon">
                <i class="icon">🔒</i>
                <input
                  id="verificationCode"
                  type="text"
                  v-model="formStep1.verificationCode"
                  placeholder="请输入短信验证码"
                  :class="{ 'error-input': errors.verificationCode }"
                />
              </div>
              <button
                type="button"
                class="verification-btn"
                :disabled="sendingCode || cooldown > 0"
                @click="sendVerificationCode"
              >
                {{ cooldown > 0 ? `${cooldown}秒后重新获取` : '获取验证码' }}
              </button>
            </div>
            <div v-if="errors.verificationCode" class="error-text">
              {{ errors.verificationCode }}
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '验证中...' : '下一步' }}
          </button>
        </template>

        <!-- 步骤2: 设置新密码 -->
        <template v-if="currentStep === 2">
          <div class="form-group">
            <label for="newPassword">新密码</label>
            <div class="input-with-icon">
              <i class="icon">🔑</i>
              <input
                id="newPassword"
                :type="showPassword ? 'text' : 'password'"
                v-model="formStep2.newPassword"
                placeholder="请输入6-20位新密码"
                :class="{ 'error-input': errors.newPassword }"
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div v-if="errors.newPassword" class="error-text">{{ errors.newPassword }}</div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <div class="input-with-icon">
              <i class="icon">🔑</i>
              <input
                id="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="formStep2.confirmPassword"
                placeholder="请再次输入新密码"
                :class="{ 'error-input': errors.confirmPassword }"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <div v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</div>
          </div>

          <div class="password-strength" v-if="formStep2.newPassword">
            <div class="strength-label">密码强度：{{ passwordStrength.text }}</div>
            <div class="strength-bar">
              <div
                class="strength-indicator"
                :style="{
                  width: passwordStrength.percent + '%',
                  backgroundColor: passwordStrength.color,
                }"
              ></div>
            </div>
            <div class="strength-tips">
              <div class="tip" :class="{ active: formStep2.newPassword.length >= 8 }">
                ✓ 8位以上字符
              </div>
              <div class="tip" :class="{ active: /[A-Z]/.test(formStep2.newPassword) }">
                ✓ 包含大写字母
              </div>
              <div class="tip" :class="{ active: /[a-z]/.test(formStep2.newPassword) }">
                ✓ 包含小写字母
              </div>
              <div class="tip" :class="{ active: /[0-9]/.test(formStep2.newPassword) }">
                ✓ 包含数字
              </div>
              <div class="tip" :class="{ active: /[^A-Za-z0-9]/.test(formStep2.newPassword) }">
                ✓ 包含特殊字符
              </div>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '提交中...' : '重置密码' }}
          </button>
        </template>

        <!-- 成功页面 -->
        <template v-if="currentStep === 3">
          <div class="success-message">
            <div class="success-icon">✓</div>
            <h2>密码重置成功</h2>
            <p>您的密码已成功重置，请使用新密码登录</p>
          </div>

          <button type="button" class="submit-btn" @click="router.push('/login')">返回登录</button>
        </template>

        <div class="footer-text" v-if="currentStep !== 3">
          <router-link to="/login" class="link">返回登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getVerifyCode, resetPassword } from '@/services/auth';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// 当前步骤
const currentStep = ref(1);

// 步骤1表单数据
const formStep1 = reactive({
  phone: '',
  verificationCode: '',
});

// 步骤2表单数据
const formStep2 = reactive({
  newPassword: '',
  confirmPassword: '',
});

// 表单错误信息
const errors = reactive({
  phone: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: '',
});

// 其他状态
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isSubmitting = ref(false);
const sendingCode = ref(false);
const cooldown = ref(0);

// 密码强度计算
const passwordStrength = computed(() => {
  const password = formStep2.newPassword;
  if (!password) {
    return { text: '无', percent: 0, color: '#ccc' };
  }

  let strength = 0;

  // 长度检查
  if (password.length >= 8) strength += 1;
  if (password.length >= 10) strength += 1;

  // 复杂度检查
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  // 最终强度
  if (strength <= 2) {
    return { text: '弱', percent: 25, color: '#FF4D4F' };
  } else if (strength <= 4) {
    return { text: '中', percent: 50, color: '#FAAD14' };
  } else if (strength <= 5) {
    return { text: '强', percent: 75, color: '#52C41A' };
  } else {
    return { text: '非常强', percent: 100, color: '#1890FF' };
  }
});

// 验证手机号
const validatePhone = (phone) => {
  const phoneRegex = /^1[3456789]\d{9}$/;
  return phoneRegex.test(phone);
};

// 验证验证码
const validateVerificationCode = (code) => {
  const codeRegex = /^\d{6}$/;
  return codeRegex.test(code);
};

// 验证密码
const validatePassword = (password) => {
  return password.length >= 6;
};

// 发送验证码
const sendVerificationCode = async () => {
  // 清除之前的错误
  errors.phone = '';

  // 验证手机号
  if (!formStep1.phone) {
    errors.phone = '请输入手机号码';
    return;
  }

  if (!validatePhone(formStep1.phone)) {
    errors.phone = '请输入有效的手机号码';
    return;
  }

  try {
    sendingCode.value = true;

    debugger;
    // 模拟API请求
    const res = await getVerifyCode({
      phone: formStep1.phone,
      type: 'reset_password',
    });

    console.log(res, '验证码');

    // 发送成功后启动倒计时
    cooldown.value = 60;
    const timer = setInterval(() => {
      cooldown.value -= 1;
      if (cooldown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    // 提示用户
    alert('验证码已发送，请注意查收短信');
  } catch (error) {
    alert('发送验证码失败，请稍后重试');
  } finally {
    sendingCode.value = false;
  }
};

// 验证步骤1表单
const validateStep1 = () => {
  let isValid = true;

  // 手机号验证
  if (!formStep1.phone) {
    errors.phone = '请输入手机号码';
    isValid = false;
  } else if (!validatePhone(formStep1.phone)) {
    errors.phone = '请输入有效的手机号码';
    isValid = false;
  } else {
    errors.phone = '';
  }

  // 验证码验证
  if (!formStep1.verificationCode) {
    errors.verificationCode = '请输入验证码';
    isValid = false;
  } else if (!validateVerificationCode(formStep1.verificationCode)) {
    errors.verificationCode = '验证码应为6位数字';
    isValid = false;
  } else {
    errors.verificationCode = '';
  }

  return isValid;
};

// 验证步骤2表单
const validateStep2 = () => {
  let isValid = true;

  // 新密码验证
  if (!formStep2.newPassword) {
    errors.newPassword = '请输入新密码';
    isValid = false;
  } else if (!validatePassword(formStep2.newPassword)) {
    errors.newPassword = '密码长度不能少于6位';
    isValid = false;
  } else {
    errors.newPassword = '';
  }

  // 确认密码验证
  if (!formStep2.confirmPassword) {
    errors.confirmPassword = '请确认新密码';
    isValid = false;
  } else if (formStep2.confirmPassword !== formStep2.newPassword) {
    errors.confirmPassword = '两次输入的密码不一致';
    isValid = false;
  } else {
    errors.confirmPassword = '';
  }

  return isValid;
};

// 提交表单
const handleSubmit = async () => {
  if (currentStep.value === 1) {
    // 验证步骤1
    if (!validateStep1()) return;

    try {
      isSubmitting.value = true;

      // 模拟验证请求

      // 验证成功，进入下一步
      currentStep.value = 2;
    } catch (error) {
      alert('验证失败，请检查手机号和验证码是否正确');
    } finally {
      isSubmitting.value = false;
    }
  } else if (currentStep.value === 2) {
    // 验证步骤2
    if (!validateStep2()) return;

    try {
      isSubmitting.value = true;

      // 模拟重置密码请求
      await resetPassword({
        phone: formStep1.phone,
        verification_code: formStep1.verificationCode,
        new_password: formStep2.newPassword,
      });

      // 重置成功，显示成功页面
      currentStep.value = 3;
    } catch (error) {
      alert('密码重置失败，请稍后重试');
    } finally {
      isSubmitting.value = false;
    }
  }
};
</script>

<style scoped lang="scss">
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  padding: 20px;

  .form-card {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    width: 100%;
    max-width: 420px;
    padding: 32px;

    .header {
      text-align: center;
      margin-bottom: 32px;

      h1 {
        margin: 0;
        font-size: 28px;
        color: #333;
        margin-bottom: 8px;
      }

      p {
        margin: 0;
        color: #666;
        font-size: 16px;
      }
    }
  }
}

.forgot-password-form {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .form-group {
    display: flex;
    flex-direction: column;

    label {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
    }

    .error-text {
      color: #e53935;
      font-size: 12px;
      margin-top: 4px;
    }
  }

  .input-with-icon {
    position: relative;
    display: flex;
    align-items: center;

    .icon {
      position: absolute;
      left: 12px;
      color: #666;
    }

    input {
      width: 100%;
      height: 48px;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 0 12px 0 40px;
      font-size: 16px;
      color: #333;
      transition: border-color 0.3s;

      &:focus {
        outline: none;
        border-color: #e53935;
      }

      &.error-input {
        border-color: #e53935 !important;
      }
    }

    .toggle-password {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
    }
  }
}

.verification-code {
  .code-group {
    display: flex;
    gap: 12px;

    .input-with-icon {
      flex: 1;
    }
  }
}

.verification-btn {
  width: 140px;
  border: 1px solid #e53935;
  background-color: transparent;
  color: #e53935;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background-color: rgba(229, 57, 53, 0.05);
  }

  &:disabled {
    border-color: #ddd;
    color: #999;
    cursor: not-allowed;
  }
}

.password-strength {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;

  .strength-label {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .strength-bar {
    height: 8px;
    background-color: #eee;
    border-radius: 4px;
    overflow: hidden;

    .strength-indicator {
      height: 100%;
      border-radius: 4px;
      transition:
        width 0.3s,
        background-color 0.3s;
    }
  }

  .strength-tips {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;

    .tip {
      font-size: 12px;
      color: #999;

      &.active {
        color: #52c41a;
      }
    }
  }
}

.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;

  .success-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: #52c41a;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    margin-bottom: 16px;
  }

  h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #666;
    font-size: 16px;
  }
}

.submit-btn {
  height: 48px;
  border: none;
  border-radius: 8px;
  background-color: #e53935;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover:not(:disabled) {
    background-color: #d32f2f;
  }

  &:disabled {
    background-color: #f0f0f0;
    color: #999;
    cursor: not-allowed;
  }
}

.footer-text {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}

.link {
  color: #e53935;
  text-decoration: none;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
}
</style>
