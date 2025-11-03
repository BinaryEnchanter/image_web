<template>
  <div class="page">
    <section class="card detail-card">
      <div v-if="loading" class="loading">正在加载壁纸信息...</div>

      <div v-else-if="!item" class="loading">壁纸未找到或无法加载。</div>

      <div v-else class="detail-content">
        <div class="image-wrap">
          <img :src="item.original_path || placeholder(item.uuid)" class="thumb large" />
        </div>

        <div class="info">
          <h3>{{ item.name || '未命名壁纸' }}</h3>
          <p><strong>标签：</strong>{{ item.tags || '无' }}</p>
          <p><strong>文件大小：</strong>{{ formatSize(item.size) }}</p>
          <p><strong>下载次数：</strong>{{ item.download_count || 0 }}</p>
          <p><strong>收藏次数：</strong>{{ item.favorite_count || 0 }}</p>
          <p v-if="item.price_cents > 0"><strong>价格：</strong>{{ item.price_cents }} coins</p>
          <div class="actions">
            <button class="btn" @click="download">下载</button>
            <button class="btn ghost" @click="onFavorite">❤ 收藏</button>

            <!-- 撤回按钮：只有 uploader 或管理员可见 -->
            <button v-if="canRevoke" class="btn danger" @click="revokeUpload">
              撤回上传
            </button>
          </div>

          <div v-if="message" style="margin-top:10px;color:var(--muted)">{{ message }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import api from '../api'
import { ref, onMounted, computed, } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const item = ref(null)
const loading = ref(true)
const message = ref('')
const userStore = useUserStore()

function placeholder(id) {
  return 'https://picsum.photos/seed/' + id + '/800/600'
}

function formatSize(size) {
  if (!size) return '未知'
  const kb = size / 1024
  if (kb < 1024) return kb.toFixed(1) + ' KB'
  return (kb / 1024).toFixed(1) + ' MB'
}

function getJwt() {
  return localStorage.jwt_token || null
}

/**
 * canRevoke: 只有在当前登录用户是 owner（owner_uuid）或是管理员才为 true。
 * 说明：后端 detail 接口必须在返回体中包含 owner_uuid（上传者 UUID）
 *       如果后端在 JWT 中也包含角色（例如 role=admin），可以使用它；
 *       否则后端应在删除接口再二次校验权限（必须后端再次验证）。
 */
const canRevoke = computed(() => {
  const jwt = getJwt()
  if (!jwt || !item.value) return false
  // 我们 keep simple front-side check: compare stored user.uuid in localStorage (if you store it) with owner
  // 更安全的权限校验必须在后端实现（前端仅用于 UI 控制）
  try {
    // if you store current user info in localStorage (recommended), use it:
    const curUser = JSON.parse(localStorage.getItem('current_user') || '{}')
    if (curUser && curUser.uuid && item.value.owner_uuid && curUser.uuid === item.value.owner_uuid) return true
    // optionally if we store isAdmin flag:
    if (curUser && curUser.isAdmin) return true
    console.log("here")
  } catch (e) {
    // ignore parse errors
    console.log("revoke check err ", e)
  }
  console.log("This user can't revoke this image")
  return false
})

async function load() {
  loading.value = true
  message.value = ''
  try {
    const r = await api.detail(id)
    // 期望 backend 返回 JSON 中包含:
    // { uuid, name, tags, size, download_count, favorite_count, thumb_url, original_path, owner_uuid, ... }
    item.value = r.data
  } catch (e) {
    console.error('load detail error', e)
    item.value = null
    message.value = '加载失败'
  } finally {
    loading.value = false
  }
}

async function download() {
  try {
    const jwt = getJwt()
    if (!jwt) {
      alert('请先登录后再下载/购买')
      return
    }

    // 1. 检查是否已购买
    const checkRes = await api.checkPurchase(id)
    const purchased = checkRes.data.purchased
    if (!purchased) {
      // not purchased -> prompt to buy
      const price = item.value?.price_cents || 0
      const confirmMsg = price > 0
        ? `本壁纸价格 ${price} coins，是否确认购买？`
        : `本壁纸免费，但仍需“购买”以记录。是否继续？`
      if (!confirm(confirmMsg)) return

      // 2. call buy endpoint
      const buyRes = await api.buyWallpaper(id)
      if (!(buyRes.data && buyRes.data.ok)) {
        alert('购买失败：' + (buyRes.data.error || JSON.stringify(buyRes.data)))
        return
      }
      alert('购买成功！')
    }

    // 3. 已购买（或刚购买），调用 download
    const r = await api.download(id)
    const url = r.data.download_url
    const res = await fetch(url)
    if (!res.ok) throw new Error('下载失败: ' + res.status)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = blobUrl
    const ext = (item.value?.original_path || '').split('.').pop() || 'jpg'
    a.download = (item.value?.name || 'wallpaper') + '.' + ext
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl)

    // reload stats
    await load()
    await userStore.load()
  } catch (e) {
    console.error(e)
    alert('下载失败：' + (e.response?.data?.error || e.message))
  }
}


async function onFavorite() {
  try {
    const jwt = getJwt()
    await api.favorite(id, jwt) // api.favorite 会把 jwt 放到 Authorization header
    alert('已收藏！')
    await load()
  } catch (e) {
    console.error(e)
    alert('收藏失败：' + (e.response?.data || e.message))
  }
}

async function revokeUpload() {
  if (!confirm('确定撤回此上传？文件将从服务器移除，数据库记录也会删除，此操作不可恢复！')) return
  try {
    const jwt = getJwt()
    await api.deleteWallpaper(id, jwt)
    alert('撤回成功')
    // 跳回我的作品页或列表页
    router.push('/me') // 或者 '/my-wallpapers'
  } catch (e) {
    console.error('revoke error', e)
    alert('撤回失败：' + (e.response?.data?.error || e.message))
  }
}

onMounted(load)
</script>

<style>
/* 保持你的样式不变，略去重复样式以便更清晰 */
:root {
  --bg: #0f1724;
  --glass: rgba(255, 255, 255, 0.03);
  --accent: #3b82f6;
  --muted: #9aa4b2;
  --text: #e6eef6
}

.page {
  min-height: 60vh;
  padding: 24px;
  display: flex;
  justify-content: center
}

.detail-card {
  max-width: 900px;
  width: 100%;
  padding: 24px;
  border-radius: 12px;
  background: var(--glass)
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--muted)
}

.detail-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  flex-wrap: wrap
}

.image-wrap {
  flex: 1 1 55%
}

.thumb.large {
  width: 100%;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 4px 20px rgba(0, 0, 0, .3)
}

.info {
  flex: 1 1 40%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text)
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px
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
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--text)
}

.btn.danger {
  background: #ef4444
}
</style>
