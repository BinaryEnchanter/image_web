<template>
  <div class="page">
    <section class="card list-toolbar"
      style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:12px">
      <div class="search">
        <input v-model="q" class="input" placeholder="搜索壁纸，例如：山脉、夜空" @keyup.enter="doSearch" />
        <button class="btn" @click="doSearch">搜索</button>
      </div>

      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn ghost" @click="reload">刷新</button>
        <div class="muted">共 {{ items.length }} 项</div>
      </div>
    </section>

    <section v-if="items.length === 0" class="card empty-state">
      <p>当前没有壁纸 — 你可以上传或稍后再来查看。</p>
    </section>

    <section class="grid">
      <div v-for="item in items" :key="item.uuid" class="tile card">
        <router-link :to="`/image/${item.uuid}`">
          <img :src="item.thumbUrl || placeholder(item.uuid)" class="thumb" />
        </router-link>

        <div class="meta" style="padding-top:8px;display:flex;justify-content:space-between;align-items:center">
          <div class="title">{{ item.name || '未命名' }}</div>
          <div class="fav"><span style="font-size:13px;color:var(--muted)">{{ item.favoriteCount || 0 }}</span> ❤</div>
        </div>
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
      } catch (e) { console.error(e) }
    }

    function placeholder(id) { return 'https://picsum.photos/seed/' + id + '/400/240' }

    // 修复点：使用大括号明确写出 if/else
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

    function reload() { load() }
    onMounted(load)
    return { items, q, doSearch, reload, placeholder }
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
  position: relative;
}

.card {
  background: var(--glass);
  padding: 12px;
  border-radius: 12px
}

/* 固定工具栏，避免与网格混排 */
.list-toolbar {
  position: fixed;
  top: 90px;
  /* header 高度 */
  left: 0;
  right: 0;
  z-index: 999;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(6px);
  background: rgba(11, 18, 32, 0.85);
}

.page {
  padding-top: 64px + 60px;
  /* header + search toolbar 高度 */
}

.list-toolbar .input {
  min-width: 320px
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
  font-weight: 600;
  transition: transform .15s ease, box-shadow .2s ease
}
.btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(59,130,246,.35) }

.btn.ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--text)
}

.input {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: transparent;
  color: var(--text)
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  /* 增大间距 */
  margin-top: 12px;
}

.tile {
  overflow: hidden;
  padding: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.012), transparent);
  transition: transform .25s ease, box-shadow .25s ease;
  will-change: transform;
  animation: tileFadeUp .35s ease both
}

.tile:hover {
  transform: translateY(-12px) scale(1.08);
  /* 更明显浮起 */
  box-shadow: 0 25px 60px rgba(11, 18, 32, 0.6);
}

.thumb {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-radius: 12px;
  transition: transform .25s ease
}
.tile:hover .thumb { transform: scale(1.03) }

.meta {
  padding: 10px
}

.title {
  font-weight: 600
}

.fav {
  display: flex;
  align-items: center;
  gap: 6px
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36px;
  color: var(--muted)
}

.tile:hover {
  transform: translateY(-10px) scale(1.05);
  /* 更明显浮起效果 */
  box-shadow: 0 20px 50px rgba(11, 18, 32, 0.6);
}

@keyframes tileFadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
@media (max-width:980px) {
  .grid { grid-template-columns: repeat(2, 1fr); gap: 16px }
  .thumb { height: 200px }
}

@media (max-width:560px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .thumb {
    height: 180px;
  }
}
</style>

<style scoped>
.card {
  backdrop-filter: blur(6px)
}
</style>
