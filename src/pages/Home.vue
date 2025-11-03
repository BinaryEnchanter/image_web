<template>
  <div class="page">
    <main class="container">
      <!-- Hero Section -->
      <section class="hero card">
        <div class="hero-left">
          <h1>发现精美壁纸</h1>
          <p class="lead">探索、购买并下载高质量壁纸。</p>

          <div class="search">
            <input v-model="q" class="input" placeholder="搜索壁纸，例如：山脉" @keyup.enter="goSearch" />
            <button class="btn" @click="goSearch">搜索</button>
          </div>
        </div>


      </section>

      <!-- 推荐壁纸 -->
      <section class="card">
        <div class="section-head">
          <h3>推荐壁纸</h3>
          <div class="muted">为你精选的热门内容</div>
        </div>

        <section class="grid">
          <div v-for="item in items" :key="item.uuid" class="tile card">
            <router-link :to="`/image/${item.uuid}`">
              <img :src="item.thumbUrl || placeholder(item.uuid)" class="thumb" />
            </router-link>

            <div class="meta" style="padding-top:8px;display:flex;justify-content:space-between;align-items:center">
              <div class="title">{{ item.name || '未命名' }}</div>
              <div class="fav"><span style="font-size:13px;color:var(--muted)">{{ item.favoriteCount || 0 }}</span> ❤
              </div>
            </div>
          </div>
        </section>
      </section>

      <footer class="footer">
        © {{ new Date().getFullYear() }} 壁纸中心 — 精心制作
      </footer>
    </main>
  </div>
</template>

<script>
import api from '../api'
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const items = ref([])
    const q = ref('')
    const heroImage = 'https://picsum.photos/seed/hero/800/480'

    function placeholder(id) {
      return `https://picsum.photos/seed/${id}/600/380`
    }

    async function load() {
      try {
        const res = await api.getWallpapers(1) // 获取第一页数据
        items.value = res.data.items || []
      } catch (e) {
        console.error(e)
      }
    }

    function goSearch() {
      if (!q.value.trim()) {
        window.location.href = '/wallpapers'
        return
      }
      const url = `/wallpapers?search=${encodeURIComponent(q.value)}`
      window.location.href = url
    }

    onMounted(load)
    return { items, q, heroImage, goSearch, placeholder }
  }
}
</script>

<style>
/* 基本变量和卡片样式保持原来的风格 */
:root {
  --bg: #0f1724;
  --card: #0b1220;
  --accent: #3b82f6;
  --muted: #9aa4b2;
  --text: #e6eef6;
  --glass: rgba(255, 255, 255, 0.03);
}

.page {
  min-height: 100vh;
}

.container {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
}

.card {
  background: var(--glass);
  padding: 12px;
  border-radius: 12px;
  backdrop-filter: blur(6px);
}

.hero {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 20px;
  align-items: center;
  padding: 24px;
}

.hero-left h1 {
  margin: 0;
  font-size: 28px;
}

.lead {
  color: var(--muted);
  margin-top: 8px;
}

.search {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 16px;
}

.input {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: transparent;
  color: var(--text);
  min-width: 260px;
}

.btn {
  background: var(--accent);
  color: #fff;
  padding: 8px 12px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.thumb {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 10px;
}

.thumb.large {
  height: 260px;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(11, 18, 32, 0.6);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.tile {
  overflow: hidden;
  padding: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.012), transparent);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.tile:hover {
  transform: translateY(-10px) scale(1.06);
  box-shadow: 0 20px 50px rgba(11, 18, 32, 0.6);
}

.meta {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-weight: 600;
}

.fav {
  font-size: 13px;
  color: var(--muted);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.muted {
  color: var(--muted);
  font-size: 13px;
}

.footer {
  padding: 32px 0;
  color: var(--muted);
  text-align: center;
}

@media (max-width:980px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width:560px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .thumb {
    height: 200px;
  }

  .input {
    min-width: 120px;
  }
}
</style>
