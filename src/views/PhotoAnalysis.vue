<!-- src/App.vue -->
<template>
  <div class="title">照片特征评分系统</div>

  <div class="app">
    <div class="content">
      <PhotoUploader
        @analysis-complete="handleAnalysisComplete"
        @analysis-error="handleAnalysisError"
      />

      <ScoreResult :result="scoreResult" />
    </div>

    <footer>
      <p>特征评分系统</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PhotoUploader from '../components/PhotoUploader.vue';
import ScoreResult from '../components/ScoreResult.vue';

// 分析结果
const scoreResult = ref(null);

// 处理分析完成
const handleAnalysisComplete = (result) => {
  scoreResult.value = result;
};

// 处理分析错误
const handleAnalysisError = (error) => {
  console.error('分析错误:', error);
};

// 重置分析结果
// const resetAnalysis = () => {
//   scoreResult.value = null;
// };
</script>

<style lang="scss" scoped>
.title {
  font-size: 24px;
  margin: 0 auto;
  text-align: center;
}

.app {
  padding: 10px;
  margin-left: 30vw;

  .content {
    display: flex;
  }

  header {
    margin-bottom: 20px;

    h1 {
      font-size: 22px;
      position: relative;
    }
  }

  main {
    background: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin-bottom: 20px;
  }

  footer {
    text-align: center;
    color: #999;
    font-size: 14px;
    padding: 10px;
  }
}

:global(body) {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background: #f5f5f5;
}
</style>
