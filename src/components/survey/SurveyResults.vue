<template>
  <div class="survey-results">
    <h2>问卷已提交</h2>

    <div class="result-message">
      <div class="success-icon">✓</div>
      <p>感谢您完成问卷！您的回答已成功提交。</p>
      <p>系统已为您找到了几位潜在的匹配对象。</p>
    </div>

    <!-- 匹配结果展示 -->
    <!-- <div class="match-results" v-if="result.matches && result.matches.length">
      <h3>您的潜在匹配</h3>

      <div class="match-list">
        <div v-for="match in result.matches" :key="match.id" class="match-card">
          <div class="match-photo">
            <img :src="match.photo" alt="匹配照片" />
            <div class="compatibility">{{ match.compatibility }}%</div>
          </div>
          <div class="match-info">
            <h4>{{ match.name }}, {{ match.age }}岁</h4>
            <div class="match-traits">
              <span v-for="(trait, index) in match.traits" :key="index" class="trait-tag">
                {{ trait }}
              </span>
            </div>
            <p class="match-bio">{{ match.bio }}</p>
          </div>
        </div>
      </div>
    </div> -->

    <div class="result-actions">
      <button class="primary-button" @click="window.location.reload()">返回首页</button>
    </div>
  </div>
</template>

<script setup>
// 接收props
const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.survey-results {
  text-align: center;
  padding: 30px 0;

  h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 20px;
  }

  .result-message {
    margin-bottom: 40px;

    .success-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      margin: 0 auto 30px;
      background-color: #2ecc71;
      color: white;
      border-radius: 50%;
      font-size: 40px;
    }

    p {
      margin-bottom: 15px;
      color: #666;
      line-height: 1.6;
      font-size: 16px;
    }
  }

  .match-results {
    margin-bottom: 40px;

    h3 {
      font-size: 20px;
      margin-bottom: 30px;
      color: #333;
    }

    .match-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
      max-width: 900px;
      margin: 0 auto;

      .match-card {
        width: 300px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        background: white;
        text-align: left;

        .match-photo {
          position: relative;
          height: 200px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .compatibility {
            position: absolute;
            bottom: 10px;
            right: 10px;
            background-color: rgba(231, 76, 60, 0.9);
            color: white;
            font-weight: bold;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
          }
        }

        .match-info {
          padding: 16px;

          h4 {
            margin: 0 0 10px 0;
            font-size: 18px;
            color: #333;
          }

          .match-traits {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 12px;

            .trait-tag {
              background-color: #f8f9fa;
              padding: 4px 10px;
              border-radius: 16px;
              font-size: 12px;
              color: #666;
            }
          }

          .match-bio {
            margin: 0;
            font-size: 14px;
            color: #666;
            line-height: 1.5;
          }
        }
      }
    }
  }

  .result-actions {
    .primary-button {
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 500;
      min-width: 180px;
      display: inline-block;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #c0392b;
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.3);
      }
    }
  }
}
</style>
