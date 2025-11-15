<template>
  <div>
    <header class="container header">
      <div class="left">
        <div class="logo">壁纸中心</div>
        <div class="muted small">高品质桌面壁纸</div>
      </div>

      <nav class="nav">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/wallpapers" class="nav-link">壁纸</router-link>
        <router-link to="/upload" class="nav-link">上传</router-link>

        <div v-if="!user">
          <router-link to="/login" class="btn">登录</router-link>
        </div>

        <div v-else class="topbar-info">
          <button class="btn ghost" @click="goRecharge">
            💰 {{ user.coins || 0 }}
            <span class="recharge-text">（充值）</span>
          </button>
          <router-link v-if="user && (user.role === 'admin' || user.isAdmin)" to="/admin" class="nav-link">管理</router-link>
          <router-link to="/me" class="nav-link">个人中心</router-link>
          <button class="btn ghost" @click="logout">登出</button>
        </div>
      </nav>
    </header>

    <main class="container main-content">
      <router-view />
    </main>

    <footer class="footer">
      © {{ new Date().getFullYear() }} 壁纸中心 — 演示前端
    </footer>
    <ChatWidget />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './store/user'
import api from './api'
import ChatWidget from './pages/ChatWidget.vue'

const userStore = useUserStore()
const user = computed(() => userStore.user)
const router = useRouter()

const goRecharge = () => {
  router.push('/recharge')
}

async function load() {
  const token = localStorage.getItem('jwt_token')
  if (token) {
    try {
      const res = await api.me()
      user.value = res.data
    } catch (e) {
      console.warn('未登录或 token 无效', e)
      user.value = null
    }
  }
}

function logout() {
  localStorage.removeItem('jwt_token')
  userStore.logout()
  router.push('/login')
}

onMounted(() => userStore.load())

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

body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, Segoe UI, Roboto, "Helvetica Neue", Arial;
  background: linear-gradient(180deg, #071021 0%, #071829 100%);
  color: var(--text);
  min-height: 100vh
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 12px 16px
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0
}

.left {
  display: flex;
  flex-direction: column
}

.logo {
  font-weight: 800;
  font-size: 20px;
  color: var(--accent);
  letter-spacing: 0.2px
}

.small {
  font-size: 12px
}

.muted {
  color: var(--muted)
}

.nav {
  display: flex;
  gap: 12px;
  align-items: center
}

.nav-link {
  color: var(--text);
  text-decoration: none;
  padding: 6px 8px;
  border-radius: 8px
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.02)
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

.topbar-info {
  display: flex;
  gap: 8px;
  align-items: center
}

.user-chip {
  background: rgba(255, 255, 255, 0.03);
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 14px
}

.main-content {
  padding: 20px 0
}

.footer {
  padding: 32px 0;
  color: var(--muted);
  text-align: center
}

/* responsive */
@media (max-width:720px) {
  .nav {
    gap: 8px
  }

  .container {
    padding: 8px
  }

  .logo {
    font-size: 18px
  }
}
</style>

<style scoped>
header.card {
  backdrop-filter: blur(6px)
}
</style>