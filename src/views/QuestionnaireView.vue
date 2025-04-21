<template>
  <div class="questionnaire-container">
    <div class="questionnaire-wrapper">
      <div class="questionnaire-header">
        <h1 class="questionnaire-title">性格特质测评</h1>
        <p class="questionnaire-description">完成以下30个问题，了解您的性格特质</p>

        <!-- 进度条 -->
        <div class="progress-bar-container">
          <div class="progress-bar-fill" :style="`width: ${progress}%`"></div>
        </div>
        <p class="progress-text">
          {{ currentSectionIndex + 1 }}/{{ questions.length }} 部分 | {{ answeredQuestions }}/{{
            totalQuestions
          }}
          问题
        </p>
      </div>

      <!-- 维度标题 -->
      <h2 class="section-title">
        {{ currentSection.title }}
      </h2>

      <!-- 问题列表 -->
      <div class="questions-container">
        <div v-for="question in currentSection.questions" :key="question.id">
          <QuestionItem :question="question" v-model="answers[question.id]" />
        </div>
      </div>

      <!-- 导航按钮 -->
      <div class="navigation-buttons">
        <button v-if="currentSectionIndex > 0" @click="prevSection" class="button button-secondary">
          上一部分
        </button>
        <div v-else></div>

        <button
          v-if="currentSectionIndex < questions.length - 1"
          @click="nextSection"
          class="button button-primary"
          :disabled="!isCurrentSectionComplete"
        >
          下一部分
        </button>
        <button
          v-else
          @click="submitQuestionnaire"
          class="button button-success"
          :disabled="!isFormComplete"
        >
          提交测评
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import QuestionItem from '../components/QuestionItem.vue';
import { submitAnswers } from '../services/api';
import { questions } from '../constants/questions.js';

const router = useRouter();
const currentSectionIndex = ref(0);
const isLoading = ref(false);
const answers = reactive({});

// 计算属性
const currentSection = computed(() => questions[currentSectionIndex.value]);

const totalQuestions = computed(() => {
  return questions.reduce((sum, section) => sum + section.questions.length, 0);
});

const answeredQuestions = computed(() => {
  return Object.keys(answers).length;
});

const progress = computed(() => {
  return (answeredQuestions.value / totalQuestions.value) * 100;
});

const isCurrentSectionComplete = computed(() => {
  return currentSection.value.questions.every((q) => answers[q.id] !== undefined);
});

const isFormComplete = computed(() => {
  return questions.every((section) => section.questions.every((q) => answers[q.id] !== undefined));
});

// 方法
const nextSection = () => {
  if (currentSectionIndex.value < questions.length - 1) {
    currentSectionIndex.value++;
    window.scrollTo(0, 0);
  }
};

const prevSection = () => {
  if (currentSectionIndex.value > 0) {
    currentSectionIndex.value--;
    window.scrollTo(0, 0);
  }
};

const submitQuestionnaire = async () => {
  if (!isFormComplete.value) return;

  try {
    isLoading.value = true;
    const result = await submitAnswers(answers);
    console.log(result, 'result');


    // 跳转到结果页面
    router.push({
      name: 'results',
      params: { id: result.id },
      state: { result },
    });
  } catch (error) {
    console.error('提交失败:', error);
    // alert('提交失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};

// 初始化默认答案
onMounted(() => {
  // 为分配题型和评分题型初始化答案对象
  questions.forEach((section) => {
    section.questions.forEach((question) => {
      if (question.type === 'distribution') {
        answers[question.id] = {};
        question.options.forEach((option) => {
          answers[question.id][option.key] = 0;
        });
      } else if (question.type === 'rating') {
        answers[question.id] = {};
        question.options.forEach((option) => {
          answers[question.id][option.key] = 0;
        });
      }
    });
  });
});
</script>

<style scoped lang="scss">
@import '../assets/scss/variables.scss';

.questionnaire-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-8 $spacing-4;
}

.questionnaire-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.questionnaire-header {
  margin-bottom: $spacing-6;
  background-color: $white;
  padding: $spacing-6;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
}

.questionnaire-title {
  font-size: $font-size-2xl;
  font-weight: 700;
  text-align: center;
  margin-bottom: $spacing-4;
}

.questionnaire-description {
  color: $gray-600;
  text-align: center;
  margin-bottom: $spacing-2;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: $gray-200;
  border-radius: $border-radius-full;
  margin-bottom: $spacing-4;
}

.progress-bar-fill {
  height: 100%;
  background-color: $primary-color;
  border-radius: $border-radius-full;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: $font-size-sm;
  color: $gray-500;
  text-align: right;
}

.section-title {
  font-size: $font-size-xl;
  font-weight: 500;
  margin-bottom: $spacing-4;
  background-color: rgba($primary-color, 0.05);
  padding: $spacing-3;
  border-radius: $border-radius-lg;
}

.questions-container {
  margin-bottom: $spacing-6;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: $spacing-8;
}

.button {
  padding: $spacing-2 $spacing-6;
  border-radius: $border-radius-md;
  font-weight: 500;
  cursor: pointer;
  transition: $transition-base;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.button-primary {
    background-color: $primary-color;
    color: $white;
    border: none;

    &:hover:not(:disabled) {
      background-color: $primary-dark;
    }
  }

  &.button-secondary {
    background-color: $white;
    color: $primary-color;
    border: 1px solid $primary-color;

    &:hover:not(:disabled) {
      background-color: rgba($primary-color, 0.05);
    }
  }

  &.button-success {
    background-color: $secondary-color;
    color: $white;
    border: none;

    &:hover:not(:disabled) {
      background-color: $secondary-dark;
    }
  }
}
</style>
