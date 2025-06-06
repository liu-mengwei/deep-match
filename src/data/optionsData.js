/**
 * 统一的选项数据配置文件
 * 直接从 surveyData.js 导入，确保数据一致性
 */
import surveyData from './surveyData';

// 辅助函数：将选项数组转换为对象格式 {value: label}
function optionsToObject(optionsArray) {
  return optionsArray.reduce((obj, option) => {
    obj[option.value] = option.label;
    return obj;
  }, {});
}

// 从surveyData中获取教育程度选项
const educationSection = surveyData.sections.find(section =>
  section.questions.some(q => q.id === 'education')
);
const educationQuestion = educationSection.questions.find(q => q.id === 'education');
export const educationOptions = optionsToObject(educationQuestion.options);

// 从surveyData中获取收入选项
const incomeSection = surveyData.sections.find(section =>
  section.questions.some(q => q.id === 'income')
);
const incomeQuestion = incomeSection.questions.find(q => q.id === 'income');
export const incomeOptions = optionsToObject(incomeQuestion.options);

// 筛选用收入选项 - 使用阶梯式下限值
export const incomeFilterOptions = {
  'any': '不限',
  'above_5k': '5000元以上/月',
  'above_10k': '1万元以上/月',
  'above_20k': '2万元以上/月',
  'above_30k': '3万元以上/月',
};

// 婚姻状况偏好选项
export const acceptDivorcedOptions = {
  'single_only': '仅接受未婚',
  'accept_no_children': '接受离异无子女',
  'accept_with_children': '接受离异有子女',
  'any': '不限婚姻状况',
};

// 从surveyData中获取吸烟习惯选项
const smokingSection = surveyData.sections.find(section =>
  section.questions.some(q => q.id === 'smoking')
);
const smokingQuestion = smokingSection.questions.find(q => q.id === 'smoking');
export const smokingOptions = optionsToObject(smokingQuestion.options);

// 对伴侣吸烟习惯的接受度
export const acceptSmokingOptions = {
  'never_only': '不接受吸烟',
  'accept_occasionally': '接受偶尔吸烟',
  'accept_all': '接受任何吸烟习惯',
};

// 从surveyData中获取饮酒习惯选项
const drinkingSection = surveyData.sections.find(section =>
  section.questions.some(q => q.id === 'drinking')
);
const drinkingQuestion = drinkingSection.questions.find(q => q.id === 'drinking');
export const drinkingOptions = optionsToObject(drinkingQuestion.options);

// 对伴侣饮酒习惯的接受度
export const acceptDrinkingOptions = {
  'never_only': '不接受饮酒',
  'accept_socially': '只接受社交场合饮酒',
  'accept_moderately': '接受适量饮酒',
  'accept_all': '不介意饮酒习惯',
};

// 从surveyData中获取宠物选项
const petSection = surveyData.sections.find(section =>
  section.questions.some(q => q.id === 'has_pets')
);
const petQuestion = petSection.questions.find(q => q.id === 'has_pets');
export const petOptions = optionsToObject(petQuestion.options);

// 对伴侣养宠物的接受度
export const acceptPetOptions = {
  'no_pets': '不接受养宠物',
  'accept_cats': '接受养猫',
  'accept_dogs': '接受养狗',
  'accept_all': '接受任何宠物',
};

// 从surveyData中获取作息习惯选项
const sleepSection = surveyData.sections.find(section =>
  section.questions.some(q => q.id === 'sleep_schedule')
);
const sleepQuestion = sleepSection.questions.find(q => q.id === 'sleep_schedule');
export const sleepOptions = optionsToObject(sleepQuestion.options);

// 对伴侣作息习惯的接受度
export const acceptSleepOptions = {
  'same_as_me': '希望与我相同',
  'early_riser': '希望是早起型',
  'night_owl': '希望是夜猫子型',
  'any': '不介意作息习惯',
};

export default {
  educationOptions,
  incomeOptions,
  incomeFilterOptions,
  acceptDivorcedOptions,
  smokingOptions,
  acceptSmokingOptions,
  drinkingOptions,
  acceptDrinkingOptions,
  petOptions,
  acceptPetOptions,
  sleepOptions,
  acceptSleepOptions
};
