<template>
  <div class="survey-app">
    <div class="nickname">{{ authStore.currentUser.phone }}</div>
    <header class="app-header">
      <h1>{{ surveyData.title }}</h1>
      <div class="progress-indicator" v-if="currentStep !== 'welcome'">
        <div
          class="step"
          :class="{
            active: currentStep === 'questions',
            completed: surveyCompleted,
          }"
          @click="goToStep('questions')"
        >
          基本信息
        </div>
        <div
          class="step"
          :class="{
            active: currentStep === 'basicFilter',
            clickable: surveyCompleted,
            disabled: !surveyCompleted,
          }"
          @click="surveyCompleted && goToStep('basicFilter')"
        >
          基本条件筛选
        </div>
        <div
          class="step"
          :class="{
            active: currentStep === 'weights',
            clickable: surveyCompleted,
            disabled: !surveyCompleted,
          }"
          @click="surveyCompleted && goToStep('weights')"
        >
          深度匹配设置
        </div>
        <div
          class="step"
          :class="{
            active: currentStep === 'results',
            disabled: true,
          }"
        >
          查看结果
        </div>
      </div>
    </header>

    <main class="app-content">
      <!-- 欢迎页面 -->
      <div v-if="currentStep === 'welcome'" class="welcome-screen">
        <h2>欢迎参加{{ surveyData.title }}</h2>
        <p>本问卷将帮助您找到理想的伴侣匹配。完成问卷后，您可以自定义各部分的权重。</p>
        <div v-if="hasDraft" class="draft-notice">
          <p>检测到您有未完成的问卷草稿</p>
          <div class="draft-actions">
            <button class="secondary-button" @click="startSurvey(false)">重新开始</button>
            <button class="primary-button" @click="startSurvey(true)">继续填写</button>
          </div>
        </div>
        <button v-else class="primary-button" @click="startSurvey(false)">开始填写</button>
      </div>

      <!-- 问卷填写页 -->
      <SurveyForm
        v-if="currentStep === 'questions'"
        :survey-data="surveyData"
        :initial-answers="userAnswers"
        @complete="completeSurvey"
        @save-draft="saveDraft"
      />

      <!-- 基础筛选页 -->
      <BasicFilter
        v-if="currentStep === 'basicFilter'"
        @complete="completeFilter"
        @back="currentStep = 'questions'"
        @next="currentStep = 'weights'"
      />

      <!-- 深度匹配设置页 -->
      <WeightSettings
        v-if="currentStep === 'weights'"
        :sections="weightableSections"
        :weights="userWeights"
        :total-weight="totalWeight"
        @update-weights="updateWeights"
        @submit="submitSurvey"
        @back="currentStep = 'basicFilter'"
        :is-submitting="isSubmitting"
      />

      <!-- 结果页面 -->
      <SurveyResults v-if="currentStep === 'results'" :result="submitResult" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// 更新导入路径
import SurveyForm from '../components/survey/SurveyForm.vue';
import WeightSettings from '../components/survey/WeightSettings.vue';
import SurveyResults from '../components/survey/SurveyResults.vue';
import surveyData from '../data/surveyData.js';
// 导入API服务
import apiService from '../services/apiService';
import BasicFilter from '../components/survey/BasicFilter/index.vue';
import { useAuthStore } from '@/stores/auth';
import {
  getSurveyDraft,
  saveSurveyDraft,
  deleteSurveyDraft,
  submitSurvey as submit,
  getSubmittedSurvey,
} from '@/services/survey';

const authStore = useAuthStore();

// 当前状态: 'welcome', 'questions', 'basicFilter', 'weights', 'results'
const currentStep = ref('welcome');
const userAnswers = ref({});
const userWeights = ref({});
const submitResult = ref(null);
const isSubmitting = ref(false);
const hasDraft = ref(false);
const userId = ref(null);
const isLoading = ref(true);
// 添加问卷完成状态
const surveyCompleted = ref(false);

// 筛选出需要设置权重的部分（排除基本信息和个人习惯）
const weightableSections = computed(() => {
  // 只对这些板块设置权重：伴侣偏好、价值观、情感模式、生活习惯、未来规划
  const weightableIds = [
    'partner_preferences',
    'values',
    'emotional_patterns',
    'lifestyle',
    'future_planning',
  ];
  return surveyData.sections.filter((section) => weightableIds.includes(section.id));
});

// 默认权重设置
const initializeWeights = () => {
  const weights = {};
  weightableSections.value.forEach((section) => {
    weights[section.id] = section.defaultWeight;
  });
  userWeights.value = weights;
};

// 计算总权重，确保为100%
const totalWeight = computed(() => {
  return Object.values(userWeights.value).reduce((sum, weight) => sum + weight, 0);
});

// 页面加载时检查是否有草稿和获取用户信息
onMounted(async () => {
  isLoading.value = true;
  try {
    debugger;
    // 检查是否有草稿
    await checkForDraft();
  } catch (error) {
    console.error('初始化错误:', error);
  } finally {
    isLoading.value = false;
  }
});

// 检查用户是否有保存的草稿
const checkForDraft = async () => {
  try {
    const draft = await getSurveyDraft();
    if (draft && draft.answers) {
      hasDraft.value = true;
    }
  } catch (error) {
    console.error('获取草稿失败:', error);
  }
};

// 加载草稿数据
const loadDraft = async () => {
  try {
    const draft = await getSurveyDraft();
    if (draft) {
      if (draft.answers) {
        userAnswers.value = draft.answers;
      }
      if (draft.weights) {
        userWeights.value = draft.weights;
      } else {
        initializeWeights();
      }
    } else {
      initializeWeights();
    }
  } catch (error) {
    console.error('加载草稿失败:', error);
    initializeWeights();
  }
};

// 开始问卷
const startSurvey = async (useDraft) => {
  if (useDraft) {
    await loadDraft();
  } else {
    // 初始化空答案
    userAnswers.value = {};
    surveyData.sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (question.type === 'checkbox') {
          userAnswers.value[question.id] = [];
        } else if (question.type === 'rating') {
          userAnswers.value[question.id] = null;
        } else if (question.type === 'range') {
          userAnswers.value[question.id] = { min: null, max: null };
        } else {
          userAnswers.value[question.id] = '';
        }
      });
    });
    initializeWeights();
  }
  surveyCompleted.value = false;
  currentStep.value = 'questions';
};

// 保存草稿
const saveDraft = async (answers) => {
  userAnswers.value = answers;

  try {
    const draftData = {
      answers: userAnswers.value,
      weights: userWeights.value,
    };

    await saveSurveyDraft(draftData);
  } catch (error) {
    console.error('保存草稿失败:', error);
    // 可以添加失败提示
  }
};

// 完成问卷，进入权重设置
const completeSurvey = (answers) => {
  userAnswers.value = answers;
  surveyCompleted.value = true; // 标记问卷已完成
  currentStep.value = 'basicFilter';
  // 自动保存草稿
  saveDraft(answers);
};

const completeFilter = () => {};

// 从权重设置返回问卷填写页（保留数据）
const backToSurvey = () => {
  currentStep.value = 'questions';
  // 不需要重新设置userAnswers，因为它已经包含用户填写的数据
};

// 更新权重设置
const updateWeights = (weights) => {
  userWeights.value = weights;
  // 自动保存草稿
  saveDraft(userAnswers.value);
};

// 提交问卷及权重
const submitSurvey = async () => {
  isSubmitting.value = true;

  try {
    // 构建提交数据
    const submitData = {
      answers: userAnswers.value,
      weights: userWeights.value,
    };

    // 发送API请求
    const response = await submit(submitData);

    if (response.success) {
      submitResult.value = response;
      currentStep.value = 'results';

      // 提交成功后清除草稿
      await deleteSurveyDraft();
    } else {
      throw new Error('提交失败');
    }
  } catch (error) {
    console.error('提交问卷出错:', error);
    alert('提交问卷时出现错误，请稍后重试');
  } finally {
    isSubmitting.value = false;
  }
};

// 新增：直接跳转到指定步骤
const goToStep = (step) => {
  // 只有问卷完成后才能跳转到权重设置
  if (step === 'weights' && !surveyCompleted.value) {
    return;
  }

  // 不能直接跳转到结果页面
  if (step === 'results') {
    return;
  }

  currentStep.value = step;
};
</script>

<style lang="scss" scoped>
.survey-app {
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

.progress-indicator {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 20px;

  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: #eee;
    z-index: 0;
  }

  .step {
    position: relative;
    flex: 1;
    text-align: center;
    padding: 10px;
    font-size: 14px;
    color: #999;
    background: white;
    z-index: 1;
    border-radius: 4px;

    // 添加可点击样式
    &.clickable {
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: #f9f9f9;
        color: #e74c3c;
      }
    }

    &.active {
      color: #e74c3c;
      font-weight: bold;
      border: 1px solid #e74c3c;
    }

    &.completed {
      color: #2ecc71;
      cursor: pointer;

      &:hover {
        background-color: #f9f9f9;
      }

      &:after {
        content: '✓';
        display: inline-block;
        margin-left: 4px;
        font-weight: bold;
      }
    }

    &.disabled {
      opacity: 0.6;
      cursor: default;
    }
  }
}

.welcome-screen {
  text-align: center;
  padding: 40px 20px;

  h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
  }

  p {
    margin-bottom: 30px;
    color: #666;
    line-height: 1.6;
    font-size: 16px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .draft-notice {
    background-color: #f8f9fa;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;

    p {
      margin-bottom: 15px;
      font-weight: 500;
    }

    .draft-actions {
      display: flex;
      justify-content: center;
      gap: 15px;
    }
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

.secondary-button {
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  min-width: 160px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
    border-color: #ccc;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
}
</style>
