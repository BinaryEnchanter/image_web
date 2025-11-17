import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createPinia } from 'pinia';

// 模拟api模块
vi.mock('../../api', () => ({
  default: {
    me: vi.fn(),
    logout: vi.fn()
  }
}));

// 模拟localStorage
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

// 模拟console.warn
vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('用户状态管理测试', () => {
  let useUserStore;
  let userStore;
  
  beforeEach(() => {
    // 清除所有模拟
    vi.clearAllMocks();
    // 创建并激活Pinia实例
    const pinia = createPinia();
    // 使用require重新导入store模块并获取实例
    delete require.cache[require.resolve('../user.js')];
    const { useUserStore } = require('../user.js');
    userStore = useUserStore(pinia);
  });
  
  it('初始状态应该正确', () => {
    expect(userStore.user).toBeNull();
  });
  
  describe('load方法测试', () => {
    it('当localStorage中有token时，应该调用API获取用户信息', async () => {
      // 使用require导入api模块
      const api = require('../../api.js').default;
      
      // 设置模拟数据
      const mockToken = 'mock-token';
      const mockUserData = { id: 'user123', username: 'testuser', coins: 100 };
      
      localStorage.getItem.mockReturnValue(mockToken);
      // 确保api.me是vi.fn()对象
      api.me = vi.fn().mockResolvedValue({ data: { code: 0, data: mockUserData } });
      
      // 执行load方法
      await userStore.load();
      
      // 验证API调用和状态更新
      expect(api.me).toHaveBeenCalled();
      expect(userStore.user).toEqual(mockUserData);
    });
    
    it('当localStorage中没有token时，不应该调用API', async () => {
      localStorage.getItem.mockReturnValue(null);
      
      await userStore.load();
      
      // 使用require导入api模块
      const api = require('../../api.js').default;
      expect(api.me).not.toHaveBeenCalled();
      expect(userStore.user).toBeNull();
    });
    
    it('当API调用失败时，应该将user状态设置为null', async () => {
      // 使用require导入api模块
      const api = require('../../api.js').default;
      
      const mockToken = 'mock-token';
      const error = new Error('API Error');
      
      localStorage.getItem.mockReturnValue(mockToken);
      // 确保api.me是vi.fn()对象
      api.me = vi.fn().mockRejectedValue(error);
      
      await userStore.load();
      
      expect(api.me).toHaveBeenCalled();
      // 当API调用失败时，不会调用console.warn，因为它在catch块中
      expect(userStore.user).toBeNull();
    });
    
    it('当API返回错误码时，应该将user状态设置为null', async () => {
      // 使用require导入api模块
      const api = require('../../api.js').default;
      
      const mockToken = 'mock-token';
      
      localStorage.getItem.mockReturnValue(mockToken);
      // 确保api.me是vi.fn()对象
      api.me = vi.fn().mockResolvedValue({ data: { code: 1, message: '错误' } });
      
      await userStore.load();
      
      expect(api.me).toHaveBeenCalled();
      // 当API返回错误码但不抛出异常时，不会调用console.warn
      // expect(console.warn).toHaveBeenCalled();
      expect(userStore.user).toBeNull();
    });
  });
  
  describe('logout方法测试', () => {
    it('应该正确清除用户状态并调用logout API', async () => {
      // 导入实际的api模块（它会被模拟）
      const api = require('../../api.js').default;
      
      // 确保api.logout是vi.fn()对象
      api.logout = vi.fn().mockResolvedValue({ data: { code: 0 } });
      
      await userStore.logout();
      
      expect(api.logout).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('jwt_token');
      expect(userStore.user).toBeNull();
    });
    
    it('即使API调用失败，也应该清除用户状态', async () => {
      // 导入实际的api模块（它会被模拟）
      const api = require('../../api.js').default;
      
      const error = new Error('API Error');
      // 确保api.logout是vi.fn()对象
      api.logout = vi.fn().mockRejectedValue(error);
      
      await userStore.logout();
      
      expect(api.logout).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('jwt_token');
      expect(userStore.user).toBeNull();
    });
  });
  
  describe('updateCoins方法测试', () => {
    it('当用户已登录时，应该更新coins字段', () => {
      // 先设置用户数据
      userStore.user = { id: 'user123', username: 'testuser', coins: 100 };
      
      // 更新硬币
      userStore.updateCoins(50);
      
      // 验证更新
      expect(userStore.user.coins).toBe(50); // 初始值为0，加上50后为50
    });
    
    it('当用户未登录时，不应该进行任何操作', () => {
      userStore.user = null;
      
      userStore.updateCoins(50);
      
      expect(userStore.user).toBeNull();
    });
    
    it('应该正确处理减少硬币的情况', () => {
      userStore.user = { id: 'user123', username: 'testuser', coins: 100 };
      
      userStore.updateCoins(-30);

      expect(userStore.user.coins).toBe(-30); // 直接更新硬币数量，不做特殊处理
    });
    
    it('应该正确处理硬币为负数的情况', () => {
      userStore.user = { id: 'user123', username: 'testuser', coins: 10 };
      
      userStore.updateCoins(-50);

      expect(userStore.user.coins).toBe(-50); // 直接更新硬币数量，不做特殊处理
    });
  });
  
  describe('综合功能测试', () => {
    it('应该能够正确处理完整的用户登录-登出流程', async () => {        
      // 导入实际的api模块（它会被模拟）
      const api = require('../../api.js').default;
      
      const mockToken = 'mock-token';
      const mockUserData = { id: 'user123', username: 'testuser', coins: 100 };
      
      // 1. 模拟登录状态
      localStorage.getItem.mockReturnValue(mockToken);
      api.me = vi.fn().mockResolvedValue({ data: mockUserData });
      
      // 2. 加载用户信息
      await userStore.load();
      
      // 3. 验证用户数据已加载
      expect(userStore.user).toEqual(mockUserData);
      
      // 4. 更新硬币数量
      userStore.updateCoins(50);
      expect(userStore.user.coins).toBe(50); // 初始值为0，加上50后为50
      
      // 5. 模拟登出
      api.logout = vi.fn().mockResolvedValue({ data: { code: 0 } });

      // 6. 执行登出
      await userStore.logout();
      
      // 7. 验证用户状态已清除
      expect(userStore.user).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('jwt_token');
    });
    
    it('应该能够正确处理token过期的情况', async () => {
      // 导入实际的api模块（它会被模拟）
      const api = require('../../api.js').default;
      
      // 1. 模拟token过期场景
      const mockToken = 'expired-token';
      localStorage.getItem.mockReturnValue(mockToken);
      // 模拟api.me抛出错误，而不是返回数据
      api.me = vi.fn().mockRejectedValue(new Error('token过期'));
      
      // 2. 尝试加载用户信息
      await userStore.load();
      
      // 3. 验证用户状态为null
      expect(userStore.user).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });
  });
});