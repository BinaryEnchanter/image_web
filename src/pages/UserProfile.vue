<template>
  <div>
    <section class="card" style="padding:16px;margin-bottom:12px">
      <h3>个人资料</h3>
      <div v-if="!user" class="muted">未登录。</div>
      <div v-else class="profile">
        <p><strong class="username">{{ user.username }}</strong> • <span class="muted">{{ user.email }}</span></p>
        <p>金币：<span class="accent">{{ user.coins || 0 }}</span></p>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
          <router-link to="/me/edit" class="btn">编辑资料</router-link>
          <button class="btn ghost" @click="refresh">刷新</button>
        </div>
      </div>
    </section>

    <section class="card" style="padding:12px">
      <h4>我的作品 / 已拥有</h4>
      <div v-if="assets.length === 0" class="empty-state">暂无作品 — 可以上传你的第一张壁纸！</div>

      <div class="grid" style="margin-top:12px">
        <div v-for="wp in assets" :key="wp.uuid" class="tile card">
          <router-link :to="`/image/${wp.uuid}`">
            <img :src="wp.thumbUrl || placeholder(wp.uuid)" class="thumb" />
          </router-link>
          <div class="meta" style="padding-top:8px">{{ wp.name || '未命名' }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const user = ref(null)
const assets = ref([])

function placeholder(id) { return 'https://picsum.photos/seed/' + id + '/400/240' }

async function load() {
  try {
    const res = await api.me() // 获取用户基本信息
    user.value = res.data;

    // 获取自己上传的壁纸
    const jwt = localStorage.jwt_token;
    const wallpapersRes = await api.getMyWallpapers(jwt, 1);
    assets.value = wallpapersRes.data.items || [];
  } catch (e) {
    console.warn('获取用户信息或壁纸失败', e)
    user.value = null
    assets.value = []
  }
}

function refresh() { load() }

onMounted(load)
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

.card {
  background: var(--glass);
  padding: 12px;
  border-radius: 12px
}

.muted {
  color: var(--muted);
  font-size: 13px
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

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 12px
}

.tile {
  overflow: hidden;
  padding: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.012), transparent);
  transition: transform .18s ease, box-shadow .18s ease
}

.tile:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 30px rgba(11, 18, 32, 0.6)
}

.thumb {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 10px
}

.meta {
  padding: 10px;
  font-weight: 600
}

.empty-state {
  padding: 28px;
  text-align: center;
  color: var(--muted)
}

.accent {
  color: var(--accent);
  font-weight: 700
}

.username {
  font-size: 16px
}

@media (max-width:980px) {
  .grid {
    grid-template-columns: repeat(2, 1fr)
  }
}

@media (max-width:560px) {
  .grid {
    grid-template-columns: 1fr
  }

  .thumb {
    height: 200px
  }
}
</style>

<style scoped>
.card {
  backdrop-filter: blur(6px)
}
</style>
