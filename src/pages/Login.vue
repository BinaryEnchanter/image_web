<!-- login.vue -->
<template>
  <div class="page">
    <div class="card login-card">
      <h2>登录</h2>

      <div class="form" style="margin-top:12px">
        <input v-model="username" placeholder="用户名" class="input" />
        <input v-model="password" placeholder="密码" type="password" class="input" />

        <div class="actions" style="margin-top:12px">
          <button class="btn" @click="doLogin">登录</button>
          <button class="btn ghost" @click="goRegister">注册</button>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import api from '../api'

const userStore = useUserStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref(null)

async function doLogin() {
  error.value = null
  try {
    const res = await api.login({ username: username.value, password: password.value })
    const token = res.data?.token || res.data?.jwt

    if (token) {
      localStorage.setItem('jwt_token', token)
      localStorage.setItem(
        'current_user',
        JSON.stringify({
          uuid: res.data?.uuid,
          username: res.data?.username
        })
      )
      await userStore.load()
      router.push('/')
    } else {
      error.value = '未收到令牌，请联系管理员'
    }
  } catch (e) {
    error.value = e.response?.data?.message || '登录失败，请检查用户名或密码'
  }
}

function goRegister() {
  router.push('/register')
}
</script>

<style>
/* 使用你原来的样式，保持一致 */
</style>

<style scoped>
.login-card {
  backdrop-filter: blur(6px);
}
</style>
