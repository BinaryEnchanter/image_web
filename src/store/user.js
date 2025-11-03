import { defineStore } from 'pinia'
import api from '../api'

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
          this.user = res.data
        } catch (e) {
          console.warn('未登录或 token 无效', e)
          this.user = null
        }
      }
    },
    logout() {
      localStorage.removeItem('jwt_token')
      this.user = null
    },
    updateCoins(amount) {
      if (this.user) this.user.coins = amount
    }
  }
})
