import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocossd from '@tensorflow-models/coco-ssd';

class AIRecognition {
  constructor() {
    this.mobilenetModel = null;
    this.cocoModel = null;
    this.isInitialized = false;
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
        this.mobilenetModel.classify(imageElement, 5), // 前5个结果
        this.cocoModel.detect(imageElement, 10) // 最多10个物体
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

  // 生成标签建议
  generateTagsFromResults(results) {
    const tags = new Set();
    
    // 从分类结果提取标签
    if (results.classification) {
      results.classification.forEach(pred => {
        // 处理分类名称，如 "Labrador retriever" -> ["labrador", "retriever"]
        const className = pred.className.toLowerCase();
        const words = className.split(/[, ]+/);
        
        words.forEach(word => {
          if (word.length > 2 && !this.isCommonWord(word)) {
            tags.add(word);
          }
        });
        
        // 添加完整分类名称（如果不太长）
        if (className.length <= 20) {
          tags.add(className.replace(/,/g, ''));
        }
      });
    }
    
    // 从物体检测结果提取标签
    if (results.objectDetection) {
      results.objectDetection.forEach(obj => {
        const className = obj.class.toLowerCase();
        if (obj.score > 0.5) { // 只使用置信度高的结果
          tags.add(className);
        }
      });
    }
    
    return Array.from(tags).slice(0, 15); // 最多返回15个标签
  }

  // 生成名称建议
  generateNameFromResults(results) {
    const classifications = results.classification || [];
    const objects = results.objectDetection || [];
    
    if (classifications.length === 0 && objects.length === 0) {
      return '精美壁纸';
    }
    
    // 使用置信度最高的分类
    const topClassification = classifications[0];
    const topObjects = objects.filter(obj => obj.score > 0.7).slice(0, 2);
    
    let name = '';
    
    if (topClassification && topClassification.probability > 0.5) {
      const className = topClassification.className.split(',')[0]; // 取主要分类
      name = this.formatClassName(className);
    } else if (topObjects.length > 0) {
      // 使用检测到的物体构建名称
      const objectNames = topObjects.map(obj => 
        this.formatClassName(obj.class)
      );
      name = objectNames.join('与') + '场景';
    } else {
      name = '精美壁纸';
    }
    
    return name;
  }

  // 辅助方法：格式化分类名称
  formatClassName(className) {
    return className
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/,/g, '')
      .trim();
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