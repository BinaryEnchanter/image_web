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
          <p><strong>标签:</strong>{{ item.tags || '无' }}</p>
          <p><strong>文件大小:</strong>{{ formatSize(item.size) }}</p>
          <p><strong>下载次数:</strong>{{ item.download_count || 0 }}</p>
          <p><strong>收藏次数:</strong>{{ item.favorite_count || 0 }}</p>
          <p v-if="item.price_cents > 0"><strong>价格:</strong>{{ item.price_cents }} coins</p>
          <div class="actions">
            <button class="btn" @click="download">下载</button>
            <button class="btn ghost" @click="toggleFavorite" :disabled="favoriteLoading">
              {{ isFavorit ? '💔 取消收藏' : '❤ 收藏' }}
            </button>

            <!-- 撤回按钮:只有 uploader 或管理员可见 -->
            <button v-if="canRevoke" class="btn danger" @click="revokeUpload">
              撤回上传
            </button>
          </div>

          <div v-if="message" style="margin-top:10px;color:var(--muted)">{{ message }}</div>
        </div>
      </div>
      <div class="comments">
        <h3>评论</h3>
        <div class="comment-form" style="display:flex;gap:8px;align-items:flex-start;margin-top:8px">
          <textarea v-model="commentText" class="input" placeholder="发表你的评论" style="flex:1;min-height:80px"></textarea>
          <button class="btn" @click="submitComment"
            :disabled="addingComment || !commentText || !userStore.user">发表</button>
        </div>
        <div v-if="!userStore.user" class="muted" style="margin-top:6px">请登录后发表评论</div>
        <div v-if="loadingComments" class="muted" style="margin-top:8px">加载评论中...</div>
        <div v-else class="comments-scroll">
          <div v-if="comments.length === 0" class="muted">暂无评论</div>
          <div v-else>
            <div class="comment-item" v-for="c in displayComments" :key="c.id"
              :style="{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,.06)', marginLeft: (c.depth * 20) + 'px' }">
              <div class="row" style="display:flex;gap:8px;align-items:center;justify-content:space-between">
                <div class="author" style="font-weight:600">{{ c.username || '匿名' }}</div>
                <div class="time" style="color:var(--muted);font-size:12px">{{ formatTime(c.created_at) }}</div>
              </div>
              <div class="content" style="margin:6px 0">{{ c.content }}</div>
              <div class="actions" style="display:flex;gap:8px">
                <button class="btn ghost" @click="likeComment(c.id)" :disabled="likingMap[c.id]">👍 {{ c.like_count
                  }}</button>
                <button class="btn ghost" @click="dislikeComment(c.id)" :disabled="dislikingMap[c.id]">👎 {{
                  c.dislike_count }}</button>
                <button class="btn ghost" @click="toggleReply(c.id)">回复</button>
                <button v-if="canDeleteComment(c)" class="btn danger" @click="deleteComment(c.id)">删除</button>
              </div>
              <div v-if="showReply[c.id]" style="margin-top:8px;display:flex;gap:8px">
                <textarea v-model="replyTextMap[c.id]" class="input" placeholder="回复内容"
                  style="flex:1;min-height:60px"></textarea>
                <button class="btn" @click="submitReply(c.id)"
                  :disabled="replyingMap[c.id] || !replyTextMap[c.id]">发送</button>
              </div>
            </div>
            <div class="pager" style="display:flex;gap:8px;align-items:center;margin-top:8px">
              <button class="btn ghost" @click="prevCommentsPage" :disabled="cPage <= 1">上一页</button>
              <div class="muted">第 {{ cPage }} 页</div>
              <button class="btn ghost" @click="nextCommentsPage" :disabled="comments.length < cSize">下一页</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import api from '../api'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const item = ref(null)
const loading = ref(true)
const message = ref('')
const userStore = useUserStore()
const isFavorit = ref(false)
const favoriteLoading = ref(false)
const comments = ref([])
const cPage = ref(1)
const cSize = ref(20)
const cTotal = ref(0)
const loadingComments = ref(false)
const commentText = ref('')
const addingComment = ref(false)
const showReply = ref({})
const replyTextMap = ref({})
const replyingMap = ref({})
const likingMap = ref({})
const dislikingMap = ref({})
const displayComments = ref([])

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

function formatTime(t) {
  try { return new Date(t).toLocaleString() } catch { return String(t) }
}

function buildTree(items) {
  const byId = new Map()
  const roots = []
  items.forEach(i => byId.set(i.id, { ...i, children: [] }))
  byId.forEach(n => {
    if (n.parent_id) {
      const p = byId.get(n.parent_id)
      if (p) p.children.push(n); else roots.push(n)
    } else {
      roots.push(n)
    }
  })
  const sortFn = (a, b) => new Date(b.created_at) - new Date(a.created_at)
  const sortRec = arr => { arr.sort(sortFn); arr.forEach(ch => sortRec(ch.children)) }
  sortRec(roots)
  return roots
}

function flattenTree(nodes, depth = 0, acc = []) {
  nodes.forEach(n => {
    acc.push({ ...n, depth })
    if (n.children && n.children.length) flattenTree(n.children, depth + 1, acc)
  })
  return acc
}

// 更新评论树的辅助函数
function updateCommentsTree() {
  const tree = buildTree(comments.value)
  displayComments.value = flattenTree(tree)
}

async function loadComments() {
  loadingComments.value = true
  try {
    const r = await api.listComments(id, cPage.value, cSize.value)
    const data = r.data
    comments.value = Array.isArray(data.items) ? data.items : []
    cTotal.value = data.total || 0
    updateCommentsTree()
  } catch (e) {
    comments.value = []
    displayComments.value = []
  } finally {
    loadingComments.value = false
  }
}

async function submitComment() {
  const text = String(commentText.value || '').trim()
  if (!text) return
  addingComment.value = true
  try {
    const r = await api.addComment(id, text, null)
    const newId = r?.data?.id
    const newItem = {
      id: newId || Math.random(),
      content: text,
      like_count: 0,
      dislike_count: 0,
      parent_id: null,
      created_at: new Date().toISOString(),
      username: userStore.user?.username || ''
    }
    // 直接在前端添加新评论,无需重新加载
    comments.value = [newItem, ...comments.value]
    updateCommentsTree()
    commentText.value = ''
  } catch (e) {
    alert(e.response?.data?.error || '发表评论失败')
  } finally {
    addingComment.value = false
  }
}

function toggleReply(id) {
  showReply.value[id] = !showReply.value[id]
}

async function submitReply(parentId) {
  const text = String(replyTextMap.value[parentId] || '').trim()
  if (!text) return
  replyingMap.value[parentId] = true
  try {
    const r = await api.addComment(id, text, parentId)
    const newId = r?.data?.id
    const newItem = {
      id: newId || Math.random(),
      content: text,
      like_count: 0,
      dislike_count: 0,
      parent_id: parentId,
      created_at: new Date().toISOString(),
      username: userStore.user?.username || ''
    }
    // 直接在前端添加回复,无需重新加载
    comments.value = [newItem, ...comments.value]
    updateCommentsTree()
    replyTextMap.value[parentId] = ''
    showReply.value[parentId] = false
  } catch (e) {
    alert(e.response?.data?.error || '回复失败')
  } finally {
    replyingMap.value[parentId] = false
  }
}

async function likeComment(cid) {
  if (likingMap.value[cid]) return
  likingMap.value[cid] = true

  // 乐观更新UI
  const c = comments.value.find(x => x.id === cid)
  if (c) c.like_count = (c.like_count || 0) + 1
  const d = displayComments.value.find(x => x.id === cid)
  if (d) d.like_count = (d.like_count || 0) + 1

  try {
    await api.likeComment(cid)
  } catch (e) {
    // 如果失败,回滚UI更新
    if (c) c.like_count = (c.like_count || 1) - 1
    if (d) d.like_count = (d.like_count || 1) - 1
    alert('点赞失败')
  } finally {
    likingMap.value[cid] = false
  }
}

async function dislikeComment(cid) {
  if (dislikingMap.value[cid]) return
  dislikingMap.value[cid] = true

  // 乐观更新UI
  const c = comments.value.find(x => x.id === cid)
  if (c) c.dislike_count = (c.dislike_count || 0) + 1
  const d = displayComments.value.find(x => x.id === cid)
  if (d) d.dislike_count = (d.dislike_count || 0) + 1

  try {
    await api.dislikeComment(cid)
  } catch (e) {
    // 如果失败,回滚UI更新
    if (c) c.dislike_count = (c.dislike_count || 1) - 1
    if (d) d.dislike_count = (d.dislike_count || 1) - 1
    alert('点踩失败')
  } finally {
    dislikingMap.value[cid] = false
  }
}

function canDeleteComment(c) {
  const u = userStore.user
  if (!u) return false
  if (u.role === 'admin' || u.isAdmin) return true
  return !!(u.username && c.username && u.username === c.username)
}

async function deleteComment(cid) {
  if (!confirm('确定删除该评论?')) return
  try {
    await api.deleteComment(cid)
    // 直接从前端移除评论,无需重新加载
    comments.value = comments.value.filter(c => c.id !== cid)
    updateCommentsTree()
  } catch (e) {
    alert(e.response?.data?.error || '删除失败')
  }
}

function prevCommentsPage() {
  if (cPage.value > 1) {
    cPage.value--
    loadComments()
  }
}

function nextCommentsPage() {
  cPage.value++
  loadComments()
}

const canRevoke = computed(() => {
  const jwt = getJwt()
  if (!jwt || !item.value) return false
  try {
    const curUser = JSON.parse(localStorage.getItem('current_user') || '{}')
    if (curUser && curUser.uuid && item.value.owner_uuid && curUser.uuid === item.value.owner_uuid) return true
    if (curUser && curUser.isAdmin) return true
  } catch (e) {
    console.log("revoke check err ", e)
  }
  return false
})

async function load() {
  loading.value = true
  message.value = ''
  try {
    const r = await api.detail(id)
    item.value = r.data
    isFavorit.value = item.value.favorite
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

    const curUser = JSON.parse(localStorage.getItem('current_user') || '{}')
    const isOwner = item.value.owner_uuid === curUser.uuid
    const checkRes = await api.checkPurchase(id)
    const purchased = checkRes.data.purchased

    if (!purchased && !isOwner) {
      const price = item.value?.price_cents || 0
      const confirmMsg = price > 0
        ? `本壁纸价格 ${price} coins,是否确认购买?`
        : `本壁纸免费,但仍需"购买"以记录。是否继续?`
      if (!confirm(confirmMsg)) return

      const buyRes = await api.buyWallpaper(id)
      if (!(buyRes.data && buyRes.data.ok)) {
        alert('购买失败:' + (buyRes.data.error || JSON.stringify(buyRes.data)))
        return
      }
      alert('购买成功!')
    }

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

    // 只更新下载次数,不重新加载整个页面
    if (item.value) {
      item.value.download_count = (item.value.download_count || 0) + 1
    }
    await userStore.load()
  } catch (e) {
    console.error(e)
    alert('下载失败:' + (e.response?.data?.error || e.message))
  }
}

async function toggleFavorite() {
  const jwt = getJwt()
  if (!jwt) {
    alert('请先登录')
    return
  }

  if (favoriteLoading.value) return
  favoriteLoading.value = true

  try {
    const currentFavoriteState = isFavorit.value

    if (currentFavoriteState) {
      await api.unfavorite(id, jwt)
      // 乐观更新UI
      isFavorit.value = false
      if (item.value) {
        item.value.favorite = false
        item.value.favorite_count = Math.max(0, (item.value.favorite_count || 0) - 1)
      }
    } else {
      await api.favorite(id, jwt)
      // 乐观更新UI
      isFavorit.value = true
      if (item.value) {
        item.value.favorite = true
        item.value.favorite_count = (item.value.favorite_count || 0) + 1
      }
    }
  } catch (err) {
    console.log(err)
    alert(err.response?.data?.error || '操作失败')
    // 如果失败,重新加载以恢复正确状态
    await load()
  } finally {
    favoriteLoading.value = false
  }
}

async function revokeUpload() {
  if (!confirm('确定撤回此上传?文件将从服务器移除,数据库记录也会删除,此操作不可恢复!')) return
  try {
    const jwt = getJwt()
    await api.deleteWallpaper(id, jwt)
    alert('撤回成功')
    router.push('/me')
  } catch (e) {
    console.error('revoke error', e)
    alert('撤回失败:' + (e.response?.data?.error || e.message))
  }
}

onMounted(() => {
  load()
  loadComments()
})
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
  background: var(--glass);
  border: 1px solid rgba(255, 255, 255, .06);
  box-shadow: 0 20px 60px rgba(2, 6, 23, .7);
  animation: cardIn .3s ease both
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
  box-shadow: 0 8px 30px rgba(11, 18, 32, .6);
  transition: transform .3s ease, box-shadow .3s ease
}

.thumb.large:hover {
  transform: scale(1.02);
  box-shadow: 0 18px 50px rgba(11, 18, 32, .7)
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
  font-weight: 600;
  transition: transform .15s ease, box-shadow .2s ease
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, .35)
}

.btn.ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--text)
}

.btn.danger {
  background: #ef4444
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(8px)
  }

  to {
    opacity: 1;
    transform: translateY(0)
  }
}
.comments { margin-top:16px }
.comments-scroll { max-height:420px; overflow:auto; padding-right:4px }
.comment-item { word-break: break-word }
.comment-form .input { resize: vertical; max-height:160px }
</style>
