<template>
  <div class="register-container">
    <div class="form-card">
      <div class="header">
        <h1>创建账号</h1>
        <p>加入我们寻找您的理想伴侣</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- 基本信息 -->
        <div class="form-group">
          <label>您是</label>
          <div class="gender-buttons">
            <button
              type="button"
              :class="['gender-btn', form.gender === 'male' ? 'active' : '']"
              @click="form.gender = 'male'"
            >
              <i class="icon">♂</i> 男士
            </button>
            <button
              type="button"
              :class="['gender-btn', form.gender === 'female' ? 'active' : '']"
              @click="form.gender = 'female'"
            >
              <i class="icon">♀</i> 女士
            </button>
          </div>
          <div v-if="errors.gender" class="error-text">{{ errors.gender }}</div>
        </div>

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

        <div class="form-group verification-code">
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

        <div class="form-group">
          <label for="password">设置密码</label>
          <div class="input-with-icon">
            <i class="icon">🔑</i>
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              placeholder="请设置登录密码（8-20位）"
              :class="{ 'error-input': errors.password }"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <div v-if="errors.password" class="error-text">{{ errors.password }}</div>
        </div>

        <div class="form-group">
          <div class="checkbox-group">
            <input
              id="agreement"
              type="checkbox"
              v-model="form.agreement"
              :class="{ 'error-input': errors.agreement }"
            />
            <label for="agreement"
              >我已阅读并同意 <router-link to="/terms" class="link">服务条款</router-link> 和
              <router-link to="/privacy" class="link">隐私政策</router-link></label
            >
          </div>
          <div v-if="errors.agreement" class="error-text">{{ errors.agreement }}</div>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? '注册中...' : '立即注册' }}
        </button>

        <div class="footer-text">
          已有账号？<router-link to="/login" class="link">立即登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { getVerifyCode, register } from '@/services/auth';

const router = useRouter();

// 表单数据
const form = reactive({
  gender: '',
  phone: '',
  verificationCode: '',
  password: '',
  agreement: false,
});

// 表单错误信息
const errors = reactive({
  gender: '',
  phone: '',
  verificationCode: '',
  password: '',
  agreement: '',
});

// 其他状态
const showPassword = ref(false);
const isSubmitting = ref(false);
const sendingCode = ref(false);
const cooldown = ref(0);

// 验证手机号
const validatePhone = (phone) => {
  const phoneRegex = /^1[3456789]\d{9}$/;
  return phoneRegex.test(phone);
};

// 验证密码
const validatePassword = (password) => {
  return password.length >= 8 && password.length <= 20;
};

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

    // 模拟API请求
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    const res = await getVerifyCode({
      phone: form.phone,
      type: 'register',
    });
    console.log(res, 'code');

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
    alert('发送验证码失败:' + error.message?.message);
  } finally {
    sendingCode.value = false;
  }
};

// 表单验证
const validateForm = () => {
  let isValid = true;

  // 性别验证
  if (!form.gender) {
    errors.gender = '请选择您的性别';
    isValid = false;
  } else {
    errors.gender = '';
  }

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

  // 验证码验证
  if (!form.verificationCode) {
    errors.verificationCode = '请输入验证码';
    isValid = false;
  } else if (form.verificationCode.length !== 6) {
    errors.verificationCode = '验证码应为6位数字';
    isValid = false;
  } else {
    errors.verificationCode = '';
  }

  // 密码验证
  if (!form.password) {
    errors.password = '请设置密码';
    isValid = false;
  } else if (!validatePassword(form.password)) {
    errors.password = '密码长度应为8-20位';
    isValid = false;
  } else {
    errors.password = '';
  }

  // 协议验证
  if (!form.agreement) {
    errors.agreement = '您需要同意服务条款和隐私政策';
    isValid = false;
  } else {
    errors.agreement = '';
  }

  return isValid;
};

// 提交表单
const handleRegister = async () => {
  // 表单验证
  if (!validateForm()) {
    return;
  }

  try {
    isSubmitting.value = true;

    // 模拟API请求
    // await new Promise((resolve) => setTimeout(resolve, 1500));

    const { token, user } = await register({
      phone: form.phone,
      verification_code: form.verificationCode,
      password: form.password,
      gender: form.gender,
    });
    console.log(token, 'token');
    console.log(user, 'user');

    // 注册成功，跳转到登录页或个人资料设置页
    alert('注册成功！');
    router.push('/survey');
  } catch (error) {
    alert('注册失败，请稍后重试');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.register-container {
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
    max-width: 480px;
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

.register-form {
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

.gender-buttons {
  display: flex;
  gap: 16px;

  .gender-btn {
    flex: 1;
    height: 48px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 16px;
    color: #333;
    cursor: pointer;
    transition: all 0.3s;

    &.active {
      border-color: #e53935;
      background-color: rgba(229, 57, 53, 0.05);
      color: #e53935;
    }

    .icon {
      font-size: 18px;
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

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    border: 1px solid #ddd;
    border-radius: 4px;

    &.error-input {
      border-color: #e53935;
    }
  }

  label {
    margin-bottom: 0 !important;
    font-size: 14px;
    color: #666;
  }
}

.link {
  color: #e53935;
  text-decoration: none;

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
  margin-top: 8px;

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
</style>
