<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <div class="error-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14.5 7.5L9.5 16.5"
            stroke="#E53935"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="#E53935"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 8V8.01"
            stroke="#E53935"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 16V16.01"
            stroke="#E53935"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h1>页面未找到</h1>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <div class="action-buttons">
        <button class="back-button" @click="router.go(-1)"><i class="icon">←</i> 返回上一页</button>
        <button class="home-button" @click="router.push('/')">
          <i class="icon">🏠</i> 返回首页
        </button>
      </div>

      <div class="suggestions">
        <h3>您可以尝试：</h3>
        <ul>
          <li>检查URL是否正确</li>
          <li>返回首页重新导航</li>
          <li>使用顶部的搜索功能</li>
          <li>联系客服获取帮助</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style scoped lang="scss">
.not-found-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  padding: 20px;

  .not-found-content {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    width: 100%;
    max-width: 600px;
    padding: 48px;
    text-align: center;
    position: relative;
    overflow: hidden;

    .error-code {
      position: absolute;
      top: -40px;
      right: -20px;
      font-size: 240px;
      font-weight: 700;
      color: rgba(0, 0, 0, 0.03);
      z-index: 0;
    }
  }
}

.error-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;

  svg {
    width: 100%;
    height: 100%;
  }
}

h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

p {
  color: #666;
  font-size: 18px;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  position: relative;
  z-index: 1;
  margin-bottom: 36px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }

  button {
    height: 48px;
    padding: 0 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .icon {
      font-size: 18px;
    }
  }

  .back-button {
    background-color: transparent;
    border: 1px solid #ddd;
    color: #666;

    &:hover {
      border-color: #999;
      color: #333;
      background-color: #f5f5f5;
    }
  }

  .home-button {
    background-color: #e53935;
    border: none;
    color: white;

    &:hover {
      background-color: #d32f2f;
    }
  }
}

.suggestions {
  text-align: left;
  border-top: 1px solid #eee;
  padding-top: 24px;
  position: relative;
  z-index: 1;

  h3 {
    font-size: 18px;
    color: #333;
    margin-bottom: 16px;
  }

  ul {
    padding-left: 20px;

    li {
      color: #666;
      margin-bottom: 8px;
      font-size: 15px;
    }
  }
}
</style>
