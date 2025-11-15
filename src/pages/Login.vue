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
  background: var(--glass);
  border: 1px solid rgba(255,255,255,.06);
  box-shadow: 0 18px 40px rgba(11,18,32,.45);
  animation: cardIn .28s ease both
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
  margin-top: 8px;
  transition: border-color .2s ease, box-shadow .2s ease
}
.input:focus { border-color: rgba(59,130,246,.6); box-shadow: 0 0 0 3px rgba(59,130,246,.18) }

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
  font-weight: 600;
  transition: transform .15s ease, box-shadow .2s ease
}
.btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(59,130,246,.35) }

.btn.ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--text)
}

.error {
  margin-top: 10px;
  color: #ff7b7b
}

@keyframes cardIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
@media (max-width:560px) { .login-card { padding: 16px } }
</style>

<style scoped>
.login-card {
  backdrop-filter: blur(6px);
}
</style>
