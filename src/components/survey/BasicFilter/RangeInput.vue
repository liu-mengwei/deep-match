<template>
  <div class="preference-input range-input">
    <div class="range-group">
      <label>{{ minLabel }}</label>
      <div class="range-control">
        <button @click="adjustValue('min', -1)" class="adjust-btn">-</button>
        <input
          type="number"
          :value="modelValue.min"
          @input="updateMin"
          class="range-value"
          :min="minRange"
          :max="maxRange"
        />
        <button @click="adjustValue('min', 1)" class="adjust-btn">+</button>
      </div>
      <span v-if="unit" class="unit">{{ unit }}</span>
    </div>
    <div class="range-divider"></div>
    <div class="range-group">
      <label>{{ maxLabel }}</label>
      <div class="range-control">
        <button @click="adjustValue('max', -1)" class="adjust-btn">-</button>
        <input
          type="number"
          :value="modelValue.max"
          @input="updateMax"
          class="range-value"
          :min="minRange"
          :max="maxRange"
        />
        <button @click="adjustValue('max', 1)" class="adjust-btn">+</button>
      </div>
      <span v-if="unit" class="unit">{{ unit }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  minLabel: {
    type: String,
    default: '最小值',
  },
  maxLabel: {
    type: String,
    default: '最大值',
  },
  minRange: {
    type: Number,
    default: 0,
  },
  maxRange: {
    type: Number,
    default: 100,
  },
  unit: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const updateMin = (event) => {
  let min = Number(event.target.value);
  if (min > props.modelValue.max) {
    min = props.modelValue.max;
  }
  emit('update:modelValue', { ...props.modelValue, min });
};

const updateMax = (event) => {
  let max = Number(event.target.value);
  if (max < props.modelValue.min) {
    max = props.modelValue.min;
  }
  emit('update:modelValue', { ...props.modelValue, max });
};

const adjustValue = (type, amount) => {
  if (type === 'min') {
    let min = props.modelValue.min + amount;
    if (min < props.minRange) min = props.minRange;
    if (min > props.modelValue.max) min = props.modelValue.max;
    emit('update:modelValue', { ...props.modelValue, min });
  } else {
    let max = props.modelValue.max + amount;
    if (max > props.maxRange) max = props.maxRange;
    if (max < props.modelValue.min) max = props.modelValue.min;
    emit('update:modelValue', { ...props.modelValue, max });
  }
};
</script>

<style scoped lang="scss">
.range-input {
  display: flex;
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 16px;

  .range-group {
    flex: 1;
    display: flex;
    align-items: center;

    label {
      font-size: 14px;
      color: #555;
      margin-right: 12px;
    }

    .range-control {
      display: flex;
      align-items: center;

      .adjust-btn {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        cursor: pointer;

        &:hover {
          background-color: #e6e6e6;
        }
      }

      .range-value {
        width: 50px;
        text-align: center;
        height: 28px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin: 0 8px;

        &:focus {
          outline: none;
          border-color: #2196f3;
        }
      }
    }

    .unit {
      margin-left: 8px;
      font-size: 14px;
      color: #666;
    }
  }

  .range-divider {
    width: 1px;
    background-color: #ddd;
    margin: 0 20px;
  }
}
</style>
