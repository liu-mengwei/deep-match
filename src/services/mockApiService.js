/**
 * Mock API 服务
 * 使用 localStorage 模拟后端数据存储
 */

// 模拟API延迟 (200-800ms)
const mockDelay = () =>
  new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 600) + 200;
    setTimeout(resolve, delay);
  });

// 模拟的用户信息
const MOCK_USER = {
  id: 'user_1',
  username: '测试用户',
  email: 'test@example.com',
};

// 生成伪随机ID
const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

// Mock API 服务
export const mockApiService = {
  /**
   * 获取当前登录用户
   */
  async getCurrentUser() {
    await mockDelay();
    return { ...MOCK_USER };
  },

  /**
   * 获取问卷草稿
   */
  async getSurveyDraft() {
    await mockDelay();
    const draftData = localStorage.getItem('surveyDraft');
    return draftData ? JSON.parse(draftData) : null;
  },

  /**
   * 保存问卷草稿
   */
  async saveSurveyDraft(data) {
    await mockDelay();
    const draftData = {
      id: generateId(),
      userId: MOCK_USER.id,
      answers: data.answers || {},
      weights: data.weights || {},
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('surveyDraft', JSON.stringify(draftData));
    return draftData;
  },

  /**
   * 删除问卷草稿
   */
  async deleteSurveyDraft() {
    await mockDelay();
    localStorage.removeItem('surveyDraft');
    return { success: true };
  },

  /**
   * 提交问卷
   */
  async submitSurvey(data) {
    await mockDelay();

    // 保存提交的问卷
    const submittedData = {
      id: generateId(),
      userId: MOCK_USER.id,
      answers: data.answers,
      weights: data.weights,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem('submittedSurvey', JSON.stringify(submittedData));

    // 删除草稿
    localStorage.removeItem('surveyDraft');

    // 生成模拟的匹配结果
    const mockMatches = generateMockMatches();

    return {
      success: true,
      surveyId: submittedData.id,
      matches: mockMatches,
    };
  },

  /**
   * 获取已提交的问卷
   */
  async getSubmittedSurvey() {
    await mockDelay();
    const surveyData = localStorage.getItem('submittedSurvey');
    return surveyData ? JSON.parse(surveyData) : null;
  },
};

/**
 * 生成模拟的匹配结果
 */
function generateMockMatches() {
  const mockProfiles = [
    {
      id: generateId(),
      name: '张小姐',
      age: 28,
      compatibility: 92,
      photo: 'https://randomuser.me/api/portraits/women/32.jpg',
      traits: ['温柔', '善良', '有爱心'],
      bio: '喜欢旅行和读书的设计师，希望找到一个志同道合的伴侣',
    },
    {
      id: generateId(),
      name: '王先生',
      age: 30,
      compatibility: 87,
      photo: 'https://randomuser.me/api/portraits/men/45.jpg',
      traits: ['幽默', '踏实', '上进'],
      bio: '金融行业工作者，工作稳定，喜欢健身和烹饪',
    },
    {
      id: generateId(),
      name: '李小姐',
      age: 26,
      compatibility: 84,
      photo: 'https://randomuser.me/api/portraits/women/68.jpg',
      traits: ['活泼', '开朗', '独立'],
      bio: '软件工程师，热爱技术和创新，希望找到能一起成长的另一半',
    },
  ];

  return mockProfiles;
}

export default mockApiService;
