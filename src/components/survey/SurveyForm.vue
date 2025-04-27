<template>
  <div class="survey-form">
    <!-- 添加标签式导航 -->
    <div class="section-tabs">
      <div
        v-for="(section, index) in surveyData.sections"
        :key="section.id"
        class="section-tab"
        :class="{
          active: currentSectionIndex === index,
          completed: completedSections[index],
          disabled: !completedSections[index] && currentSectionIndex !== index,
        }"
        @click="goToSection(index)"
      >
        <div class="tab-indicator">
          <span v-if="completedSections[index]" class="check-icon">✓</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <span class="tab-title">{{ section.title }}</span>
      </div>
    </div>

    <h2>{{ currentSection.title }}</h2>
    <p v-if="currentSection.description" class="section-description">
      {{ currentSection.description }}
    </p>

    <QuestionSection
      :section="currentSection"
      :answers="answers"
      :validation-errors="validationErrors"
      @update-answer="updateAnswer"
    />

    <div class="form-navigation">
      <button class="secondary-button" @click="prevSection" v-if="!isFirstSection">上一部分</button>

      <div class="center-actions" v-if="!isFirstSection && !isLastSection">
        <button class="save-button" @click="saveDraft" :disabled="isSaving">
          {{ isSaving ? '保存中...' : '保存草稿' }}
        </button>
      </div>

      <button class="primary-button" @click="nextSection">
        {{ isLastSection ? '提交' : '下一部分' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import QuestionSection from './QuestionSection.vue';

// 接收props
const props = defineProps({
  surveyData: {
    type: Object,
    required: true,
  },
  initialAnswers: {
    type: Object,
    default: () => ({}),
  },
});

// 定义emit
const emit = defineEmits(['complete', 'save-draft']);

const currentSectionIndex = ref(0);
const answers = reactive({});
const validationErrors = ref({});
const isSaving = ref(false);
// 跟踪已完成的部分
const completedSections = ref({});

// 初始化答案对象和已完成部分
onMounted(() => {
  // 如果有初始数据，用它填充answers对象
  if (Object.keys(props.initialAnswers).length > 0) {
    Object.keys(props.initialAnswers).forEach((key) => {
      answers[key] = props.initialAnswers[key];
    });

    // 分析哪些部分已经填写完成
    analyzeCompletedSections();
  } else {
    // 否则创建空的答案对象
    props.surveyData.sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (question.type === 'checkbox') {
          answers[question.id] = [];
        } else if (question.type === 'rating') {
          answers[question.id] = null;
        } else if (question.type === 'range') {
          answers[question.id] = { min: null, max: null };
        } else {
          answers[question.id] = '';
        }
      });
    });

    // 第一部分默认可访问
    completedSections.value[0] = false;
  }
});

// 分析哪些部分已经填写完成
const analyzeCompletedSections = () => {
  const completed = {};

  props.surveyData.sections.forEach((section, index) => {
    // 检查该部分的所有必填题是否都已回答
    const requiredQuestions = section.questions.filter((q) => q.required);
    if (requiredQuestions.length === 0) {
      // 如果没有必填题，则视为已完成
      completed[index] = true;
      return;
    }

    const allAnswered = requiredQuestions.every((question) => {
      const answer = answers[question.id];
      return !(
        answer === '' ||
        answer === null ||
        (Array.isArray(answer) && answer.length === 0) ||
        (question.type === 'range' && (answer.min === null || answer.max === null))
      );
    });

    completed[index] = allAnswered;

    // 如果当前部分尚未完成，后续部分也标记为未完成
    if (!allAnswered) {
      for (let i = index + 1; i < props.surveyData.sections.length; i++) {
        completed[i] = false;
      }
      return; // 中断循环
    }
  });

  completedSections.value = completed;
};

const currentSection = computed(() => {
  return props.surveyData.sections[currentSectionIndex.value];
});

const isFirstSection = computed(() => currentSectionIndex.value === 0);

const isLastSection = computed(() => {
  return currentSectionIndex.value === props.surveyData.sections.length - 1;
});

// 验证当前部分的回答
const validateCurrentSection = () => {
  const errors = {};
  const section = currentSection.value;

  section.questions.forEach((question) => {
    if (question.required) {
      const answer = answers[question.id];
      if (
        answer === '' ||
        answer === null ||
        (Array.isArray(answer) && answer.length === 0) ||
        (question.type === 'range' && (answer.min === null || answer.max === null))
      ) {
        errors[question.id] = '此题为必答题';
      }
    }
  });

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

// 下一部分
const nextSection = () => {
  if (!validateCurrentSection()) {
    // 滚动到第一个错误项
    const firstErrorId = Object.keys(validationErrors.value)[0];
    if (firstErrorId) {
      const errorElement = document.getElementById(firstErrorId);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    return;
  }

  // 标记当前部分为已完成
  completedSections.value[currentSectionIndex.value] = true;

  // 下一部分设为可访问
  if (currentSectionIndex.value + 1 < props.surveyData.sections.length) {
    completedSections.value[currentSectionIndex.value + 1] = false;
  }

  // 自动保存草稿
  emit('save-draft', { ...answers });

  if (isLastSection.value) {
    emit('complete', { ...answers });
  } else {
    currentSectionIndex.value++;
    window.scrollTo(0, 0);
  }
};

// 上一部分
const prevSection = () => {
  if (currentSectionIndex.value > 0) {
    currentSectionIndex.value--;
    window.scrollTo(0, 0);
  }
};

// 跳转到指定部分（新增）
const goToSection = (index) => {
  // 只允许跳转到已完成的部分或当前部分
  if (completedSections.value[index] || index === currentSectionIndex.value) {
    currentSectionIndex.value = index;
    window.scrollTo(0, 0);
  }
};

// 更新答案
const updateAnswer = (questionId, value) => {
  answers[questionId] = value;

  // 清除该问题的验证错误
  if (validationErrors.value[questionId]) {
    const newErrors = { ...validationErrors.value };
    delete newErrors[questionId];
    validationErrors.value = newErrors;
  }
};

// 手动保存草稿
const saveDraft = async () => {
  emit('save-draft', { ...answers });

  // 分析并更新完成状态
  analyzeCompletedSections();
};
</script>

<style lang="scss" scoped>
.survey-form {
  margin-bottom: 30px;

  // 添加标签式导航样式
  .section-tabs {
    display: flex;
    overflow-x: auto;
    margin-bottom: 30px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;

    .section-tab {
      display: flex;
      align-items: center;
      padding: 10px 15px;
      margin-right: 8px;
      border-radius: 6px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
      background-color: #f8f9fa;

      &:hover:not(.disabled) {
        background-color: #e9ecef;
      }

      &.active {
        background-color: #e74c3c;
        color: white;

        .tab-indicator {
          background-color: white;
          color: #e74c3c;
        }
      }

      &.completed:not(.active) {
        background-color: #e8f5e9;
        color: #2e7d32;

        .tab-indicator {
          background-color: #2e7d32;
          color: white;
        }
      }

      &.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        color: #aaa;
      }

      .tab-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: #dee2e6;
        color: #495057;
        font-size: 12px;
        font-weight: bold;
        margin-right: 8px;

        .check-icon {
          font-size: 12px;
        }
      }

      .tab-title {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  h2 {
    font-size: 22px;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
  }

  .section-description {
    color: #666;
    margin-bottom: 25px;
    font-size: 16px;
    text-align: center;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }

  .form-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;

    .center-actions {
      flex-grow: 1;
      text-align: center;
    }

    .save-button {
      background-color: #2ecc71;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover:not(:disabled) {
        background-color: #27ae60;
      }

      &:disabled {
        background-color: #95e3b4;
        cursor: not-allowed;
      }
    }

    .secondary-button {
      background-color: white;
      color: #e74c3c;
      border: 1px solid #e74c3c;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      min-width: 120px;
      transition: all 0.2s;

      &:hover {
        background-color: #fef5f4;
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
      }
    }

    .primary-button {
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      min-width: 120px;
      transition: background-color 0.2s;

      &:hover {
        background-color: #c0392b;
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.3);
      }
    }
  }
}

// 适配移动设备
@media (max-width: 768px) {
  .survey-form {
    .section-tabs {
      .section-tab {
        padding: 8px 12px;

        .tab-title {
          display: none;
        }

        .tab-indicator {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
