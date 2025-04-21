<!-- src/components/ScoreResult.vue -->
<template>
  <div class="score-result">
    <h2>特征评分结果</h2>

    <div class="score-content">
      <div v-for="(value, key) in props.result" :key="key" class="feature-item">
        <div class="feature">{{ MAN_FEATURES[key] }}</div>
        <div class="score">{{ value.score }}</div>

        <div class="reason-label">总结：</div>
        <div class="reason">{{ value.reason }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MAN_FEATURES } from '@/utils/photoAnalyzer';

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
});

// 当前活动标签
</script>

<style lang="scss" scoped>
.score-result {
  padding: 10px;

  .score-content {
    .feature-item {
      display: flex;
      margin-bottom: 4px;
      white-space: nowrap;

      .feature {
        margin-right: 6px;
      }

      .reason-label {
        margin-left: 24px;
      }
    }
  }
}
</style>
