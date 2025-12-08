<template>
  <div class="page">
    <main class="container">
      <!-- Hero Section -->
      <section class="hero card">
        <div class="hero-left">
          <h1>发现精美壁纸</h1>
          <p class="lead">探索、购买并下载高质量壁纸。</p>


        </div>


      </section>

      <section v-if="isLogged && recs.length" class="card">
        <div class="section-header">
          <h3>为你推荐</h3>
          <div class="muted">基于你的喜好</div>
        </div>
        <div class="row-scroll">
          <div v-for="w in recs" :key="w.uuid" class="tile rec-tile">
            <router-link :to="`/image/${w.uuid}`">
              <img :src="w.thumbUrl || placeholder(w.uuid)" class="thumb" />
            </router-link>
            <div class="meta">
              <div class="title">{{ w.name || '未命名' }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 推荐壁纸 -->
      <section class="card">
        <div class="section-header">
          <h3>推荐壁纸</h3>
          <div class="muted">为你精选的热门内容</div>
        </div>

        <section class="gallery">
          <div v-for="(item, idx) in items" :key="item.uuid" class="gallery-item"
            :style="{ animationDelay: `${idx * 0.05}s` }">
            <router-link :to="`/image/${item.uuid}`" class="item-link">
              <div class="item-image-wrapper">
                <img :src="item.thumbUrl || placeholder(item.uuid)" class="item-image" :alt="item.name || '壁纸'" />
                <div class="item-overlay">
                  <div class="overlay-content">
                    <svg class="overlay-icon" width="32" height="32" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 8 16 12 12 16"></polyline>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                  </div>
                </div>
              </div>

              <div class="item-info">
                <h3 class="item-title">{{ item.name || '未命名壁纸' }}</h3>
                <div class="item-meta">
                  <div class="item-likes">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                      </path>
                    </svg>
                    <span>{{ item.favorite_count ?? item.favoriteCount ?? 0 }}</span>
                  </div>
                  <div class="item-downloads">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 5v8" />
                      <path d="M8 9l4 4 4-4" />
                      <path d="M5 19h14" />
                    </svg>
                    <span>{{ item.download_count ?? item.downloadCount ?? 0 }}</span>
                  </div>
                </div>
              </div>
            </router-link>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useUserStore } from '../store/user'

export default {
  setup() {
    const userStore = useUserStore()
    const isLogged = computed(() => !!userStore.user)
    const recs = ref([])
    const items = ref([])
    const q = ref('')
    const heroImage = 'https://picsum.photos/seed/hero/800/480'

    function placeholder(id) {
      return `https://picsum.photos/seed/${id}/600/380`
    }

    async function load() {
      try {
        const res = await api.getWallpapers(1)
        items.value = res.data.items || []
      } catch (e) {
        console.error(e)
      }
    }

    async function loadRecommendations() {
      try {
        const r = await api.myRecommendations(4)
        recs.value = Array.isArray(r.data) ? r.data : []
      } catch (e) {
        recs.value = []
      }
    }

    watch(isLogged, (v) => { if (v) loadRecommendations() }, { immediate: true })

    function goSearch() {
      if (!q.value.trim()) {
        window.location.href = '/wallpapers'
        return
      }
      const url = `/wallpapers?search=${encodeURIComponent(q.value)}`
      window.location.href = url
    }

    onMounted(load)
    return { items, recs, isLogged, q, heroImage, goSearch, placeholder }
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
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0));
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 0 18px 40px rgba(11, 18, 32, .45);
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
  transition: transform .15s ease, box-shadow .2s ease
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, .35)
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
  transition: transform .3s ease
}

.thumb.large:hover {
  transform: scale(1.02)
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.row-scroll {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 8px
}

.rec-tile {
  min-width: 220px;
  flex: 0 0 auto
}

.tile {
  overflow: hidden;
  padding: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.012), transparent);
  transition: transform .25s ease, box-shadow .25s ease;
  animation: tileFadeUp .35s ease both
}

.tile:hover {
  transform: translateY(-10px) scale(1.06);
  box-shadow: 0 20px 50px rgba(11, 18, 32, 0.6);
}

@keyframes tileFadeUp {
  from {
    opacity: 0;
    transform: translateY(8px)
  }

  to {
    opacity: 1;
    transform: translateY(0)
  }
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

.gallery {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  animation: fadeIn .5s ease
}

@keyframes fadeIn {
  from {
    opacity: 0
  }

  to {
    opacity: 1
  }
}

.gallery-item {
  animation: slideUp .6s cubic-bezier(.16, 1, .3, 1) both
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px)
  }

  to {
    opacity: 1;
    transform: translateY(0)
  }
}

.item-link {
  display: block;
  text-decoration: none;
  color: inherit;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, .06);
  border-radius: 20px;
  overflow: hidden;
  transition: all .4s cubic-bezier(.16, 1, .3, 1);
  position: relative
}

.item-link:hover {
  transform: translateY(-12px);
  box-shadow: 0 24px 56px rgba(0, 0, 0, .4);
  border-color: rgba(255, 255, 255, .12)
}

.item-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16/10;
  overflow: hidden
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .6s cubic-bezier(.16, 1, .3, 1)
}

.item-link:hover .item-image {
  transform: scale(1.08)
}

.item-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(11, 18, 32, .8), transparent 50%);
  opacity: 0;
  transition: opacity .4s ease;
  display: flex;
  align-items: center;
  justify-content: center
}

.item-link:hover .item-overlay {
  opacity: 1
}

.overlay-content {
  transform: translateY(20px);
  transition: transform .4s cubic-bezier(.16, 1, .3, 1)
}

.item-link:hover .overlay-content {
  transform: translateY(0)
}

.overlay-icon {
  color: #fff;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, .4))
}

.item-info {
  padding: 20px;
  position: relative;
  z-index: 2
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden
}

.item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between
}

.item-likes,
.item-downloads {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 14px;
  transition: color .25s ease
}

.item-link:hover .item-likes,
.item-link:hover .item-downloads {
  color: var(--accent)
}

.item-likes svg,
.item-downloads svg {
  transition: transform .25s ease
}

.item-link:hover .item-likes svg,
.item-link:hover .item-downloads svg {
  transform: scale(1.1)
}

@media (max-width:980px) {
  .gallery {
    grid-template-columns: repeat(2, 1fr)
  }
}

@media (max-width:560px) {
  .gallery {
    grid-template-columns: 1fr
  }
}
</style>
