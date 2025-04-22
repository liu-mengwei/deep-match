<template>
  <div class="importance-row">
    <span class="importance-label">重要性：</span>
    <div class="importance-selector">
      <span
        v-for="(label, value) in importanceOptions"
        :key="value"
        @click="$emit('change', value)"
        class="importance-option"
        :class="[modelValue === value ? getImportanceClass(value) : 'inactive']"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  importanceOptions: {
    type: Object,
    default: () => ({
      must: '必须满足',
      prefer: '希望满足',
      dontcare: '不重要',
    }),
  },
});

defineEmits(['change']);

const getImportanceClass = (importance) => {
  switch (importance) {
    case 'must':
      return 'must-option';
    case 'prefer':
      return 'prefer-option';
    case 'dontcare':
      return 'dontcare-option';
    default:
      return '';
  }
};
</script>

<style scoped lang="scss">
.importance-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  .importance-label {
    font-size: 12px;
    color: #777;
    margin-right: 10px;
  }

  .importance-selector {
    display: flex;

    .importance-option {
      padding: 3px 8px;
      font-size: 12px;
      border-radius: 12px;
      margin-right: 6px;
      cursor: pointer;
      border: 1px solid #ddd;
      color: #777;
      background-color: #f9f9f9;

      &.must-option {
        background-color: #e53935;
        color: white;
        border-color: #e53935;
      }

      &.prefer-option {
        background-color: #fb8c00;
        color: white;
        border-color: #fb8c00;
      }

      &.dontcare-option {
        background-color: #78909c;
        color: white;
        border-color: #78909c;
      }

      &.inactive:hover {
        background-color: #f0f0f0;
        border-color: #ccc;
      }
    }
  }
}
</style>
