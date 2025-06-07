<template>
  <div class="match-results">
    <div class="nickname">{{ authStore.currentUser.phone }}</div>
    <header class="app-header">
      <h1>深度匹配结果</h1>
    </header>

    <main class="app-content">
      <div v-if="isLoading" class="loading-state">
        <p>正在获取您的匹配结果...</p>
      </div>

      <button class="primary-button" @click="backToUpdate">返回修改问卷</button>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SurveyResults from '../components/survey/SurveyResults.vue';
import { useAuthStore } from '@/stores/auth';
import { getSurveyDraft, getMatchResults, updateDraftStatus } from '@/services/survey';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const error = ref(null);
const matchResults = ref(null);

onMounted(async () => {
  await checkSurveyStatus();
  if (!error.value) {
    await fetchResults();
  }
});

const backToUpdate = async () => {
  await updateDraftStatus("draft")
  debugger
  router.push('/survey')
}

// 检查用户是否已完成问卷
const checkSurveyStatus = async () => {
  try {
    const draft = await getSurveyDraft();

    if (!draft || draft.status !== 'submitted') {
      // 没有提交问卷，跳转回问卷页
      router.replace('/survey');
      error.value = '请先完成问卷再查看结果';
    }
  } catch (err) {
    console.error('检查问卷状态失败:', err);
    error.value = '无法获取问卷状态，请稍后再试';
  }
};

// 获取匹配结果
const fetchResults = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // 假设有一个获取匹配结果的API
    // const results = await getMatchResults();
    const results = {}
    matchResults.value = results;
  } catch (err) {
    console.error('获取匹配结果失败:', err);
    error.value = '获取匹配结果失败，请稍后再试';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.match-results {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  border-radius: 8px;

  .nickname {
    position: fixed;
    top: 20px;
    right: 20px;
  }
}

.app-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;

  h1 {
    color: #e74c3c;
    margin: 0 0 20px 0;
    font-size: 28px;
    text-align: center;
  }
}

.loading-state, .error-state {
  text-align: center;
  padding: 50px 20px;

  p {
    margin-bottom: 20px;
    font-size: 16px;
    color: #666;
  }
}

.primary-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  min-width: 160px;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(231, 76, 60, 0.2);

  &:hover {
    background-color: #c0392b;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.3);
  }
}
</style>
