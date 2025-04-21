<!-- src/components/PhotoUploader.vue -->
<template>
  <div class="photo-uploader">
    <h2>照片上传</h2>
    <div class="photo-container">
      <div class="photo-slot">
        <div class="photo-preview" v-if="facePhotoUrl">
          <img :src="facePhotoUrl" alt="面部照片" />
          <button class="delete-btn" @click="removeFacePhoto">×</button>
        </div>
        <div class="upload-btn" v-else @click="triggerFacePhotoUpload">
          <span>上传面部照片</span>
        </div>
        <input
          type="file"
          ref="facePhotoInput"
          accept="image/*"
          @change="onFacePhotoChange"
          style="display: none"
        />
      </div>

      <div class="photo-slot">
        <div class="photo-preview" v-if="bodyPhotoUrl">
          <img :src="bodyPhotoUrl" alt="全身照片" />
          <button class="delete-btn" @click="removeBodyPhoto">×</button>
        </div>
        <div class="upload-btn" v-else @click="triggerBodyPhotoUpload">
          <span>上传全身照片</span>
        </div>
        <input
          type="file"
          ref="bodyPhotoInput"
          accept="image/*"
          @change="onBodyPhotoChange"
          style="display: none"
        />
      </div>
    </div>

    <button
      class="analyze-btn"
      @click="analyzePhotos"
      :disabled="(!facePhoto && !bodyPhoto) || isAnalyzing"
    >
      {{ isAnalyzing ? '分析中...' : '开始分析' }}
    </button>

    <div class="error-message" v-if="errorMessage">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PhotoFeatureScorer from '../utils/photoAnalyzer';

// 状态变量
const facePhoto = ref(null);
const bodyPhoto = ref(null);
const facePhotoUrl = ref('');
const bodyPhotoUrl = ref('');
const facePhotoInput = ref(null);
const bodyPhotoInput = ref(null);
const errorMessage = ref('');
const isAnalyzing = ref(false);

// 定义输出事件
const emit = defineEmits(['analysis-complete', 'analysis-error']);

// 触发文件选择
const triggerFacePhotoUpload = () => {
  facePhotoInput.value.click();
};

const triggerBodyPhotoUpload = () => {
  bodyPhotoInput.value.click();
};

// 处理面部照片选择
const onFacePhotoChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.match('image.*')) {
    errorMessage.value = '请选择图片文件';
    return;
  }

  facePhoto.value = file;
  facePhotoUrl.value = URL.createObjectURL(file);
  errorMessage.value = '';
};

// 处理全身照片选择
const onBodyPhotoChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.match('image.*')) {
    errorMessage.value = '请选择图片文件';
    return;
  }

  bodyPhoto.value = file;
  bodyPhotoUrl.value = URL.createObjectURL(file);
  errorMessage.value = '';
};

// 移除照片
const removeFacePhoto = () => {
  facePhoto.value = null;
  facePhotoUrl.value = '';
  if (facePhotoInput.value) {
    facePhotoInput.value.value = '';
  }
};

const removeBodyPhoto = () => {
  bodyPhoto.value = null;
  bodyPhotoUrl.value = '';
  if (bodyPhotoInput.value) {
    bodyPhotoInput.value.value = '';
  }
};

// 分析照片
const analyzePhotos = async () => {
  if (!facePhoto.value && !bodyPhoto.value) {
    errorMessage.value = '请至少上传一张照片';
    return;
  }

  errorMessage.value = '';
  isAnalyzing.value = true;

  try {
    const scorer = new PhotoFeatureScorer();
    const result = await scorer.scorePhotos(facePhoto.value, bodyPhoto.value);
    emit('analysis-complete', result);
  } catch (error) {
    console.error('分析失败:', error);
    errorMessage.value = `分析失败: ${error.message}`;
    emit('analysis-error', error);
  } finally {
    isAnalyzing.value = false;
  }
};
</script>

<style lang="scss" scoped>
.photo-uploader {
  padding: 10px;

  h2 {
    text-align: center;
    margin-bottom: 15px;
  }

  .photo-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    .photo-slot {
      width: 48%;
      height: 180px;

      .photo-preview {
        width: 100%;
        height: 100%;
        position: relative;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: 1px solid #ddd;
        }

        .delete-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 20px;
          height: 20px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          cursor: pointer;
        }
      }

      .upload-btn {
        width: 100%;
        height: 100%;
        border: 1px dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: #f9f9f9;
      }
    }
  }

  .analyze-btn {
    display: block;
    width: 200px;
    margin: 0 auto;
    padding: 8px;
    background: #4a90e2;
    color: white;
    border: none;
    cursor: pointer;

    &:disabled {
      background: #ccc;
    }
  }

  .error-message {
    color: red;
    text-align: center;
    margin-top: 10px;
  }
}
</style>
