<template>
  <div class="page">
    <!-- 顶部工具栏 -->
    <section class="toolbar">
      <div class="toolbar-content">
        <div class="search-wrapper">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input v-model="q" class="search-input" placeholder="搜索壁纸，例如：山脉、夜空、城市..." @keyup.enter="doSearch" />
          <button class="search-btn" @click="doSearch">
            <span>搜索</span>
          </button>
        </div>

        <div class="toolbar-actions">
          <button class="icon-btn" @click="reload" title="刷新">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </button>
          <div class="count-badge">
            <span class="count-number">{{ items.length }}</span>
            <span class="count-label">壁纸</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 空状态 -->
    <section v-if="items.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </div>
      <h3 class="empty-title">暂无壁纸</h3>
      <p class="empty-text">当前没有找到壁纸，你可以上传新壁纸或稍后再来查看</p>
    </section>

    <!-- 壁纸网格 -->
    <section v-else class="gallery">
      <div v-for="(item, idx) in items" :key="item.uuid" class="gallery-item"
        :style="{ animationDelay: `${idx * 0.05}s` }">
        <router-link :to="`/image/${item.uuid}`" class="item-link">
          <div class="item-image-wrapper">
            <img :src="item.thumbUrl || placeholder(item.uuid)" class="item-image" :alt="item.name || '壁纸'" />
            <div class="item-overlay">
              <div class="overlay-content">
                <svg class="overlay-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2">
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
  </div>
</template>

<script>
import api from '../api'
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const items = ref([])
    const q = ref('')

    async function load() {
      try {
        const res = await api.getWallpapers(1)
        items.value = res.data.items || []
      } catch (e) {
        console.error(e)
      }
    }

    function placeholder(id) {
      return 'https://picsum.photos/seed/' + id + '/600/400'
    }

    function doSearch() {
      if (q.value.trim()) {
        search(q.value)
      } else {
        load()
      }
    }

    async function search(term) {
      try {
        const r = await api.search(term, 1)
        items.value = r.data.items || []
      } catch (e) {
        console.error(e)
      }
    }

    function reload() {
      load()
    }

    onMounted(load)

    return {
      items,
      q,
      doSearch,
      reload,
      placeholder
    }
  }
}
</script>

<style>
:root {
  --bg-primary: #0a0e1a;
  --bg-secondary: #0f1420;
  --bg-tertiary: #151b2b;
  --accent-primary: #3b82f6;
  --accent-secondary: #60a5fa;
  --accent-glow: rgba(59, 130, 246, 0.4);
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border-subtle: rgba(255, 255, 255, 0.06);
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 20px 48px rgba(0, 0, 0, 0.5);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.page {
  min-height: 100vh;
  padding-top: 140px;
  padding-bottom: 80px;
}

/* ========== 工具栏 ========== */
.toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 20px 24px;
  background: rgba(10, 14, 26, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border-subtle);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.toolbar-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.search-wrapper {
  flex: 1;
  max-width: 600px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 4px 4px 4px 16px;
  transition: all 0.3s ease;
}

.search-wrapper:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  background: var(--bg-secondary);
}

.search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 15px;
  padding: 10px 8px;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-btn {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--accent-glow);
}

.search-btn:active {
  transform: translateY(0);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.25s ease;
}

.icon-btn:hover {
  background: var(--glass-border);
  color: var(--text-primary);
  transform: rotate(180deg);
  border-color: var(--glass-border);
}

.count-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--glass-bg);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
}

.count-number {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-secondary);
}

.count-label {
  font-size: 13px;
  color: var(--text-muted);
}

/* ========== 空状态 ========== */
.empty-state {
  max-width: 400px;
  margin: 120px auto;
  text-align: center;
  padding: 48px 24px;
  background: var(--glass-bg);
  border: 1px solid var(--border-subtle);
  border-radius: 24px;
  backdrop-filter: blur(10px);
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.05));
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 20px;
  color: var(--accent-secondary);
}

.empty-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.empty-text {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ========== 画廊网格 ========== */
.gallery {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 28px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.gallery-item {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.item-link {
  display: block;
  text-decoration: none;
  color: inherit;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.item-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(96, 165, 250, 0.02));
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 1;
  pointer-events: none;
}

.item-link:hover {
  transform: translateY(-12px);
  border-color: var(--glass-border);
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.1);
}

.item-link:hover::before {
  opacity: 1;
}

.item-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.item-link:hover .item-image {
  transform: scale(1.08);
}

.item-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10, 14, 26, 0.8), transparent 50%);
  opacity: 0;
  transition: opacity 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-link:hover .item-overlay {
  opacity: 1;
}

.overlay-content {
  transform: translateY(20px);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.item-link:hover .overlay-content {
  transform: translateY(0);
}

.overlay-icon {
  color: white;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

.item-info {
  padding: 20px;
  position: relative;
  z-index: 2;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-likes, .item-downloads {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-muted);
    font-size: 14px;
    transition: color 0.25s ease;
  }

.item-link:hover .item-likes, .item-link:hover .item-downloads {
    color: #ef4444;
  }

.item-likes svg, .item-downloads svg {
    transition: transform 0.25s ease;
  }

.item-link:hover .item-likes svg, .item-link:hover .item-downloads svg {
    transform: scale(1.1);
  }

/* ========== 响应式 ========== */
@media (max-width: 1200px) {
  .gallery {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .page {
    padding-top: 120px;
  }

  .toolbar {
    padding: 16px;
  }

  .toolbar-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .search-wrapper {
    max-width: 100%;
  }

  .toolbar-actions {
    justify-content: space-between;
  }

  .gallery {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    padding: 0 16px;
  }

  .item-info {
    padding: 16px;
  }

  .count-badge {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .gallery {
    grid-template-columns: 1fr;
  }

  .search-wrapper {
    padding: 4px 4px 4px 12px;
  }

  .search-input {
    font-size: 14px;
  }

  .search-btn {
    padding: 10px 20px;
    font-size: 13px;
  }
}
</style>