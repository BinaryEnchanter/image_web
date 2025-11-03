<template>
  <div class="page">
    <div class="card login-card">
      <h2>登录</h2>

      <div class="form" style="margin-top:12px">
        <input v-model="username" placeholder="用户名" class="input" />
        <input v-model="email" placeholder="电子邮箱（选填）" class="input" />
        <input v-model="password" placeholder="密码" type="password" class="input" />

        <div class="actions" style="margin-top:12px">
          <button class="btn" @click="doLogin">登录</button>
          <button class="btn ghost" @click="doRegister">注册</button>
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
const userStore = useUserStore()
import api from '../api'

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref(null)
const router = useRouter()

async function doLogin() {
  error.value = null
  try {
    const res = await api.login({ username: username.value, password: password.value })
    const token = res.data?.token || res.data?.jwt
    if (token) {
      localStorage.setItem('jwt_token', token)
      localStorage.setItem('current_user', JSON.stringify({ uuid: res.data?.uuid, username: res.data?.username }))
      await userStore.load()
      // 跳转到首页并刷新用户信息
      router.push('/')
    } else {
      error.value = '未收到令牌 (token)，请联系管理员'
    }
  } catch (e) {
    error.value = e.response?.data?.message || '登录失败，请检查用户名或密码'
    console.error(e)
  }
}

async function doRegister() {
  error.value = null
  try {
    // 如果用户没有填写 email，则用 username 占位（可按需调整）
    const payload = { username: username.value, password: password.value, email: email.value || username.value }
    await api.register(payload)
    // 注册成功后直接登录
    await doLogin()
  } catch (e) {
    error.value = e.response?.data?.message || '注册失败'
    console.error(e)
  }
}
</script>

<style>
:root {
  --bg: #0f1724;
  --card: #0b1220;
  --accent: #3b82f6;
  --muted: #9aa4b2;
  --text: #e6eef6;
  --glass: rgba(255, 255, 255, 0.03);
}

* {
  box-sizing: border-box
}

.page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px
}

.login-card {
  padding: 20px;
  max-width: 420px;
  width: 100%;
  border-radius: 12px;
  background: var(--glass)
}

h2 {
  margin: 0 0 8px 0
}

.input {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: transparent;
  color: var(--text);
  margin-top: 8px
}

.actions {
  display: flex;
  gap: 8px
}

.btn {
  background: var(--accent);
  color: white;
  padding: 8px 12px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600
}

.btn.ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--text)
}

.error {
  margin-top: 10px;
  color: #ff7b7b
}

@media (max-width:560px) {
  .login-card {
    padding: 16px
  }
}
</style>

<style scoped>
.login-card {
  backdrop-filter: blur(6px)
}
</style>