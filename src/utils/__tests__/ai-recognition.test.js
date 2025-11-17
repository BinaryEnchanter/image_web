import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocossd from '@tensorflow-models/coco-ssd';
import aiRecognition from '../ai-recognition';

// Mock外部依赖
vi.mock('@tensorflow/tfjs');
vi.mock('@tensorflow-models/mobilenet');
vi.mock('@tensorflow-models/coco-ssd');

// 正确模拟全局对象
global.fetch = vi.fn();
global.URL = {
  createObjectURL: vi.fn(() => 'blob:url'),
  revokeObjectURL: vi.fn()
};

// 模拟Image类
class MockImage {
  constructor() {
    this.src = '';
    this.onload = null;
    this.onerror = null;
  }
  
  simulateLoad() {
    if (this.onload) this.onload();
  }
  
  simulateError() {
    if (this.onerror) this.onerror();
  }
}

global.Image = MockImage;

describe('AIRecognition', () => {
  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks();
    
    // 重置AI实例状态
    aiRecognition.isInitialized = false;
    aiRecognition.mobilenetModel = null;
    aiRecognition.cocoModel = null;
    aiRecognition.translationCache.clear();
    
    // 设置模型mock
    const mockMobilenetModel = {
      classify: vi.fn().mockResolvedValue([
        { className: 'cat, feline', probability: 0.85 },
        { className: 'pet, companion', probability: 0.72 }
      ])
    };
    
    const mockCocoModel = {
      detect: vi.fn().mockResolvedValue([
        { class: 'cat', score: 0.9, bbox: [10, 20, 100, 100] },
        { class: 'person', score: 0.6, bbox: [50, 50, 150, 300] }
      ])
    };
    
    mobilenet.load.mockResolvedValue(mockMobilenetModel);
    cocossd.load.mockResolvedValue(mockCocoModel);
  });

  describe('init', () => {
    it('should initialize models successfully', async () => {
      const result = await aiRecognition.init();
      
      expect(result).toBe(true);
      expect(mobilenet.load).toHaveBeenCalled();
      expect(cocossd.load).toHaveBeenCalled();
      expect(aiRecognition.isInitialized).toBe(true);
      expect(aiRecognition.mobilenetModel).toBeDefined();
      expect(aiRecognition.cocoModel).toBeDefined();
    });

    it('should handle initialization errors', async () => {
      mobilenet.load.mockRejectedValue(new Error('Failed to load model'));
      
      const result = await aiRecognition.init();
      
      expect(result).toBe(false);
      expect(aiRecognition.isInitialized).toBe(false);
    });
  });

  describe('recognize', () => {
    it('should recognize from image element', async () => {
      const mockImage = {};
      await aiRecognition.init();
      
      const result = await aiRecognition.recognize(mockImage);
      
      expect(result).toHaveProperty('classification');
      expect(result).toHaveProperty('objectDetection');
      expect(result.classification.length).toBe(2);
      expect(result.objectDetection.length).toBe(2);
    });

    it('should initialize models if not already initialized', async () => {
      const mockImage = {};
      
      const result = await aiRecognition.recognize(mockImage);
      
      expect(aiRecognition.isInitialized).toBe(true);
      expect(result.classification.length).toBe(2);
    });
  });

  describe('recognizeFromFile', () => {
    it('should recognize from file successfully', async () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      await aiRecognition.init();
      
      // 保存原始的Image构造函数
      const originalImage = global.Image;
      
      // 创建一个新的构造函数来模拟Image
      let currentImageInstance = null;
      global.Image = function() {
        currentImageInstance = new MockImage();
        return currentImageInstance;
      };
      global.Image.prototype = MockImage.prototype;
      
      // 启动识别过程
      const resultPromise = aiRecognition.recognizeFromFile(mockFile);
      
      // 模拟图片加载完成
      if (currentImageInstance && currentImageInstance.onload) {
        currentImageInstance.onload();
      }
      
      const result = await resultPromise;
      
      // 恢复原始的Image构造函数
      global.Image = originalImage;
      
      expect(result).toHaveProperty('classification');
      expect(result).toHaveProperty('objectDetection');
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle image loading errors', async () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      // 保存原始的Image构造函数
      const originalImage = global.Image;
      
      // 创建一个新的构造函数来模拟Image
      let currentImageInstance = null;
      global.Image = function() {
        currentImageInstance = new MockImage();
        return currentImageInstance;
      };
      global.Image.prototype = MockImage.prototype;
      
      // 启动识别过程
      const resultPromise = aiRecognition.recognizeFromFile(mockFile);
      
      // 模拟图片加载失败
      if (currentImageInstance && currentImageInstance.onerror) {
        currentImageInstance.onerror();
      }
      
      await expect(resultPromise).rejects.toThrow('图片加载失败');
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
      
      // 恢复原始的Image构造函数
      global.Image = originalImage;
    });
  });

  describe('translateToChinese', () => {
    it('should use simple mapping for common words', async () => {
      const result = await aiRecognition.translateToChinese('cat');
      expect(result).toBe('猫');
    });

    it('should clean and translate text', async () => {
      // 设置fetch mock
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          responseData: {
            translatedText: '测试翻译'
          }
        })
      });
      
      const result = await aiRecognition.translateToChinese('the test case');
      expect(result).toBe('测试翻译');
    });

    it('should return original text if translation fails', async () => {
      global.fetch.mockRejectedValue(new Error('API error'));
      
      const result = await aiRecognition.translateToChinese('unknownword123');
      expect(result).toBe('unknownword123');
    });
  });

  describe('generateTagsFromResults', () => {
    it('should generate tags from recognition results', async () => {
      const mockResults = {
        classification: [
          { className: 'cat, feline', probability: 0.85 },
          { className: 'pet, companion', probability: 0.72 }
        ],
        objectDetection: [
          { class: 'cat', score: 0.9, bbox: [10, 20, 100, 100] }
        ]
      };
      
      const tags = await aiRecognition.generateTagsFromResults(mockResults);
      
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
    });

    it('should add supplemental tags if not enough', async () => {
      const mockResults = {
        classification: [],
        objectDetection: []
      };
      
      const tags = await aiRecognition.generateTagsFromResults(mockResults);
      
      expect(tags.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('generateNameFromResults', () => {
    it('should generate name from classification results', async () => {
      const mockResults = {
        classification: [
          { className: 'beautiful landscape', probability: 0.85 }
        ],
        objectDetection: []
      };
      
      // 由于我们mock了翻译，这里会返回映射中的值或原文本
      const name = await aiRecognition.generateNameFromResults(mockResults);
      
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('should generate attractive name when no good results', async () => {
      const mockResults = {
        classification: [],
        objectDetection: []
      };
      
      const name = await aiRecognition.generateNameFromResults(mockResults);
      
      expect(typeof name).toBe('string');
      expect(name).toBe('精美壁纸');
    });
  });

  describe('isCommonWord', () => {
    it('should identify common words', () => {
      expect(aiRecognition.isCommonWord('the')).toBe(true);
      expect(aiRecognition.isCommonWord('and')).toBe(true);
      expect(aiRecognition.isCommonWord('is')).toBe(true);
    });

    it('should identify non-common words', () => {
      expect(aiRecognition.isCommonWord('cat')).toBe(false);
      expect(aiRecognition.isCommonWord('computer')).toBe(false);
      expect(aiRecognition.isCommonWord('javascript')).toBe(false);
    });
  });
});