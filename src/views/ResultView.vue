<template>
  <div class="result-container">
    <div class="result-wrapper">
      <div class="result-header">
        <h1 class="result-title">您的性格特质分析</h1>

        <!-- 总结 -->
        <div class="summary-section">
          <h2 class="section-title">核心特质概述</h2>
          <p class="summary-text">
            {{ result.summary }}
          </p>

          <div class="tags-container">
            <span v-for="(tag, index) in result.tags" :key="index" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- 维度图表 -->
        <div class="dimensions-section">
          <h2 class="section-title">性格维度得分</h2>
          <div class="dimensions-grid">
            <div v-for="dimension in result.dimensions" :key="dimension.id" class="dimension-card">
              <div class="dimension-header">
                <span class="dimension-name">{{ dimension.name }}</span>
                <span class="dimension-score">{{ dimension.score }}/10</span>
              </div>
              <div class="score-bar-container">
                <div
                  class="score-bar-fill"
                  :style="`width: ${dimension.score * 10}%`"
                  :class="getDimensionColorClass(dimension.score)"
                ></div>
              </div>
              <p class="dimension-description">{{ dimension.description }}</p>
            </div>
          </div>
        </div>

        <!-- 详细分析 -->
        <div class="traits-section">
          <h2 class="section-title">详细特质解读</h2>
          <div class="traits-list">
            <div v-for="(trait, index) in result.detailedTraits" :key="index" class="trait-card">
              <h3 class="trait-title">{{ trait.title }}</h3>
              <p class="trait-description">{{ trait.description }}</p>
            </div>
          </div>
        </div>

        <!-- 匹配建议 -->
        <div class="matching-section">
          <h2 class="section-title">匹配建议</h2>
          <div class="matching-card">
            <p class="matching-intro">基于您的性格特质，以下类型的伴侣可能与您更加匹配：</p>
            <ul class="matching-list">
              <li v-for="(suggestion, index) in result.matchingSuggestions" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button @click="retakeQuestionnaire" class="button button-secondary">重新测评</button>
        <button @click="shareResults" class="button button-primary">分享结果</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// import { getResultById } from '../services/api';

const route = useRoute();
const router = useRouter();
const result = ref({
  summary: '',
  tags: [],
  dimensions: [],
  detailedTraits: [],
  matchingSuggestions: [],
});
const isLoading = ref(true);

onMounted(async () => {
  try {
    // 首先尝试从路由状态获取数据
    if (history.state && history.state.result) {
      result.value = history.state.result;
      isLoading.value = false;
      return;
    }

    // 否则从API获取
    // const resultId = route.params.id;
    // if (resultId) {
    //   const data = await getResultById(resultId);
    //   result.value = data;
    // }
  } catch (error) {
    console.error('获取结果失败:', error);
  } finally {
    isLoading.value = false;
  }
});

const getDimensionColorClass = (score) => {
  if (score <= 3) return 'score-low';
  if (score <= 5) return 'score-medium-low';
  if (score <= 7) return 'score-medium-high';
  return 'score-high';
};

const retakeQuestionnaire = () => {
  router.push({ name: 'questions' });
};

const shareResults = () => {
  // 实现分享功能
  alert('分享功能开发中...');
};
</script>

<style scoped lang="scss">
@use '../assets/scss/variables' as *;

.result-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-8 $spacing-4;
}

.result-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.result-header {
  background-color: $white;
  padding: $spacing-6;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
  margin-bottom: $spacing-6;
}

.result-title {
  font-size: $font-size-2xl;
  font-weight: 700;
  text-align: center;
  margin-bottom: $spacing-6;
}

.section-title {
  font-size: $font-size-xl;
  font-weight: 500;
  margin-bottom: $spacing-4;
  padding-bottom: $spacing-2;
  border-bottom: 1px solid $gray-200;
}

// 总结部分
.summary-section {
  margin-bottom: $spacing-8;
}

.summary-text {
  color: $gray-700;
  line-height: 1.6;
  margin-bottom: $spacing-4;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  margin-bottom: $spacing-6;
}

.tag {
  padding: $spacing-1 $spacing-3;
  background-color: rgba($primary-color, 0.1);
  color: $primary-dark;
  border-radius: $border-radius-full;
  font-size: $font-size-sm;
  font-weight: 500;
}

// 维度得分部分
.dimensions-section {
  margin-bottom: $spacing-10;
}

.dimensions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-4;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.dimension-card {
  background-color: $gray-100;
  padding: $spacing-4;
  border-radius: $border-radius-lg;
}

.dimension-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: $spacing-1;
}

.dimension-name {
  font-weight: 500;
}

.dimension-score {
  color: $primary-color;
  font-weight: 700;
}

.score-bar-container {
  width: 100%;
  height: 8px;
  background-color: $gray-200;
  border-radius: $border-radius-full;
  margin-bottom: $spacing-2;
}

.score-bar-fill {
  height: 100%;
  border-radius: $border-radius-full;

  &.score-low {
    background-color: $primary-light;
  }

  &.score-medium-low {
    background-color: rgba($primary-color, 0.6);
  }

  &.score-medium-high {
    background-color: $primary-color;
  }

  &.score-high {
    background-color: $primary-dark;
  }
}

.dimension-description {
  font-size: $font-size-sm;
  color: $gray-600;
}

// 特质解读部分
.traits-section {
  margin-bottom: $spacing-8;
}

.traits-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-6;
}

.trait-card {
  background-color: $gray-100;
  padding: $spacing-4;
  border-radius: $border-radius-lg;
}

.trait-title {
  font-weight: 500;
  font-size: $font-size-lg;
  margin-bottom: $spacing-2;
}

.trait-description {
  color: $gray-700;
}

// 匹配建议部分
.matching-section {
  margin-top: $spacing-8;
}

.matching-card {
  background-color: rgba($primary-color, 0.05);
  padding: $spacing-4;
  border-radius: $border-radius-lg;
}

.matching-intro {
  color: $gray-700;
  margin-bottom: $spacing-3;
}

.matching-list {
  list-style-type: disc;
  padding-left: $spacing-6;

  li {
    margin-bottom: $spacing-2;
    color: $gray-700;
  }
}

// 底部操作按钮
.action-buttons {
  display: flex;
  justify-content: center;
  gap: $spacing-4;
}

.button {
  padding: $spacing-2 $spacing-6;
  border-radius: $border-radius-md;
  font-weight: 500;
  cursor: pointer;
  transition: $transition-base;

  &.button-primary {
    background-color: $primary-color;
    color: $white;
    border: none;

    &:hover {
      background-color: $primary-dark;
    }
  }

  &.button-secondary {
    background-color: $white;
    color: $primary-color;
    border: 1px solid $primary-color;

    &:hover {
      background-color: rgba($primary-color, 0.05);
    }
  }
}
</style>
