<template>
  <div class="preference-container">
    <div class="header">
      <h1>伴侣偏好设置</h1>
      <p>设置您对理想伴侣的期望及各条件的重要性</p>
      <button class="reset-button" @click="resetPreferences">
        <i class="reset-icon">↺</i> 重置
      </button>
    </div>

    <!-- 匹配影响分析 -->
    <MatchImpactAnalysis
      :matchImpact="matchImpact"
      :showAnalysis="showImpactAnalysis"
      :criticalFactors="processedCriticalFactors"
      @toggle-analysis="showImpactAnalysis = !showImpactAnalysis"
    />

    <!-- 偏好设置区域 -->
    <div class="preferences-section">
      <h2>基本偏好设置 <span class="hint">（请根据重要性进行设置）</span></h2>

      <!-- 年龄范围 -->
      <PreferenceItem
        :modelValue="data.age"
        @update:modelValue="updatePreference('age', $event)"
        title="期望年龄范围"
        type="range"
        minLabel="最小年龄"
        maxLabel="最大年龄"
        :minRange="18"
        :maxRange="70"
      />

      <!-- 身高范围 -->
      <PreferenceItem
        :modelValue="data.height"
        @update:modelValue="updatePreference('height', $event)"
        title="期望身高范围"
        type="range"
        minLabel="最低身高"
        maxLabel="最高身高"
        :minRange="140"
        :maxRange="210"
        unit="cm"
      />

      <!-- 学历要求 -->
      <PreferenceItem
        :modelValue="data.education"
        @update:modelValue="updatePreference('education', $event)"
        title="学历要求"
        type="select"
        :options="educationLabels"
      />

      <!-- 收入要求 -->
      <PreferenceItem
        :modelValue="data.income"
        @update:modelValue="updatePreference('income', $event)"
        title="月收入要求"
        type="select"
        :options="incomeFilterLabels"
      />

      <!-- 是否接受离异 -->
      <PreferenceItem
        :modelValue="data.acceptDivorced"
        @update:modelValue="updatePreference('acceptDivorced', $event)"
        title="婚姻状况要求"
        type="select"
        :options="acceptDivorcedLabels"
      />

      <!-- 吸烟接受度 -->
      <PreferenceItem
        :modelValue="data.acceptSmoking"
        @update:modelValue="updatePreference('acceptSmoking', $event)"
        title="对方吸烟习惯"
        type="select"
        :options="acceptSmokingLabels"
      />

      <!-- 饮酒接受度 -->
      <PreferenceItem
        :modelValue="data.acceptDrinking"
        @update:modelValue="updatePreference('acceptDrinking', $event)"
        title="对方饮酒习惯"
        type="select"
        :options="acceptDrinkingLabels"
      />

      <!-- 宠物接受度 -->
      <PreferenceItem
        :modelValue="data.acceptPets"
        @update:modelValue="updatePreference('acceptPets', $event)"
        title="对方养宠物情况"
        type="select"
        :options="acceptPetLabels"
      />

      <!-- 作息习惯要求 -->
      <PreferenceItem
        :modelValue="data.acceptSleep"
        @update:modelValue="updatePreference('acceptSleep', $event)"
        title="对方作息习惯"
        type="select"
        :options="acceptSleepLabels"
      />
    </div>

    <!-- 导航按钮 -->
    <div class="navigation-buttons">
      <button class="prev-button" @click="emit('back')">上一步</button>
      <button class="next-button" @click="nextStep">下一步</button>
    </div>

    <!-- 提示信息 -->
    <div class="help-text">
      <p>
        <i class="info-icon">ℹ️</i>
        <strong>必须满足</strong>：此条件为硬性筛选条件，不符合要求的用户将不会出现在匹配结果中
      </p>
      <p>
        <i class="info-icon">ℹ️</i>
        <strong>希望满足</strong>：此条件为软性筛选条件，满足此条件会增加匹配分数
      </p>
      <p>
        <i class="info-icon">ℹ️</i>
        <strong>不重要</strong>：此条件不会影响匹配结果
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import PreferenceItem from './PreferenceItem.vue';
import MatchImpactAnalysis from './MatchImpactAnalysis.vue';
import {
  educationOptions,
  incomeFilterOptions,
  acceptDivorcedOptions,
  acceptSmokingOptions,
  acceptDrinkingOptions,
  acceptPetOptions,
  acceptSleepOptions
} from '../../../data/optionsData';

// 定义emit
const emit = defineEmits(['back', 'complete', 'update:data']);

// 从props接收偏好数据
const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      age: { min: 25, max: 35, importance: 'prefer' },
      height: { min: 160, max: 175, importance: 'prefer' },
      education: { value: 'bachelor', importance: 'prefer' },
      income: { value: 10000, importance: 'prefer' },
      acceptDivorced: { value: 'single_only', importance: 'prefer' },
    }),
  },
});

const showImpactAnalysis = ref(false);

// 使用统一的选项数据
const educationLabels = educationOptions;
const incomeFilterLabels = incomeFilterOptions;
const acceptDivorcedLabels = acceptDivorcedOptions;
const acceptSmokingLabels = acceptSmokingOptions;
const acceptDrinkingLabels = acceptDrinkingOptions;
const acceptPetLabels = acceptPetOptions;
const acceptSleepLabels = acceptSleepOptions;

// 匹配影响状态 - 使用静态数据替代模拟计算
const matchImpact = ref({
  matchPool: 75,
  strongMatches: 30,
  criticalFactors: ['age', 'education', 'acceptDivorced'],
});

// 处理后的关键因素列表
const processedCriticalFactors = computed(() => {
  return matchImpact.value.criticalFactors.map((factor) => {
    let label = '';
    let suggestion = '';
    let impact = 0;

    switch (factor) {
      case 'age':
        label = `年龄范围 (${props.data.age.min}-${props.data.age.max}岁)`;
        suggestion = '建议：扩大年龄范围或降低重要性可增加匹配池';
        impact = 30;
        break;
      case 'height':
        label = `身高范围 (${props.data.height.min}-${props.data.height.max}cm)`;
        suggestion = '建议：扩大身高范围或降低重要性';
        impact = 25;
        break;
      case 'education':
        label = `学历要求 (${educationLabels[props.data.education.value]})`;
        suggestion = '建议：考虑降低学历要求的重要性';
        impact = 28;
        break;
      case 'income':
        label = `收入要求 (${incomeFilterLabels[props.data.income.value]})`;
        suggestion = '建议：考虑降低收入要求或重要性';
        impact = 35;
        break;
      case 'acceptDivorced':
        label = `婚姻状况要求 (${acceptDivorcedLabels[props.data.acceptDivorced.value]})`;
        suggestion = '建议：考虑接受更多婚姻状况或降低重要性';
        impact = 20;
        break;
      case 'acceptSmoking':
        label = `吸烟习惯要求 (${acceptSmokingLabels[props.data.acceptSmoking.value]})`;
        suggestion = '建议：考虑放宽对吸烟习惯的要求';
        impact = 15;
        break;
      case 'acceptDrinking':
        label = `饮酒习惯要求 (${acceptDrinkingLabels[props.data.acceptDrinking.value]})`;
        suggestion = '建议：考虑放宽对饮酒习惯的要求';
        impact = 12;
        break;
    }

    return { name: factor, label, suggestion, impact };
  });
});

// 更新偏好
const updatePreference = (key, value) => {
  // 创建新的偏好对象
  const updatedPreferences = { ...props.data };
  // 更新指定键的值
  updatedPreferences[key] = value;
  // 发送更新事件
  emit('update:data', updatedPreferences);
};

// 下一步
const nextStep = () => {
  // 触发下一步事件
  emit('complete');
};

// 重置所有偏好设置
const resetPreferences = () => {
  // 创建默认偏好对象
  const defaultPreferences = {
    age: { min: 25, max: 35, importance: 'prefer' },
    height: { min: 160, max: 175, importance: 'prefer' },
    education: { value: 'bachelor', importance: 'prefer' },
    income: { value: 'above_10k', importance: 'prefer' },
    acceptDivorced: { value: 'single_only', importance: 'prefer' },
    // 新增选项的默认值
    acceptSmoking: { value: 'never_only', importance: 'prefer' },
    acceptDrinking: { value: 'accept_socially', importance: 'prefer' },
    acceptPets: { value: 'accept_all', importance: 'not_important' },
    acceptSleep: { value: 'any', importance: 'not_important' },
  };

  // 发送更新事件
  emit('update:data', defaultPreferences);
};
</script>

<style scoped lang="scss">
.preference-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;

  .header {
    text-align: center;
    margin-bottom: 24px;
    position: relative;

    h1 {
      font-size: 24px;
      color: #333;
      margin-bottom: 8px;
    }

    p {
      color: #666;
      font-size: 14px;
    }

    .reset-button {
      position: absolute;
      right: 0;
      top: 0;
      display: flex;
      align-items: center;
      padding: 6px 12px;
      background-color: transparent;
      border: 1px solid #ddd;
      border-radius: 4px;
      color: #666;
      font-size: 13px;
      cursor: pointer;

      &:hover {
        background-color: #f5f5f5;
        color: #e53935;
        border-color: #e53935;
      }

      .reset-icon {
        margin-right: 4px;
        font-size: 14px;
      }
    }
  }

  .preferences-section {
    background-color: #fff;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    h2 {
      margin-top: 0;
      margin-bottom: 24px;
      font-size: 18px;
      color: #333;
      border-bottom: 1px solid #eee;
      padding-bottom: 12px;

      .hint {
        font-size: 14px;
        font-weight: normal;
        color: #888;
      }
    }
  }

  .navigation-buttons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;

    button {
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 15px;
      cursor: pointer;

      &.prev-button {
        background-color: white;
        color: #e53935;
        border: 1px solid #e53935;

        &:hover {
          background-color: rgba(229, 57, 53, 0.05);
        }
      }

      &.next-button {
        background-color: #e53935;
        color: white;
        border: 1px solid #e53935;

        &:hover {
          background-color: #d32f2f;
        }
      }
    }
  }

  .help-text {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 16px;

    p {
      display: flex;
      align-items: center;
      margin: 6px 0;
      font-size: 13px;
      color: #666;

      .info-icon {
        margin-right: 8px;
      }

      strong {
        color: #444;
      }
    }
  }
}
</style>
