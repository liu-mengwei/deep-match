<template>
  <div :id="question.id" class="question-item" :class="{ 'has-error': error }">
    <div class="question-label">
      <span class="question-number">{{ index }}.</span>
      <span>{{ question.label }}</span>
      <span v-if="question.required" class="required-mark">*</span>
    </div>

    <div class="question-description" v-if="question.description">
      {{ question.description }}
    </div>

    <div class="question-input">
      <!-- 文本输入 -->
      <input
        v-if="question.type === 'text'"
        type="text"
        :id="`input_${question.id}`"
        :value="value"
        @input="updateValue"
        :placeholder="question.placeholder"
        class="text-input"
      />

      <!-- 数字输入 -->
      <input
        v-else-if="question.type === 'number'"
        type="number"
        :id="`input_${question.id}`"
        :value="value"
        @input="updateValue"
        :min="question.min"
        :max="question.max"
        :placeholder="question.placeholder"
        class="number-input"
      />

      <!-- 单选题 -->
      <div v-else-if="question.type === 'radio'" class="radio-options">
        <div v-for="option in question.options" :key="option.value" class="radio-option">
          <input
            type="radio"
            :id="`${question.id}_${option.value}`"
            :name="question.id"
            :value="option.value"
            :checked="value === option.value"
            @change="updateValue"
          />
          <label :for="`${question.id}_${option.value}`">
            {{ option.label }}
          </label>
        </div>
      </div>

      <!-- 多选题 -->
      <div v-else-if="question.type === 'checkbox'" class="checkbox-options">
        <div v-for="option in question.options" :key="option.value" class="checkbox-option">
          <input
            type="checkbox"
            :id="`${question.id}_${option.value}`"
            :name="question.id"
            :value="option.value"
            :checked="value.includes(option.value)"
            @change="updateValue"
          />
          <label :for="`${question.id}_${option.value}`">
            {{ option.label }}
          </label>
        </div>
      </div>

      <!-- 评分题 -->
      <div v-else-if="question.type === 'rating'" class="rating-scale">
        <div class="rating-labels">
          <span>{{ question.minLabel || '非常不同意' }}</span>
          <span>{{ question.maxLabel || '非常同意' }}</span>
        </div>
        <div class="rating-buttons">
          <button
            v-for="rating in 7"
            :key="rating"
            type="button"
            class="rating-button"
            :class="{ selected: value === rating }"
            @click="() => updateRating(rating)"
          >
            {{ rating }}
          </button>
        </div>
      </div>

      <!-- 范围选择 -->
      <div v-else-if="question.type === 'range'" class="range-input">
        <div class="range-item">
          <label :for="`${question.id}_min`">最小值:</label>
          <input
            :id="`${question.id}_min`"
            type="number"
            :value="value?.min"
            @input="(e) => updateRange(parseInt(e.target.value) || null, value?.max)"
            :min="question.min"
            :max="question.max"
            class="range-number-input"
          />
        </div>
        <div class="range-item">
          <label :for="`${question.id}_max`">最大值:</label>
          <input
            :id="`${question.id}_max`"
            type="number"
            :value="value?.max"
            @input="(e) => updateRange(value?.min, parseInt(e.target.value) || null)"
            :min="question.min"
            :max="question.max"
            class="range-number-input"
          />
        </div>
      </div>

      <!-- 开放式问题 -->
      <textarea
        v-else-if="question.type === 'textarea'"
        :id="`input_${question.id}`"
        :value="value"
        @input="updateValue"
        :placeholder="question.placeholder"
        :rows="question.rows || 4"
        class="textarea-input"
      ></textarea>
    </div>

    <div class="error-message" v-if="error">{{ error }}</div>
  </div>
</template>

<script setup>
// 接收props
const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  value: {
    type: [String, Number, Array, Object],
    required: true,
  },
  error: {
    type: String,
    default: null,
  },
});

// 定义emit
const emit = defineEmits(['update-value']);

const updateValue = (event) => {
  let value;

  switch (props.question.type) {
    case 'checkbox':
      // 处理多选
      if (event.target.checked) {
        value = [...props.value, event.target.value];
      } else {
        value = props.value.filter((v) => v !== event.target.value);
      }
      break;

    case 'radio':
      value = event.target.value;
      break;

    case 'rating':
      value = parseInt(event.target.value || event.target.textContent);
      break;

    default:
      value = event.target.value;
  }

  emit('update-value', value);
};

// 评分项的特殊处理
const updateRating = (rating) => {
  emit('update-value', rating);
};

// 范围选择的特殊处理
const updateRange = (min, max) => {
  emit('update-value', { min, max });
};
</script>

<style lang="scss" scoped>
.question-item {
  margin-bottom: 15px;

  &.has-error {
    input,
    textarea,
    .radio-options,
    .checkbox-options,
    .rating-scale {
      border-color: #e74c3c;
    }
  }

  .question-label {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
    font-weight: 500;
    font-size: 16px;

    .question-number {
      color: #e74c3c;
      margin-right: 8px;
      flex-shrink: 0;
    }

    .required-mark {
      color: #e74c3c;
      margin-left: 5px;
    }
  }

  .question-description {
    margin-bottom: 12px;
    color: #666;
    font-size: 14px;
  }

  .question-input {
    margin-top: 10px;

    .text-input,
    .number-input,
    .textarea-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 15px;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: #e74c3c;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
      }
    }

    .number-input {
      width: 160px;
    }

    // 单选和多选样式
    .radio-options,
    .checkbox-options {
      display: flex;
      flex-direction: column;

      .radio-option,
      .checkbox-option {
        margin-bottom: 12px;
        display: flex;
        align-items: center;

        input {
          margin-right: 8px;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        label {
          font-size: 15px;
          cursor: pointer;
        }
      }
    }

    // 评分量表样式
    .rating-scale {
      margin-top: 10px;

      .rating-labels {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 14px;
        color: #666;
      }

      .rating-buttons {
        display: flex;
        justify-content: space-between;

        .rating-button {
          flex: 1;
          margin: 0 4px;
          padding: 10px 0;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;

          &.selected {
            background-color: #e74c3c;
            color: white;
            border-color: #e74c3c;
          }

          &:first-child {
            margin-left: 0;
          }

          &:last-child {
            margin-right: 0;
          }

          &:hover {
            background-color: #e8e8e8;
          }

          &.selected:hover {
            background-color: #c0392b;
          }
        }
      }
    }

    // 范围选择样式
    .range-input {
      display: flex;
      gap: 20px;

      .range-item {
        flex: 1;
        max-width: 200px;

        label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: #666;
        }

        .range-number-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 15px;

          &:focus {
            outline: none;
            border-color: #e74c3c;
            box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
          }
        }
      }
    }
  }

  .error-message {
    margin-top: 8px;
    color: #e74c3c;
    font-size: 14px;
  }
}
</style>
