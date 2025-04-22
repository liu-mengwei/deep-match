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
        v-model="preferences.age"
        title="期望年龄范围"
        type="range"
        minLabel="最小年龄"
        maxLabel="最大年龄"
        :minRange="18"
        :maxRange="70"
      />

      <!-- 身高范围 -->
      <PreferenceItem
        v-model="preferences.height"
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
        v-model="preferences.education"
        title="学历要求"
        type="select"
        :options="educationLabels"
      />

      <!-- 收入要求 -->
      <PreferenceItem
        v-model="preferences.income"
        title="月收入要求"
        type="select"
        :options="incomeLabels"
      />

      <!-- 是否接受离异 -->
      <PreferenceItem
        v-model="preferences.acceptDivorced"
        title="是否接受离异"
        type="select"
        :options="acceptDivorcedLabels"
      />
    </div>

    <!-- 导航按钮 -->
    <div class="navigation-buttons">
      <button class="prev-button" @click="emit('back')">上一步</button>
      <button class="next-button" @click="emit('next')">下一步</button>
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
import { ref, reactive, computed, watch } from 'vue';
import PreferenceItem from './PreferenceItem.vue';
import MatchImpactAnalysis from './MatchImpactAnalysis.vue';

// 定义emit
const emit = defineEmits(['back', 'next']);

// 定义偏好状态（所有默认设为 'prefer'）
const preferences = reactive({
  age: { min: 25, max: 35, importance: 'prefer' },
  height: { min: 160, max: 175, importance: 'prefer' },
  education: { value: 'bachelor', importance: 'prefer' },
  income: { value: 10000, importance: 'prefer' },
  acceptDivorced: { value: 'single_only', importance: 'prefer' },
});

// 选项定义
const educationLabels = {
  high_school: '高中及以下',
  college: '大专',
  bachelor: '本科',
  master: '硕士',
  phd: '博士及以上',
};

const incomeLabels = {
  5000: '5千以上/月',
  8000: '8千以上/月',
  10000: '1万以上/月',
  15000: '1.5万以上/月',
  20000: '2万以上/月',
  30000: '3万以上/月',
};

const acceptDivorcedLabels = {
  single_only: '只接受未婚',
  divorced_no_children: '接受离异无子女',
  divorced_with_children: '接受离异有子女',
  any: '不限',
};

// 匹配影响状态
const matchImpact = reactive({
  matchPool: 32,
  strongMatches: 12,
  criticalFactors: ['age', 'acceptDivorced'],
});

const showImpactAnalysis = ref(false);

// 处理后的关键因素列表
const processedCriticalFactors = computed(() => {
  return matchImpact.criticalFactors.map((factor) => {
    let label = '';
    let suggestion = '';
    let impact = 0;

    switch (factor) {
      case 'age':
        label = `年龄范围 (${preferences.age.min}-${preferences.age.max}岁)`;
        suggestion = '建议：扩大年龄范围或降低重要性可增加匹配池';
        impact = 30;
        break;
      case 'height':
        label = `身高范围 (${preferences.height.min}-${preferences.height.max}cm)`;
        suggestion = '建议：扩大身高范围或降低重要性';
        impact = 25;
        break;
      case 'education':
        label = `学历要求 (${educationLabels[preferences.education.value]})`;
        suggestion = '建议：考虑降低学历要求的重要性';
        impact = 28;
        break;
      case 'acceptDivorced':
        label = `接受离异情况 (${acceptDivorcedLabels[preferences.acceptDivorced.value]})`;
        suggestion = '建议：考虑调整为"希望满足"';
        impact = 20;
        break;
    }

    return { name: factor, label, suggestion, impact };
  });
});

// 监听偏好变化，重新计算匹配影响
watch(
  preferences,
  () => {
    calculateImpact();
  },
  { deep: true },
);

// 模拟计算匹配影响
const calculateImpact = () => {
  let pool = 100;
  let critical = [];

  // 年龄条件影响
  const ageRange = preferences.age.max - preferences.age.min;
  if (ageRange < 5 && preferences.age.importance === 'must') {
    pool -= 30;
    critical.push('age');
  } else if (ageRange < 10 && preferences.age.importance === 'must') {
    pool -= 15;
  }

  // 身高条件影响
  if (preferences.height.importance === 'must') {
    pool -= 25;
    if (preferences.height.max - preferences.height.min < 10) {
      critical.push('height');
    }
  }

  // 学历要求影响
  if (preferences.education.value === 'master' && preferences.education.importance === 'must') {
    pool -= 28;
    critical.push('education');
  } else if (
    preferences.education.value === 'bachelor' &&
    preferences.education.importance === 'must'
  ) {
    pool -= 10;
  }

  // 接受离异影响
  if (preferences.acceptDivorced.importance === 'must') {
    pool -= 20;
    if (preferences.acceptDivorced.value === 'single_only') {
      critical.push('acceptDivorced');
    }
  }

  // 确保数值在合理范围内
  pool = Math.max(5, pool);
  const strong = Math.floor(pool * 0.4);

  // 更新状态
  matchImpact.matchPool = pool;
  matchImpact.strongMatches = strong;
  matchImpact.criticalFactors = critical;
};

// 重置所有偏好设置
const resetPreferences = () => {
  // 重置为默认值
  preferences.age.min = 25;
  preferences.age.max = 35;
  preferences.age.importance = 'prefer';

  preferences.height.min = 160;
  preferences.height.max = 175;
  preferences.height.importance = 'prefer';

  preferences.education.value = 'bachelor';
  preferences.education.importance = 'prefer';

  preferences.income.value = 10000;
  preferences.income.importance = 'prefer';

  preferences.acceptDivorced.value = 'single_only';
  preferences.acceptDivorced.importance = 'prefer';

  // 重新计算匹配影响
  calculateImpact();
};

// 初始计算
calculateImpact();
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
