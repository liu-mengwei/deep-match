<template>
  <!-- 系统入口页面，可以是一个加载画面 -->
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>正在加载...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getSurveyDraft } from '@/services/survey';

const router = useRouter();

onMounted(async () => {
  // 检查用户登录状态
  // ...

  // 检查问卷状态
  try {
    const draft = await getSurveyDraft();
    if (draft && draft.status === 'submitted') {
      // 已提交问卷，直接跳转到结果页
      router.push('/match-results');
    } else {
      // 未提交问卷或无草稿，跳转到问卷页
      router.push('/survey');
    }
  } catch (error) {
    console.error('检查问卷状态失败:', error);
    // 出错时默认跳转到问卷页
    router.push('/survey');
  }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #e74c3c;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
