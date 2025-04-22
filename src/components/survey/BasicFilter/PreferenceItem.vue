<template>
  <div class="preference-item">
    <div class="preference-header">
      <h3>{{ title }}</h3>
    </div>

    <ImportanceSelector :modelValue="modelValue.importance" @change="updateImportance" />

    <slot name="input">
      <div class="preference-input select-input" v-if="type === 'select'">
        <select :value="modelValue.value" @input="updateValue">
          <option v-for="(label, value) in options" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
      </div>

      <RangeInput
        v-if="type === 'range'"
        :modelValue="{ min: modelValue.min, max: modelValue.max }"
        @update:modelValue="updateRange"
        :minLabel="minLabel"
        :maxLabel="maxLabel"
        :minRange="minRange"
        :maxRange="maxRange"
        :unit="unit"
      />
    </slot>
  </div>
</template>

<script setup>
import ImportanceSelector from './ImportanceSelector.vue';
import RangeInput from './RangeInput.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'select',
    validator: (value) => ['select', 'range'].includes(value),
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  minLabel: String,
  maxLabel: String,
  minRange: Number,
  maxRange: Number,
  unit: String,
});

const emit = defineEmits(['update:modelValue']);

const updateImportance = (importance) => {
  emit('update:modelValue', { ...props.modelValue, importance });
};

const updateValue = (event) => {
  emit('update:modelValue', { ...props.modelValue, value: event.target.value });
};

const updateRange = (range) => {
  emit('update:modelValue', { ...props.modelValue, min: range.min, max: range.max });
};
</script>

<style scoped lang="scss">
.preference-item {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  .preference-header {
    margin-bottom: 8px;

    h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }
  }

  .preference-input {
    &.select-input {
      background-color: #f9f9f9;
      border-radius: 6px;
      padding: 16px;

      select {
        width: 100%;
        height: 36px;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0 12px;
        font-size: 14px;
        color: #333;
        background-color: white;

        &:focus {
          outline: none;
          border-color: #2196f3;
        }
      }
    }
  }
}
</style>
