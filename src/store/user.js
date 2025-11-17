import { defineStore } from 'pinia'
import api from '../api.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  }),
  actions: {
    async load() {
      const token = localStorage.getItem('jwt_token')
      if (token) {
        try {
          const res = await api.me()
          // 兼容两种返回结构：{data: mockUserData} 和 {data: {code: 0, data: mockUserData}}
          if (res.data && res.data.code !== undefined) {
            // 有错误码的嵌套结构
            if (res.data.code === 0) {
              this.user = res.data.data
            } else {
              this.user = null
            }
          } else {
            // 简单结构
            this.user = res.data
          }
        } catch (e) {
          console.warn('未登录或 token 无效', e)
          this.user = null
        }
      }
    },
    async logout() {
      try {
        // 调用API进行登出
        await api.logout()
      } catch (e) {
        // 即使API调用失败，也要清除本地状态
        console.warn('登出API调用失败', e)
      } finally {
        // 无论如何都清除本地状态
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('current_user')
        this.user = null
      }
    },
    updateCoins(amount) {
      if (this.user) this.user.coins = amount
    }
  }
})
