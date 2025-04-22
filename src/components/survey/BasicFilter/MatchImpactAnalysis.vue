<template>
  <div v-if="shouldShow" class="impact-notice" :class="{ critical: matchImpact.matchPool < 15 }">
    <div class="icon-container">
      <i class="icon" v-if="matchImpact.matchPool < 15">⚠️</i>
      <i class="icon" v-else>👍</i>
    </div>
    <div class="content">
      <h3>{{ matchImpact.matchPool < 15 ? '您的匹配条件较为严格' : '您的匹配条件设置合理' }}</h3>
      <p>
        根据当前设置，约有 <strong>{{ matchImpact.matchPool }}%</strong> 的用户符合您的筛选条件，
        其中约 <strong>{{ matchImpact.strongMatches }}%</strong> 可能是强匹配。
      </p>
      <button
        v-if="matchImpact.matchPool < 15"
        @click="$emit('toggle-analysis')"
        class="analyze-button"
      >
        <i class="chart-icon">📊</i> 查看条件影响分析
      </button>
    </div>
  </div>

  <div v-if="showAnalysis" class="impact-analysis">
    <h4>条件限制影响分析</h4>

    <div v-for="factor in criticalFactors" :key="factor.name" class="impact-item">
      <div class="impact-header">
        <span>{{ factor.label }}</span>
        <span class="impact-value">限制了约{{ factor.impact }}%的潜在匹配</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: factor.impact + '%' }"></div>
      </div>
      <p class="suggestion">{{ factor.suggestion }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  matchImpact: {
    type: Object,
    required: true,
  },
  shouldShow: {
    type: Boolean,
    default: true,
  },
  showAnalysis: {
    type: Boolean,
    default: false,
  },
  criticalFactors: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['toggle-analysis']);
</script>

<style scoped lang="scss">
.impact-notice {
  display: flex;
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 8px;
  background-color: #e3f2fd;
  border: 1px solid #bbdefb;

  &.critical {
    background-color: #fff3e0;
    border-color: #ffe0b2;
  }

  .icon-container {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;

    .icon {
      font-size: 20px;
    }
  }

  .content {
    flex: 1;

    h3 {
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 16px;
      color: #1976d2;

      .critical & {
        color: #e65100;
      }
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #555;
      line-height: 1.5;
    }

    .analyze-button {
      display: inline-flex;
      align-items: center;
      margin-top: 12px;
      padding: 4px 12px;
      border: none;
      background-color: rgba(232, 96, 56, 0.1);
      color: #e65100;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;

      &:hover {
        background-color: rgba(232, 96, 56, 0.2);
      }

      .chart-icon {
        margin-right: 4px;
      }
    }
  }
}

.impact-analysis {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 8px;

  h4 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 16px;
    color: #333;
  }

  .impact-item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .impact-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 14px;

      .impact-value {
        color: #777;
      }
    }

    .progress-bar {
      height: 8px;
      background-color: #eee;
      border-radius: 4px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        background-color: #e53935;
        border-radius: 4px;
      }
    }

    .suggestion {
      margin-top: 6px;
      font-size: 12px;
      color: #666;
      font-style: italic;
    }
  }
}
</style>
