<template>
  <div class="question-section">
    <div class="question-list">
      <div
        v-for="(question, index) in section.questions"
        :key="question.id"
        class="question-item-wrapper"
      >
        <QuestionItem
          :question="question"
          :index="index + 1"
          :value="answers[question.id]"
          :error="validationErrors[question.id]"
          @update-value="(value) => handleAnswerChange(question.id, value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import QuestionItem from './QuestionItem.vue';

// 接收props
const props = defineProps({
  section: {
    type: Object,
    required: true,
  },
  answers: {
    type: Object,
    required: true,
  },
  validationErrors: {
    type: Object,
    required: true,
  },
});

// 定义emit
const emit = defineEmits(['update-answer']);

const handleAnswerChange = (questionId, value) => {
  emit('update-answer', questionId, value);
};
</script>

<style lang="scss" scoped>
.question-section {
  margin-bottom: 20px;

  .question-list {
    .question-item-wrapper {
      margin-bottom: 30px;
      padding-bottom: 30px;
      border-bottom: 1px dashed #eee;

      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>
