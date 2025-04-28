<template>
  <div class="weight-settings">
    <h2>自定义匹配权重</h2>
    <p class="description">
      设置各个问卷部分的重要程度，权重总和必须等于100%。更高的权重代表该部分在匹配算法中更重要。
    </p>

    <div class="weight-info-box">
      <p>您可以通过调整权重来告诉我们哪些方面对您的匹配更重要：</p>
      <ul>
        <li><strong>核心价值观</strong> - 金钱观、婚姻观等基本价值观的匹配</li>
        <li><strong>情感相处模式</strong> - 情感表达和沟通方式的兼容性</li>
        <li><strong>生活习惯</strong> - 日常生活习惯的契合度</li>
        <li><strong>长期规划</strong> - 对未来发展方向的一致性</li>
      </ul>
      <p class="note">注：基本信息和个人特质不在权重计算范围内，这些是匹配的前置条件。</p>
    </div>

    <div class="weight-total" :class="statusClass">
      <div class="weight-summary">
        当前权重总和: <strong>{{ totalWeight }}%</strong> ({{ weightStatus }} 100%)
      </div>
      <button class="balance-button" @click="balanceWeights">平均分配权重</button>
    </div>

    <div class="weight-list">
      <div v-for="section in weightableSections" :key="section.id" class="weight-item">
        <div class="weight-info">
          <h3>{{ section.title }}</h3>
          <p v-if="section.description" class="section-description">
            {{ section.description }}
          </p>
        </div>

        <div class="weight-controls">
          <div class="weight-input-container">
            <input
              type="number"
              :id="`weight_${section.id}`"
              :value="weights[section.id]"
              @input="(e) => handleWeightUpdate(section.id, parseInt(e.target.value))"
              min="0"
              max="100"
              class="weight-input"
            />
            <span class="percentage">%</span>
          </div>

          <div class="weight-slider-container">
            <input
              type="range"
              :value="weights[section.id]"
              @input="(e) => handleWeightUpdate(section.id, parseInt(e.target.value))"
              min="0"
              max="100"
              class="weight-slider"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button class="secondary-button" @click="handleBack">上一步</button>

      <button class="primary-button" :disabled="!isValid || isSubmitting" @click="handleSubmit">
        {{ isSubmitting ? '提交中...' : '提交问卷' }}
      </button>

      <div v-if="!isValid" class="weight-error">请确保权重总和等于100%</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

// 定义权重可调整的部分数据
const weightableSections = [
  {
    id: 'partner_preferences',
    title: '伴侣偏好',
    description: '关于理想伴侣特质的偏好',
    defaultWeight: 20,
  },
  {
    id: 'values',
    title: '核心价值观',
    description: '金钱观、婚姻观等基本价值观的匹配',
    defaultWeight: 25,
  },
  {
    id: 'emotional_patterns',
    title: '情感相处模式',
    description: '情感表达和沟通方式的兼容性',
    defaultWeight: 20,
  },
  {
    id: 'lifestyle',
    title: '生活习惯',
    description: '日常生活习惯的契合度',
    defaultWeight: 15,
  },
  {
    id: 'future_planning',
    title: '长期规划',
    description: '对未来发展方向的一致性',
    defaultWeight: 20,
  },
];

// 接收props
const props = defineProps({
  weights: {
    type: Object,
    required: true,
  },
  totalWeight: {
    type: Number,
    required: true,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
});

// 定义emit
const emit = defineEmits(['update-weights', 'submit', 'back', 'save-draft']);

const isValid = computed(() => {
  return props.totalWeight === 100;
});

const weightStatus = computed(() => {
  if (props.totalWeight < 100) return '低于';
  if (props.totalWeight > 100) return '超过';
  return '等于';
});

const statusClass = computed(() => {
  if (props.totalWeight < 100) return 'under';
  if (props.totalWeight > 100) return 'over';
  return 'balanced';
});

// 处理权重更新
const handleWeightUpdate = (sectionId, newWeight) => {
  // 更新指定部分的权重
  const newWeights = { ...props.weights };
  newWeights[sectionId] = newWeight;

  // 触发父组件中的更新方法
  emit('update-weights', newWeights);

  // 自动保存草稿
  saveDraft(newWeights);
};

// 保存草稿
const saveDraft = (weights) => {
  emit('save-draft', weights, 'weights');
};

const balanceWeights = () => {
  const sectionIds = Object.keys(props.weights);
  const targetWeight = Math.floor(100 / sectionIds.length);

  const newWeights = { ...props.weights };
  sectionIds.forEach((id, index) => {
    // 最后一项处理余数
    if (index === sectionIds.length - 1) {
      const currentSum = sectionIds.slice(0, -1).reduce((sum, id) => sum + newWeights[id], 0);
      newWeights[id] = 100 - currentSum;
    } else {
      newWeights[id] = targetWeight;
    }
  });

  emit('update-weights', newWeights);
};

const handleSubmit = () => {
  if (isValid.value) {
    emit('submit');
  }
};

// 添加回退功能
const handleBack = () => {
  emit('back');
};
</script>

<style lang="scss" scoped>
.weight-settings {
  margin-bottom: 30px;

  h2 {
    font-size: 22px;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
  }

  .description {
    color: #666;
    margin-bottom: 25px;
    font-size: 16px;
    text-align: center;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }

  .weight-info-box {
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 15px 20px;
    margin-bottom: 25px;

    p {
      margin: 0 0 10px 0;
      line-height: 1.5;
      font-size: 15px;
      color: #555;
    }

    ul {
      margin: 10px 0;
      padding-left: 30px;

      li {
        margin-bottom: 8px;
        font-size: 14px;
        color: #555;
      }
    }

    .note {
      font-size: 14px;
      color: #777;
      font-style: italic;
      margin-top: 10px;
    }
  }

  .weight-total {
    padding: 15px 20px;
    border-radius: 6px;
    margin-bottom: 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;

    &.balanced {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    &.under {
      background-color: #fff8e1;
      color: #ff8f00;
    }

    &.over {
      background-color: #ffebee;
      color: #c62828;
    }

    .weight-summary {
      strong {
        font-size: 18px;
      }
    }

    .balance-button {
      background: white;
      border: 1px solid currentColor;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      color: inherit;
      transition: all 0.2s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.8);
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
      }
    }
  }

  .weight-list {
    margin-bottom: 30px;

    .weight-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .weight-info {
        flex: 0 0 40%;
        padding-right: 20px;

        h3 {
          font-size: 16px;
          margin: 0 0 8px 0;
          color: #333;
        }

        .section-description {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
      }

      .weight-controls {
        flex: 0 0 60%;
        display: flex;
        align-items: center;

        .weight-input-container {
          display: flex;
          align-items: center;
          width: 80px;
          margin-right: 15px;

          .weight-input {
            width: 60px;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 15px;
            text-align: center;

            &:focus {
              outline: none;
              border-color: #e74c3c;
              box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
            }
          }

          .percentage {
            margin-left: 5px;
            color: #666;
          }
        }

        .weight-slider-container {
          flex-grow: 1;

          .weight-slider {
            width: 100%;
            -webkit-appearance: none;
            height: 6px;
            border-radius: 3px;
            background: #ddd;
            outline: none;

            &::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #e74c3c;
              cursor: pointer;
            }

            &::-moz-range-thumb {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #e74c3c;
              cursor: pointer;
              border: none;
            }
          }
        }
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;

    .secondary-button {
      background-color: white;
      color: #666;
      border: 1px solid #ccc;
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      min-width: 180px;
      transition: all 0.2s;
      text-align: center;

      &:hover {
        background-color: #f9f9f9;
        color: #555;
        border-color: #bbb;
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
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
      min-width: 180px;
      cursor: pointer;
      transition: background-color 0.2s;
      text-align: center;

      &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }

      &:hover:not(:disabled) {
        background-color: #c0392b;
      }

      &:focus:not(:disabled) {
        outline: none;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.3);
      }
    }

    .weight-error {
      flex-basis: 100%;
      margin-top: 15px;
      color: #e74c3c;
      font-size: 14px;
      text-align: center;
    }
  }
}
</style>
