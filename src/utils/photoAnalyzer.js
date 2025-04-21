// src/services/photoAnalyzer.js
import axios from 'axios';

const API_KEY = '8e62b860-ccc8-4478-8026-45a330ff69af';
const MODEL_API = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const MODEL_NAME = 'doubao-1.5-vision-pro-250328';

/**
 * 照片特征评分API封装
 */
export default class PhotoFeatureScorer {
  constructor(apiKey) {
    this.apiKey = apiKey || API_KEY; // 实际使用时替换为环境变量
    this.apiEndpoint = MODEL_API;
    this.modelName = MODEL_NAME;
  }

  /**
   * 分析照片并生成30维度评分
   */
  async scorePhotos(facePhoto, bodyPhoto) {
    try {
      // 将文件转换为base64
      const facePhotoBase64 = facePhoto ? await this._fileToBase64(facePhoto) : null;
      const bodyPhotoBase64 = bodyPhoto ? await this._fileToBase64(bodyPhoto) : null;

      if (!facePhotoBase64 && !bodyPhotoBase64) {
        throw new Error('至少需要提供一张照片');
      }

      // 准备图片内容
      const photoContents = [];
      if (facePhotoBase64) {
        photoContents.push({
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${facePhotoBase64}` },
        });
      }

      if (bodyPhotoBase64) {
        photoContents.push({
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${bodyPhotoBase64}` },
        });
      }

      // 构建API请求内容
      const requestData = {
        model: this.modelName,
        messages: [
          {
            role: 'user',
            content: [{ type: 'text', text: this._buildFemalePrompt() }, ...photoContents],
          },
        ],
        max_tokens: 3000,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      };

      // 调用API
      const response = await axios.post(this.apiEndpoint, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const parsedResult = JSON.parse(response.data.choices[0].message.content);

      console.log(parsedResult, 'parsedResult');
      return parsedResult;
    } catch (error) {
      console.error('照片评分失败:', error);
      if (error.response) {
        throw new Error(`API错误: ${error.response.data.error?.message || '服务器错误'}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * 将文件转换为Base64
   * @private
   */
  async _fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * 构建女性用户提示词
   * @private
   */
  _buildFemalePrompt() {
    return `从青年女性择偶的角度来看，从以下7个维度对照片中人物进行1-10分的评分。 
    脸型
    身材
    整洁清爽度
    年轻度
    活力度
    温柔度
    成熟度

    评分要求:  
    分数应该有分化，比如吴彦祖普遍各个维度分数会高一些，比如会拿到9-10分。而赵本山相对得分要低一些，比如会拿到2-3分。
    如果判断不了或者比较模糊，则打5分。
    需要列举出这么打分的理由。
    保留1位小数。

    以JSON格式返回结果，示例如下:  
    {  
      "Faceshape": {"score": "7.5", "reason": "较为标准的脸型"},  
      "Physique": {"score": "4.2", "reason": "普通身材，无明显优势或劣势"},  
      "Fresh": {"score": "8.0", "reason": "干净整洁，但无特别突出的帅气特征"},  
      "Youthfulness": {"score": "7.1", "reason": "看起来较为年轻"},  
      "Vitality": {"score": "7.5", "reason": "有一定成熟感，但不强烈"},  
      "Gentleness": {"score": "5.4", "reason": "无明显活力表现"},  
      "Maturity": {"score": "5.2", "reason": "面相温和"}  
    }  `;
  }
}

export const MAN_FEATURES = {
  Faceshape: '脸型',
  Physique: '身材',
  Fresh: '整洁清爽度',
  Youthfulness: '年轻度',
  Vitality: '活力度',
  Gentleness: '温柔度',
  Maturity: '成熟度',
};
