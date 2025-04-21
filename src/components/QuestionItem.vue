<template>
  <div class="question-item">
    <h3 class="question-title">{{ question.text }}</h3>

    <!-- 选择题 -->
    <div v-if="question.type === 'choice'" class="choice-options">
      <div
        v-for="(option, index) in question.options"
        :key="index"
        class="choice-option"
        :class="{ 'choice-option-selected': modelValue === option.value }"
        @click="$emit('update:modelValue', option.value)"
      >
        <div class="choice-radio">
          <div v-if="modelValue === option.value" class="choice-radio-inner"></div>
        </div>
        <div class="choice-label">
          <span>{{ option.label }}</span>
        </div>
      </div>
    </div>

    <!-- 分配分数题 -->
    <div v-else-if="question.type === 'distribution'" class="distribution-options">
      <div v-for="(option, index) in question.options" :key="index" class="distribution-option">
        <div class="distribution-header">
          <span>{{ option.label }}</span>
          <span class="distribution-score">{{ modelValue[option.key] || 0 }}分</span>
        </div>
        <input
          type="range"
          class="distribution-slider"
          min="0"
          max="10"
          step="1"
          :value="modelValue[option.key] || 0"
          @input="updateDistribution(option.key, $event.target.value)"
        />
      </div>

      <div class="distribution-total">
        <span>总分：</span>
        <span
          class="distribution-total-score"
          :class="{
            'distribution-total-invalid': totalPoints !== 10,
            'distribution-total-valid': totalPoints === 10,
          }"
        >
          {{ totalPoints }}/10
        </span>
      </div>
    </div>

    <!-- 评分题 -->
    <div v-else-if="question.type === 'rating'" class="rating-options">
      <div v-for="(option, index) in question.options" :key="index" class="rating-option">
        <div class="rating-label">{{ option.label }}</div>
        <div class="rating-scores">
          <div
            v-for="n in 5"
            :key="n"
            class="rating-score"
            :class="{ 'rating-score-selected': modelValue[option.key] === n }"
            @click="updateRating(option.key, n)"
          >
            {{ n }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: [String, Object, Array],
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const totalPoints = computed(() => {
  if (props.question.type !== 'distribution') return 0;
  return Object.values(props.modelValue).reduce((sum, val) => sum + Number(val), 0);
});

const updateDistribution = (key, value) => {
  const newValue = { ...props.modelValue };
  newValue[key] = Number(value);

  // 调整其他值以确保总和为10
  const currentTotal = Object.entries(newValue).reduce(
    (sum, [k, v]) => (k === key ? sum : sum + Number(v)),
    0,
  );
  const remaining = 10 - Number(value) - currentTotal;

  if (remaining < 0) {
    // 按比例减少其他值
    const otherKeys = Object.keys(newValue).filter((k) => k !== key);
    if (otherKeys.length > 0) {
      const totalOther = currentTotal;
      otherKeys.forEach((k) => {
        const proportion = totalOther > 0 ? newValue[k] / totalOther : 1 / otherKeys.length;
        newValue[k] = Math.max(0, Math.round(newValue[k] + remaining * proportion));
      });
    }
  }

  emit('update:modelValue', newValue);
};

const updateRating = (key, value) => {
  const newValue = { ...props.modelValue };
  newValue[key] = value;
  emit('update:modelValue', newValue);
};
</script>

<style scoped lang="scss">
@use '../assets/scss/variables.scss' as *;

.question-item {
  margin-bottom: $spacing-8;
  padding: $spacing-5;
  background-color: $white;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
}

.question-title {
  font-weight: 500;
  font-size: $font-size-lg;
  margin-bottom: $spacing-3;
}

// 选择题样式
.choice-options {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.choice-option {
  display: flex;
  align-items: flex-start;
  padding: $spacing-3;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background-color: rgba($primary-color, 0.05);
  }

  &.choice-option-selected {
    background-color: rgba($primary-color, 0.1);
  }
}

.choice-radio {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: $border-radius-full;
  border: 2px solid $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-3;
  flex-shrink: 0;
}

.choice-radio-inner {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: $border-radius-full;
  background-color: $primary-color;
}

.choice-label {
  font-weight: 500;
}

// 分配分数题样式
.distribution-options {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.distribution-option {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.distribution-header {
  display: flex;
  justify-content: space-between;
}

.distribution-score {
  font-weight: 500;
}

.distribution-slider {
  width: 100%;
  height: 5px;
  -webkit-appearance: none;
  background-color: $gray-200;
  outline: none;
  border-radius: $border-radius-full;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: $border-radius-full;
    background-color: $primary-color;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: $border-radius-full;
    background-color: $primary-color;
    cursor: pointer;
    border: none;
  }
}

.distribution-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: $spacing-2;
}

.distribution-total-score {
  font-weight: 500;

  &.distribution-total-invalid {
    color: $danger-color;
  }

  &.distribution-total-valid {
    color: $secondary-color;
  }
}

// 评分题样式
.rating-options {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.rating-option {
  margin-bottom: $spacing-2;
}

.rating-label {
  margin-bottom: $spacing-2;
}

.rating-scores {
  display: flex;
  gap: $spacing-2;
}

.rating-score {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: $border-radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: $transition-base;
  background-color: $gray-100;

  &:hover {
    background-color: rgba($primary-color, 0.1);
  }

  &.rating-score-selected {
    background-color: $primary-color;
    color: $white;
  }
}
</style>
