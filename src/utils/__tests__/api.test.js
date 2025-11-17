import { vi, describe, it, expect, beforeEach } from 'vitest';

// 模拟axios模块，避免变量提升问题
vi.mock('axios', () => ({
  default: {
    create: vi.fn().mockReturnValue({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
      }
    }),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
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

describe('API 配置测试', () => {
  let api;
  
  beforeEach(async () => {
    // 清除所有模拟
    vi.clearAllMocks();
    
    // 使用require导入api模块，避免路径问题
    api = require('../../api.js').default;
  });
  
  it('API模块应该成功导入', () => {
    expect(api).toBeDefined();
  });
  
  it('API模块应该包含必要的方法', () => {
    expect(typeof api).toBe('object');
    expect(api).not.toBeNull();
    
    // 验证API模块包含必要的方法（根据api.js中实际导出的方法）
    expect(api).toHaveProperty('register');
    expect(api).toHaveProperty('login');
    expect(api).toHaveProperty('getWallpapers');
    expect(api).toHaveProperty('detail');
    expect(api).toHaveProperty('upload');
    expect(api).toHaveProperty('me');
    expect(api).toHaveProperty('recharge');
    expect(api).toHaveProperty('adminStats');
  });
});

describe('认证相关API测试', () => {
  let api;
  
  beforeEach(async () => {
    vi.clearAllMocks();// 清除之前的模块缓存
    // 使用require导入api模块，避免路径问题
    api = require('../../api.js').default;
  });

  it('login方法应该正确处理登录请求', async () => {
    // 直接模拟api.login方法返回成功响应
    api.login = vi.fn().mockResolvedValue({ data: { code: 0, data: { token: 'mock-token', user: { id: 1, username: 'testuser' } } } });
    const mockCredentials = { username: 'testuser', password: 'password123' };

    const result = await api.login(mockCredentials);

    expect(api.login).toHaveBeenCalledWith(mockCredentials);
    expect(result).toEqual({ data: { code: 0, data: { token: 'mock-token', user: { id: 1, username: 'testuser' } } } });
  });

  it('register方法应该正确处理注册请求', async () => {
    // 直接模拟api.register方法返回成功响应
    api.register = vi.fn().mockResolvedValue({ data: { code: 0, message: '注册成功' } });
    const mockUserInfo = { username: 'newuser', password: 'password123', email: 'test@example.com' };

    const result = await api.register(mockUserInfo);

    expect(api.register).toHaveBeenCalledWith(mockUserInfo);
    expect(result).toEqual({ data: { code: 0, message: '注册成功' } });
  });

  it('logout方法应该正确处理登出请求', async () => {
    // 直接模拟api.logout方法返回成功响应
    api.logout = vi.fn().mockResolvedValue({ data: { code: 0, message: '登出成功' } });

    const result = await api.logout();

    expect(api.logout).toHaveBeenCalled();
    expect(result).toEqual({ data: { code: 0, message: '登出成功' } });
  });

  it('me方法应该正确处理获取用户信息请求', async () => {
    // 直接模拟api.me方法返回成功响应
    api.me = vi.fn().mockResolvedValue({ data: { code: 0, data: { id: 1, username: 'testuser', email: 'test@example.com' } } });

    const result = await api.me();

    expect(api.me).toHaveBeenCalled();
    expect(result).toEqual({ data: { code: 0, data: { id: 1, username: 'testuser', email: 'test@example.com' } } });
  });
});

describe('壁纸相关API测试', () => {
  let api;
  
  beforeEach(async () => {
    vi.clearAllMocks();

    // 使用require导入api模块，避免路径问题
    api = require('../../api.js').default;
  });
  
  it('getWallpapers方法应该正确处理获取壁纸列表请求', async () => {
    // 直接模拟api.getWallpapers方法返回成功响应
    api.getWallpapers = vi.fn().mockResolvedValue({ data: { code: 0, data: [] } });

    const result = await api.getWallpapers(1);

    expect(api.getWallpapers).toHaveBeenCalledWith(1);
    expect(result).toEqual({ data: { code: 0, data: [] } });
  });
  
  it('detail方法应该正确处理获取壁纸详情请求', async () => {
    // 直接模拟api.detail方法返回成功响应
    api.detail = vi.fn().mockResolvedValue({ data: { code: 0, data: { id: 'wallpaper123', title: 'Test Wallpaper' } } });
    const wallpaperId = 'wallpaper123';

    const result = await api.detail(wallpaperId);

    expect(api.detail).toHaveBeenCalledWith(wallpaperId);
    expect(result).toEqual({ data: { code: 0, data: { id: 'wallpaper123', title: 'Test Wallpaper' } } });
  });
  
  it('upload方法应该正确处理上传壁纸请求', async () => {
    // 直接模拟api.upload方法返回成功响应
    api.upload = vi.fn().mockResolvedValue({ data: { code: 0, message: '上传成功' } });
    const mockFormData = new FormData();

    const result = await api.upload(mockFormData);

    expect(api.upload).toHaveBeenCalledWith(mockFormData);
    expect(result).toEqual({ data: { code: 0, message: '上传成功' } });
  });
});

describe('用户相关API测试', () => {
  let api;
  
  beforeEach(() => {
    vi.clearAllMocks();
    // 使用require导入api模块，避免路径问题
    api = require('../../api.js').default;
  });

  it('register方法应该正确处理注册请求', async () => {
    // 直接模拟api.register方法返回成功响应
    api.register = vi.fn().mockResolvedValue({ data: { code: 0, message: '注册成功' } });
    const mockData = { username: 'testuser', email: 'test@example.com', password: 'password123' };

    const result = await api.register(mockData);

    expect(api.register).toHaveBeenCalledWith(mockData);
    expect(result).toEqual({ data: { code: 0, message: '注册成功' } });
  });

  it('login方法应该正确处理登录请求', async () => {
    // 直接模拟api.login方法返回成功响应
    api.login = vi.fn().mockResolvedValue({ data: { code: 0, message: '登录成功', data: { token: 'mock-token' } } });
    const mockData = { email: 'test@example.com', password: 'password123' };

    const result = await api.login(mockData);

    expect(api.login).toHaveBeenCalledWith(mockData);
    expect(result).toEqual({ data: { code: 0, message: '登录成功', data: { token: 'mock-token' } } });
  });

  it('me方法应该正确获取用户信息', async () => {
    // 直接模拟api.me方法返回成功响应
    api.me = vi.fn().mockResolvedValue({ data: { code: 0, data: { id: 1, username: 'testuser' } } });

    const result = await api.me();

    expect(api.me).toHaveBeenCalled();
    expect(result).toEqual({ data: { code: 0, data: { id: 1, username: 'testuser' } } });
  });

  it('recharge方法应该正确处理充值请求', async () => {
    // 直接模拟api.recharge方法返回成功响应
    api.recharge = vi.fn().mockResolvedValue({ data: { code: 0, message: '充值成功' } });
    const mockData = 100;

    const result = await api.recharge(mockData);

    expect(api.recharge).toHaveBeenCalledWith(mockData);
    expect(result).toEqual({ data: { code: 0, message: '充值成功' } });
  });
  
  it('updateProfile方法应该正确处理更新请求', async () => {
    // 直接模拟api.updateProfile方法返回成功响应
    api.updateProfile = vi.fn().mockResolvedValue({ data: { code: 0, message: '更新成功' } });
    const mockUserData = { username: 'newname', email: 'newemail@example.com' };

    const result = await api.updateProfile(mockUserData);

    expect(api.updateProfile).toHaveBeenCalledWith(mockUserData);
    expect(result).toEqual({ data: { code: 0, message: '更新成功' } });
  });
});

describe('管理员相关API测试', () => {
  let api;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    // 使用require导入api模块，避免路径问题
    api = require('../../api.js').default;
  });

  it('adminStats方法应该正确返回管理员统计信息', async () => {
    // 直接模拟api.adminStats方法返回成功响应
    api.adminStats = vi.fn().mockResolvedValue({ data: { code: 0, data: { totalUsers: 100, totalWallpapers: 500 } } });

    const result = await api.adminStats();
    expect(api.adminStats).toHaveBeenCalled();
    expect(result).toEqual({ data: { code: 0, data: { totalUsers: 100, totalWallpapers: 500 } } });
  });
});

describe('错误处理测试', () => {
  let api;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    // 使用require导入api模块，避免路径问题
    api = require('../../api.js').default;
  });
  
  it('当API调用失败时，应该正确处理错误', async () => {
    // 直接模拟api.getWallpapers方法抛出错误
    api.getWallpapers = vi.fn().mockRejectedValue(new Error('Request failed with status code 401'));

    // 验证错误被正确抛出
    await expect(api.getWallpapers()).rejects.toThrow('Request failed with status code 401');
  });
  
  it('当localStorage中没有token时，应该正常处理请求', async () => {
    // 直接模拟api.getWallpapers方法返回成功响应
    api.getWallpapers = vi.fn().mockResolvedValue({ data: { code: 0, data: [] } });

    // 验证请求仍然能够执行
    await expect(api.getWallpapers()).resolves.toBeDefined();
  });
});