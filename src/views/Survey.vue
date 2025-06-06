<template>
  <div class="survey-app">
    <div class="nickname">{{ authStore.currentUser.phone }}</div>
    <header class="app-header">
      <h1>{{ surveyData.title }}</h1>
      <div class="progress-indicator" v-if="currentStep !== 'welcome'">
        <StepTab
          step="questions"
          :is-active="currentStep === 'questions'"
          :is-completed="basicInfoCompleted"
          :is-clickable="true"
          :is-disabled="false"
          @click="goToStep"
        >
          基本信息
        </StepTab>
        <StepTab
          step="basicFilter"
          :is-active="currentStep === 'basicFilter'"
          :is-completed="false"
          @click="goToStep"
        >
          基本条件筛选
        </StepTab>
        <StepTab
          step="weights"
          :is-active="currentStep === 'weights'"
          :is-completed="false"
          @click="goToStep"
        >
          深度匹配设置
        </StepTab>
        <StepTab
          step="results"
          :is-active="currentStep === 'results'"
          :is-completed="false"
          :is-clickable="false"
          :is-disabled="true"
        >
          查看结果
        </StepTab>
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
            <button class="secondary-button" @click="startSurvey(true)">重新开始</button>
            <button class="primary-button" @click="startSurvey(false)">继续填写</button>
          </div>
        </div>
        <button v-else class="primary-button" @click="startSurvey(true)">开始填写</button>
      </div>

      <!-- 问卷填写页 -->
      <SurveyForm
        v-if="currentStep === 'questions'"
        :data="basicInfo"
        @complete="completeSurvey"
        @save-draft="(val) => saveDraftWithCheck({ basicInfo: val })"
      />

      <!-- 基础筛选页 -->
      <BasicFilter
        v-if="currentStep === 'basicFilter'"
        :data="basicFilter"
        @update:data="updateBasicFilter"
        @back="currentStep = 'questions'"
        @complete="completeFilter"
      />

      <!-- 深度匹配设置页 -->
      <WeightSettings
        v-if="currentStep === 'weights'"
        :data="userWeights"
        @update:data="updateWeights"
        @back="currentStep = 'basicFilter'"
        @complete="completeWeights"
      />

      <!-- 结果页面 -->
      <SurveyResults v-if="currentStep === 'results'" :result="submitResult" />
    </main>
  </div>
</template>

<script setup>
// 更新导入路径
import SurveyForm from '../components/survey/SurveyForm.vue';
import WeightSettings from '../components/survey/WeightSettings.vue';
import SurveyResults from '../components/survey/SurveyResults.vue';
import surveyData from '../data/surveyData.js';
// 导入API服务
import BasicFilter from '../components/survey/BasicFilter/index.vue';
import { useAuthStore } from '@/stores/auth';
import {
  getSurveyDraft,
  deleteSurveyDraft,
  submitSurvey as submit,
  updateSurveyDraft,
  createSurveyDraft,
  submitDraft,
} from '@/services/survey';
import StepTab from '../components/common/StepTab.vue';
import { cloneDeep } from 'lodash-es'; // 使用 lodash 的深拷贝功能

const DEFAULT_FILTER = {
  age: { min: 18, max: 99, importance: 'prefer' },
  height: { min: 150, max: 200, importance: 'prefer' },
  education: { value: '', importance: 'prefer' },
  income: { value: '', importance: 'prefer' },
  acceptDivorced: { value: '', importance: 'prefer' },
  acceptSmoking: { value: 'never_only', importance: 'prefer' },
  acceptDrinking: { value: 'accept_socially', importance: 'prefer' },
  acceptPets: { value: 'accept_all', importance: 'not_important' },
  acceptSleep: { value: 'any', importance: 'not_important' }
};

const DEFAULT_WEIGHTS = {
  partnerPreferences: 20,
  values: 20,
  emotionalPatterns: 20,
  lifestyle: 20,
  futurePlanning: 20,
};

const authStore = useAuthStore();

// 当前状态: 'welcome', 'questions', 'basicFilter', 'weights', 'results'
const currentStep = ref('welcome');

const basicInfo = ref({}); // 之前的 userAnswers
const submitResult = ref(null);

const isSubmitting = ref(false);
const hasDraft = ref(false);
const isLoading = ref(true);

// 添加问卷完成状态
const basicInfoCompleted = ref(false);
// 新增 basicFilter 变量
const basicFilter = ref(DEFAULT_FILTER);
const userWeights = ref(DEFAULT_WEIGHTS); // 深度匹配设置的权重

// 页面加载时检查是否有草稿和获取用户信息
onMounted(async () => {
  isLoading.value = true;
  try {
    // 检查是否有草稿，并根据结果设置草稿状态标志
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

    if (draft.status === 'submitted') currentStep.value = 'results';

    if (draft) {
      hasDraft.value = true;
      // 预加载草稿数据，避免后续重复加载
      if (draft.basicInfo) {
        basicInfo.value = draft.basicInfo;
      }
      if (draft.basicFilter) {
        basicFilter.value = draft.basicFilter;
      }
      if (draft.weights) {
        userWeights.value = draft.weights;
      }
    } else {
      hasDraft.value = false;
    }
  } catch (error) {
    console.error('获取草稿失败:', error);
    hasDraft.value = false;
  }
};

// 开始问卷
const startSurvey = async (reset = false) => {
  currentStep.value = 'questions';

  // 初始化空答案
  if (reset) {
    basicInfo.value = {};
    basicFilter.value = cloneDeep(DEFAULT_FILTER); // 使用深拷贝，避免引用问题
    userWeights.value = cloneDeep(DEFAULT_WEIGHTS); // 使用深拷贝，避免引用问题

    basicInfoCompleted.value = false;
  }
};

// 添加检查草稿存在的方法
const saveDraftWithCheck = async (draftData) => {
  try {
    // 使用hasDraft的状态值来决定是创建还是更新
    if (hasDraft.value) {
      // 已有草稿，使用更新接口
      await updateSurveyDraft(draftData);
    } else {
      // 没有草稿，使用创建接口
      await createSurveyDraft(draftData);
      // 设置状态为已有草稿
      hasDraft.value = true;
    }
  } catch (error) {
    console.error('保存草稿失败:', error);
    throw error;
  }
};

// 完成问卷，进入权重设置
const completeSurvey = (answers) => {
  basicInfo.value = answers;
  basicInfoCompleted.value = true; // 标记问卷已完成
  currentStep.value = 'basicFilter';
};

// 更新 basicFilter 的处理函数
const updateBasicFilter = (newFilter) => {
  basicFilter.value = newFilter;
};

// 完成 basicFilter 部分，进入权重设置
const completeFilter = () => {
  // 在完成时保存草稿，使用当前的 basicFilter
  saveDraftWithCheck({ basicFilter: basicFilter.value });
  currentStep.value = 'weights';
};

// 更新权重设置
const updateWeights = (weights) => {
  userWeights.value = weights;
};

const completeWeights = async () => {
  // 在完成时保存草稿，使用当前的权重设置
  await saveDraftWithCheck({ weights: userWeights.value });

  // 将草稿状态改为submitted
  try {
    await submitDraft();
    // 成功提交后跳转到结果页面
    currentStep.value = 'results';
  } catch (error) {
    console.error('提交草稿失败:', error);
    // 可以添加错误处理，比如显示错误提示
  }
};

// 新增：直接跳转到指定步骤
const goToStep = (step) => {
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
