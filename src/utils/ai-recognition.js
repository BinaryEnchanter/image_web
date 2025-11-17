import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocossd from '@tensorflow-models/coco-ssd';

class AIRecognition {
  constructor() {
    this.mobilenetModel = null;
    this.cocoModel = null;
    this.isInitialized = false;
    
    // 缓存已翻译的词汇
    this.translationCache = new Map();
    
    // 大幅扩展的本地映射
    this.simpleMapping = {
      // 动物类 - 大量扩展
      'dog': '狗', 'puppy': '小狗', 'cat': '猫', 'kitten': '小猫', 'bird': '鸟',
      'horse': '马', 'cow': '牛', 'sheep': '羊', 'elephant': '大象', 'bear': '熊',
      'zebra': '斑马', 'giraffe': '长颈鹿', 'lion': '狮子', 'tiger': '老虎',
      'leopard': '豹子', 'panda': '熊猫', 'monkey': '猴子', 'kangaroo': '袋鼠',
      'wolf': '狼', 'fox': '狐狸', 'rabbit': '兔子', 'squirrel': '松鼠',
      'deer': '鹿', 'fish': '鱼', 'shark': '鲨鱼', 'whale': '鲸鱼',
      'dolphin': '海豚', 'turtle': '乌龟', 'snake': '蛇', 'frog': '青蛙',
      'butterfly': '蝴蝶', 'bee': '蜜蜂', 'spider': '蜘蛛', 'ant': '蚂蚁',
      'eagle': '鹰', 'owl': '猫头鹰', 'penguin': '企鹅', 'duck': '鸭子',
      'chicken': '鸡', 'pig': '猪', 'goat': '山羊', 'camel': '骆驼',

      // 交通工具 - 扩展
      'car': '汽车', 'bus': '公交车', 'truck': '卡车', 'motorcycle': '摩托车',
      'bicycle': '自行车', 'airplane': '飞机', 'helicopter': '直升机',
      'train': '火车', 'ship': '轮船', 'boat': '小船', 'submarine': '潜艇',
      'vehicle': '车辆', 'ambulance': '救护车', 'fire truck': '消防车',
      'scooter': '滑板车', 'taxi': '出租车', 'van': '货车',

      // 人物 - 扩展
      'person': '人物', 'man': '男人', 'woman': '女人', 'child': '儿童',
      'baby': '婴儿', 'people': '人群', 'boy': '男孩', 'girl': '女孩',
      'human': '人类', 'face': '人脸', 'portrait': '肖像',

      // 自然景观 - 大量扩展
      'tree': '树', 'forest': '森林', 'flower': '花', 'rose': '玫瑰',
      'sunflower': '向日葵', 'grass': '草地', 'leaf': '树叶', 'plant': '植物',
      'mountain': '山', 'hill': '丘陵', 'valley': '山谷', 'volcano': '火山',
      'sea': '大海', 'ocean': '海洋', 'river': '河流', 'lake': '湖泊',
      'waterfall': '瀑布', 'beach': '海滩', 'desert': '沙漠', 'island': '岛屿',
      'sky': '天空', 'cloud': '云', 'sun': '太阳', 'moon': '月亮',
      'star': '星星', 'rainbow': '彩虹', 'snow': '雪', 'rain': '雨',
      'storm': '风暴', 'lightning': '闪电', 'wind': '风', 'fog': '雾',

      // 建筑 - 扩展
      'building': '建筑', 'house': '房屋', 'castle': '城堡', 'bridge': '桥梁',
      'tower': '塔', 'skyscraper': '摩天大楼', 'church': '教堂',
      'temple': '寺庙', 'school': '学校', 'hospital': '医院',
      'home': '家', 'apartment': '公寓', 'office': '办公室', 'hotel': '酒店',

      // 食物 - 扩展
      'food': '食物', 'fruit': '水果', 'apple': '苹果', 'banana': '香蕉',
      'orange': '橙子', 'strawberry': '草莓', 'grape': '葡萄', 'watermelon': '西瓜',
      'pizza': '披萨', 'hamburger': '汉堡', 'cake': '蛋糕', 'bread': '面包',
      'ice cream': '冰淇淋', 'coffee': '咖啡', 'tea': '茶', 'wine': '葡萄酒',
      'rice': '米饭', 'noodle': '面条', 'soup': '汤', 'salad': '沙拉',

      // 物品 - 大量扩展
      'book': '书籍', 'computer': '电脑', 'phone': '手机', 'camera': '相机',
      'clock': '时钟', 'chair': '椅子', 'table': '桌子', 'bed': '床',
      'sofa': '沙发', 'lamp': '台灯', 'window': '窗户', 'door': '门',
      'keyboard': '键盘', 'mouse': '鼠标', 'screen': '屏幕', 'tv': '电视',
      'glass': '玻璃', 'bottle': '瓶子', 'cup': '杯子', 'plate': '盘子',

      // 颜色和风格 - 扩展
      'red': '红色', 'blue': '蓝色', 'green': '绿色', 'yellow': '黄色',
      'black': '黑色', 'white': '白色', 'gold': '金色', 'silver': '银色',
      'abstract': '抽象', 'minimal': '极简', 'vintage': '复古',
      'modern': '现代', 'classic': '经典', 'art': '艺术', 'design': '设计',
      'pattern': '图案', 'texture': '纹理', 'colorful': '多彩', 'bright': '明亮',

      // 其他常见类别
      'sports': '运动', 'music': '音乐', 'game': '游戏', 'movie': '电影',
      'nature': '自然', 'urban': '都市', 'rural': '乡村', 'night': '夜晚',
      'day': '白天', 'summer': '夏天', 'winter': '冬天', 'spring': '春天',
      'autumn': '秋天', 'water': '水', 'fire': '火', 'earth': '土地'
    };
  }

  // 初始化模型
  async init() {
    try {
      console.log('正在加载AI模型...');
      
      // 并行加载两个模型
      const [mobilenetModel, cocoModel] = await Promise.all([
        mobilenet.load(),
        cocossd.load()
      ]);
      
      this.mobilenetModel = mobilenetModel;
      this.cocoModel = cocoModel;
      this.isInitialized = true;
      
      console.log('AI模型加载完成');
      return true;
    } catch (error) {
      console.error('AI模型加载失败:', error);
      return false;
    }
  }

  // 从图片元素进行识别
  async recognize(imageElement) {
    if (!this.isInitialized) {
      const initialized = await this.init();
      if (!initialized) {
        throw new Error('AI模型初始化失败');
      }
    }

    try {
      // 使用两个模型并行识别
      const [mobilenetPredictions, cocoPredictions] = await Promise.all([
        this.mobilenetModel.classify(imageElement, 10), // 增加到10个结果
        this.cocoModel.detect(imageElement, 15) // 增加到15个物体
      ]);

      return {
        classification: mobilenetPredictions,
        objectDetection: cocoPredictions
      };
    } catch (error) {
      console.error('AI识别失败:', error);
      throw error;
    }
  }

  // 从文件进行识别
  async recognizeFromFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = async () => {
        try {
          const results = await this.recognize(img);
          URL.revokeObjectURL(url);
          resolve(results);
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('图片加载失败'));
      };
      
      img.src = url;
    });
  }

  // 使用免费的 MyMemory 翻译API
  async translateWithFreeAPI(text) {
    const lowerText = text.toLowerCase().trim();
    
    // 检查缓存
    if (this.translationCache.has(lowerText)) {
      return this.translationCache.get(lowerText);
    }
    
    // 首先检查简单映射
    if (this.simpleMapping[lowerText]) {
      this.translationCache.set(lowerText, this.simpleMapping[lowerText]);
      return this.simpleMapping[lowerText];
    }

    try {
      console.log(`正在翻译: ${text}`);
      
      const response = await fetch(
        `https://api.mymemory.translated.net/get?` +
        `q=${encodeURIComponent(text)}&` +
        `langpair=en|zh`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.responseData && data.responseData.translatedText) {
        let translated = data.responseData.translatedText;
        
        // 清理翻译结果
        translated = translated.replace(/\([^)]*\)/g, '').trim();
        translated = translated.split(/[,.，。]/)[0].trim();
        
        console.log(`翻译结果: ${text} -> ${translated}`);
        
        // 缓存结果
        this.translationCache.set(lowerText, translated);
        return translated;
      } else {
        console.warn('翻译API返回格式异常，使用本地映射或原文本:', data);
        // 尝试使用部分匹配
        for (const [key, value] of Object.entries(this.simpleMapping)) {
          if (lowerText.includes(key)) {
            return value;
          }
        }
        return text;
      }
    } catch (error) {
      console.warn('免费翻译API失败，使用本地映射或原文本:', error.message);
      // 尝试使用部分匹配
      for (const [key, value] of Object.entries(this.simpleMapping)) {
        if (lowerText.includes(key)) {
          return value;
        }
      }
      return text;
    }
  }

  // 智能翻译方法
  async translateToChinese(englishLabel) {
    let cleanLabel = englishLabel.toLowerCase().trim();
    
    // 移除常见修饰词
    const modifiers = ['a ', 'the ', 'an ', 'in ', 'on ', 'at ', 'with ', 'of ', 'and '];
    modifiers.forEach(mod => {
      if (cleanLabel.startsWith(mod)) {
        cleanLabel = cleanLabel.slice(mod.length);
      }
    });
    
    return await this.translateWithFreeAPI(cleanLabel);
  }

  // 改进的标签生成方法 - 大幅增加标签数量
  async generateTagsFromResults(results) {
    const allTags = new Set();
    
    console.log('原始识别结果:', results);
    
    // 从分类结果提取标签 - 大幅降低阈值
    if (results.classification) {
      results.classification.forEach(pred => {
        // 大幅降低概率阈值，从0.3降到0.05
        if (pred.probability > 0.05) {
          const className = pred.className.toLowerCase();
          console.log(`处理分类: ${className}, 概率: ${pred.probability}`);
          
          // 1. 添加主要分类
          const mainClass = className.split(',')[0].trim();
          if (mainClass && mainClass.length > 1) { // 降低长度要求
            allTags.add(mainClass);
          }
          
          // 2. 分解复合词并添加
          const words = className.split(/[, ]+/);
          words.forEach(word => {
            const cleanWord = word.trim();
            if (cleanWord.length > 1 && !this.isCommonWord(cleanWord)) { // 降低长度要求
              allTags.add(cleanWord);
            }
          });
          
          // 3. 添加完整分类（去除逗号）
          const fullClass = className.replace(/,/g, ' ').trim();
          if (fullClass.length > 3) {
            allTags.add(fullClass);
          }
        }
      });
    }
    
    // 从物体检测结果提取标签 - 大幅降低阈值
    if (results.objectDetection) {
      results.objectDetection.forEach(obj => {
        // 大幅降低置信度阈值，从0.5降到0.2
        if (obj.score > 0.2) {
          const className = obj.class.toLowerCase();
          console.log(`处理物体: ${className}, 置信度: ${obj.score}`);
          
          if (className && className.length > 1) { // 降低长度要求
            allTags.add(className);
          }
        }
      });
    }
    
    const englishTagsArray = Array.from(allTags);
    console.log('收集到的英文标签:', englishTagsArray);
    
    // 批量翻译所有标签 - 更宽松的条件
    const chineseTags = new Set();
    
    for (const tag of englishTagsArray) {
      try {
        const translated = await this.translateToChinese(tag);
        
        // 更宽松的验证条件
        if (translated && translated.length >= 1) { // 从2降到1
          // 接受任何非空的翻译结果
          chineseTags.add(translated);
        } else {
          // 即使翻译失败，也保留原标签
          chineseTags.add(tag);
        }
      } catch (error) {
        console.warn(`翻译标签失败 ${tag}:`, error);
        // 翻译失败时保留原标签
        chineseTags.add(tag);
      }
    }
    
    let finalTags = Array.from(chineseTags);
    console.log('翻译后的标签:', finalTags);
    
    // 如果标签数量仍然不足，添加智能补充标签
    if (finalTags.length < 8) {
      console.log('标签数量不足，添加补充标签');
      const supplementalTags = this.generateSupplementalTags(results, finalTags);
      finalTags = [...finalTags, ...supplementalTags];
    }
    
    // 确保有足够数量的标签
    if (finalTags.length < 5) {
      const genericTags = ['壁纸', '背景', '图片', '主题', '风格', '设计', '艺术', '精美', '优质', '高清'];
      genericTags.forEach(tag => {
        if (finalTags.length < 15) {
          finalTags.push(tag);
        }
      });
    }
    
    console.log('最终标签数量:', finalTags.length);
    return finalTags.slice(0, 15); // 返回最多15个标签
  }

  // 生成补充标签
  generateSupplementalTags(results, existingTags) {
    const supplemental = new Set();
    
    // 基于已有标签生成相关标签
    existingTags.forEach(tag => {
      if (tag.includes('狗') || tag.includes('猫') || tag.includes('动物')) {
        supplemental.add('宠物').add('可爱').add('毛茸茸');
      }
      if (tag.includes('汽车') || tag.includes('车辆')) {
        supplemental.add('交通').add('速度').add('现代');
      }
      if (tag.includes('山') || tag.includes('海') || tag.includes('天空')) {
        supplemental.add('自然').add('风景').add('户外');
      }
      if (tag.includes('建筑') || tag.includes('城市')) {
        supplemental.add('都市').add('现代').add('结构');
      }
      if (tag.includes('人物') || tag.includes('人')) {
        supplemental.add('肖像').add('人文').add('生活');
      }
    });
    

    
    return Array.from(supplemental);
  }

  // 生成中文名称建议
  async generateNameFromResults(results) {
    const classifications = results.classification || [];
    const objects = results.objectDetection || [];
    
    if (classifications.length === 0 && objects.length === 0) {
      return '精美壁纸';
    }
    
    // 使用置信度最高的分类
    const topClassification = classifications[0];
    const topObjects = objects.filter(obj => obj.score > 0.5).slice(0, 3); // 增加到3个物体
    
    let nameParts = [];
    
    if (topClassification && topClassification.probability > 0.3) { // 降低阈值
      const className = topClassification.className.split(',')[0];
      const chineseName = await this.translateToChinese(className);
      if (chineseName && chineseName !== className) {
        nameParts.push(chineseName);
      }
    }
    
    // 使用检测到的物体构建名称
    if (topObjects.length > 0) {
      for (const obj of topObjects) {
        const chineseObj = await this.translateToChinese(obj.class);
        if (chineseObj && chineseObj !== obj.class && !nameParts.includes(chineseObj)) {
          nameParts.push(chineseObj);
          if (nameParts.length >= 2) break; // 最多使用2个物体
        }
      }
    }
    
    let name = '';
    if (nameParts.length === 1) {
      name = `${nameParts[0]}`;
    } else if (nameParts.length >= 2) {
      name = `${nameParts.join('与')}`;
    } else {
      // 如果无法生成具体名称，使用通用但更有吸引力的名称
      name = this.generateAttractiveName(results);
    }
    
    return name;
  }

  // 生成有吸引力的名称
  generateAttractiveName(results) {
    const names = [
      '精美艺术壁纸', '优质背景图片', '特色主题壁纸', 
      '视觉盛宴壁纸', '独特风格背景', '艺术设计壁纸',
      '高清优质壁纸', '创意背景图片', '视觉艺术壁纸'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  // 辅助方法：过滤常见词汇
  isCommonWord(word) {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must'
    ]);
    return commonWords.has(word.toLowerCase());
  }
}

// 创建单例实例
const aiRecognition = new AIRecognition();

export default aiRecognition;