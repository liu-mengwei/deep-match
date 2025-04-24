<template>
  <div class="login-container">
    <div class="form-card">
      <div class="header">
        <h1>欢迎回来</h1>
        <p>登录您的账号继续寻找缘分</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="phone">手机号码</label>
          <div class="input-with-icon">
            <i class="icon">📱</i>
            <input
              id="phone"
              type="tel"
              v-model="form.phone"
              placeholder="请输入手机号码"
              :class="{ 'error-input': errors.phone }"
            />
          </div>
          <div v-if="errors.phone" class="error-text">{{ errors.phone }}</div>
        </div>

        <div class="login-type-tabs">
          <button
            type="button"
            :class="['tab-btn', loginType === 'password' ? 'active' : '']"
            @click="loginType = 'password'"
          >
            密码登录
          </button>
          <button
            type="button"
            :class="['tab-btn', loginType === 'code' ? 'active' : '']"
            @click="loginType = 'code'"
          >
            验证码登录
          </button>
        </div>

        <!-- 密码登录 -->
        <div v-if="loginType === 'password'" class="form-group">
          <label for="password">密码</label>
          <div class="input-with-icon">
            <i class="icon">🔑</i>
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              placeholder="请输入密码"
              :class="{ 'error-input': errors.password }"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <div v-if="errors.password" class="error-text">{{ errors.password }}</div>
          <div class="forgot-password">
            <router-link to="/forgot-password" class="link">忘记密码？</router-link>
          </div>
        </div>

        <!-- 验证码登录 -->
        <div v-if="loginType === 'code'" class="form-group verification-code">
          <label for="verificationCode">验证码</label>
          <div class="code-group">
            <div class="input-with-icon">
              <i class="icon">🔒</i>
              <input
                id="verificationCode"
                type="text"
                v-model="form.verificationCode"
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
          <div v-if="errors.verificationCode" class="error-text">{{ errors.verificationCode }}</div>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? '登录中...' : '登录' }}
        </button>

        <div class="divider">
          <span>其他登录方式</span>
        </div>

        <div class="social-login">
          <button type="button" class="social-btn wechat"><i class="icon">📱</i> 微信登录</button>
        </div>

        <div class="footer-text">
          还没有账号？<router-link to="/register" class="link">立即注册</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { validatePhone, validatePassword, validateVerificationCode } from '../../utils/validators';
import { getVerifyCode } from '@/services/auth';

const router = useRouter();
const authStore = useAuthStore();

// 登录方式
const loginType = ref('password');

// 表单数据
const form = reactive({
  phone: '',
  password: '',
  verificationCode: '',
});

// 表单错误信息
const errors = reactive({
  phone: '',
  password: '',
  verificationCode: '',
});

// 其他状态
const showPassword = ref(false);
const isSubmitting = ref(false);
const sendingCode = ref(false);
const cooldown = ref(0);

// 当切换登录方式时，清除相关错误
watch(loginType, () => {
  if (loginType.value === 'password') {
    errors.verificationCode = '';
  } else {
    errors.password = '';
  }
});

// 发送验证码
const sendVerificationCode = async () => {
  // 清除之前的错误
  errors.phone = '';

  // 验证手机号
  if (!form.phone) {
    errors.phone = '请输入手机号码';
    return;
  }

  if (!validatePhone(form.phone)) {
    errors.phone = '请输入有效的手机号码';
    return;
  }

  try {
    sendingCode.value = true;

    const res = await getVerifyCode({
      phone: form.phone,
      type: 'login',
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

// 表单验证
const validateForm = () => {
  let isValid = true;

  // 手机号验证
  if (!form.phone) {
    errors.phone = '请输入手机号码';
    isValid = false;
  } else if (!validatePhone(form.phone)) {
    errors.phone = '请输入有效的手机号码';
    isValid = false;
  } else {
    errors.phone = '';
  }

  if (loginType.value === 'password') {
    // 密码验证
    if (!form.password) {
      errors.password = '请输入密码';
      isValid = false;
    } else if (!validatePassword(form.password)) {
      errors.password = '密码要求：8-20位，包含数字和字母';
      isValid = false;
    } else {
      errors.password = '';
    }
  } else {
    // 验证码验证
    if (!form.verificationCode) {
      errors.verificationCode = '请输入验证码';
      isValid = false;
    } else if (!validateVerificationCode(form.verificationCode)) {
      errors.verificationCode = '验证码应为6位数字';
      isValid = false;
    } else {
      errors.verificationCode = '';
    }
  }

  return isValid;
};

// 提交表单
const handleLogin = async () => {
  // 表单验证
  if (!validateForm()) {
    return;
  }

  try {
    isSubmitting.value = true;

    if (loginType.value === 'password') {
      // 使用密码登录
      await authStore.login({
        phone: form.phone,
        password: form.password,
        loginType: 'password',
      });
    } else {
      // 使用验证码登录
      await authStore.login({
        phone: form.phone,
        verificationCode: form.verificationCode,
        loginType: 'code',
      });
    }

    // 登录成功，跳转到首页
    router.push('/survey');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.login-container {
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

.login-form {
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

.login-type-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 4px;

  .tab-btn {
    flex: 1;
    background: none;
    border: none;
    padding: 12px 0;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    position: relative;

    &.active {
      color: #e53935;
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 20%;
        width: 60%;
        height: 2px;
        background-color: #e53935;
      }
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

.forgot-password {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.link {
  color: #e53935;
  text-decoration: none;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
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

.divider {
  display: flex;
  align-items: center;
  margin: 8px 0;
  color: #999;
  font-size: 14px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #eee;
  }

  &::before {
    margin-right: 16px;
  }

  &::after {
    margin-left: 16px;
  }
}

.social-login {
  display: flex;
  justify-content: center;

  .social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 48px;
    border: 1px solid #eee;
    border-radius: 8px;
    background-color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s;

    &.wechat {
      color: #07c160;

      &:hover {
        background-color: rgba(7, 193, 96, 0.05);
        border-color: #07c160;
      }
    }
  }
}

.footer-text {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}
</style>
