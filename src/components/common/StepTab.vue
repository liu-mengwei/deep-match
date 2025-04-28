<template>
  <div
    class="step"
    :class="{
      active: isActive,
      completed: isCompleted,
      clickable: isClickable,
      disabled: isDisabled,
    }"
    @click="handleClick"
  >
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  step: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  isClickable: {
    type: Boolean,
    default: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click']);

const handleClick = () => {
  if (props.isDisabled) return;
  emit('click', props.step);
};
</script>

<style lang="scss" scoped>
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
</style>
