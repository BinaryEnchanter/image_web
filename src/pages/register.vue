<!-- register.vue -->
<template>
  <div class="page">
    <div class="card login-card">
      <h2>注册</h2>

      <div class="form" style="margin-top:12px">
        <input v-model="username" placeholder="用户名" class="input" />
        <input v-model="email" placeholder="电子邮箱" class="input" />
        <input v-model="password" placeholder="密码" type="password" class="input" />

        <div class="actions" style="margin-top:12px">
          <button class="btn" @click="doRegister">注册</button>
          <button class="btn ghost" @click="goLogin">返回登录</button>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref(null)

async function doRegister() {
  error.value = null
  try {
    await api.register({
      username: username.value,
      password: password.value,
      email: email.value || username.value
    })

    // 注册成功后自动登录
    const res = await api.login({ username: username.value, password: password.value })
    const token = res.data?.token || res.data?.jwt
    if (token) {
      localStorage.setItem('jwt_token', token)
      localStorage.setItem('current_user', JSON.stringify(res.data))
      await userStore.load()
      router.push('/')
    }
  } catch (e) {
    error.value = e.response?.data?.message || '注册失败'
  }
}

function goLogin() {
  router.push('/login')
}
</script>

<style>
/* 保持与你原来的 UI 一样 */
</style>

<style scoped>
.login-card {
  backdrop-filter: blur(6px);
}
</style>
