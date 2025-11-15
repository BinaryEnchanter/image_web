<template>
  <div class="page">
    <div class="card upload-card">
      <h3>上传壁纸</h3>

      <div class="form" style="margin-top:12px">
        <!-- 文件选择区 -->
        <label for="fileInput" class="file-drop" @dragover.prevent @drop.prevent="onDrop">
          <input id="fileInput" type="file" ref="fileInput" class="visually-hidden" @change="onFileChange" />

          <div v-if="!preview" class="file-placeholder">
            点击或拖拽图片到此处上传（支持 jpg/png）
          </div>
          <img v-if="preview" :src="preview" class="thumb preview" />
        </label>

        <div style="display:flex;gap:12px;align-items:center;margin-top:8px">
          <input v-model="name" class="input" placeholder="名称（必填）" />
          <button class="btn ghost" @click="generateName" :disabled="aiNameLoading">AI 生成名称</button>
        </div>

        <!-- 标签输入和已选标签 -->
        <div style="margin-top:8px">
          <div class="tag-input-wrap">
            <div class="tags">
              <span v-for="(t, idx) in tagsArray" :key="t" class="tag">
                {{ t }} <button class="tag-remove" @click.prevent="removeTag(idx)">×</button>
              </span>
              <input v-model="tagInput" @keydown.enter.prevent="pushTagFromInput" @keydown.stop="onTagKeydown"
                @blur="pushTagFromInput" class="tag-input" placeholder="添加标签，按回车或逗号分隔" />
            </div>
          </div>

          <div style="display:flex;gap:8px;margin-top:8px;align-items:center">
            <button class="btn" @click="generateTags" :disabled="aiTagsLoading">AI 生成标签</button>
            <button class="btn ghost" @click="clearTags">清空标签</button>
            <div class="muted">已选择 {{ tagsArray.length }} 个标签</div>
          </div>

          <!-- AI 建议标签（不自动加入提交） -->
          <div v-if="aiSuggestions.length" class="ai-suggestions">
            <div class="ai-suggestions-title">AI 建议标签（点击“添加”加入提交标签）</div>
            <div class="ai-list">
              <div v-for="(s, i) in aiSuggestions" :key="s" class="ai-item">
                <div class="ai-tag-text">{{ s }}</div>
                <div class="ai-item-actions">
                  <button class="btn small" @click="addTagFromSuggestion(s)"
                    :disabled="tagsArray.includes(s)">添加</button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div style="display:flex;align-items:center;gap:12px;margin-top:6px">
          <label style="display:flex;align-items:center;gap:6px"><input type="checkbox" v-model="paid" /> 收费</label>
          <input v-if="paid" v-model.number="price" type="number" min="0" class="input small" placeholder="价格（金币）" />
        </div>

        <div class="actions" style="margin-top:12px;display:flex;gap:8px">
          <button class="btn" @click="upload" :disabled="uploading">上传</button>
          <button class="btn ghost" @click="reset" :disabled="uploading">重置</button>
          <div v-if="uploading" class="muted">上传中... {{ progress }}%</div>
        </div>

        <div v-if="msg" class="msg" :class="{ error: msgType === 'error' }">{{ msg }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '../api'

const fileInput = ref(null)
const name = ref('')
const tagInput = ref('')
const tagsArray = ref([]) // 最终提交的标签集合
const paid = ref(false)
const price = ref(0)
const msg = ref(null)
const msgType = ref('')
const preview = ref(null)
const uploading = ref(false)
const progress = ref(0)

// AI 相关
const aiSuggestions = ref([]) // AI 建议但未自动加入提交的标签
const aiTagsLoading = ref(false)
const aiNameLoading = ref(false)

function onDrop(e) {
  const dt = e.dataTransfer
  if (!dt) return
  const f = dt.files && dt.files[0]
  handleFileSelect(f)
}

function onFileChange(e) {
  const f = e.target.files && e.target.files[0]
  handleFileSelect(f)
}

function handleFileSelect(f) {
  if (!f) return
  if (!f.type.startsWith('image/')) {
    msg.value = '请选择图片文件（jpg/png）'
    msgType.value = 'error'
    return
  }
  // 预览
  preview.value = URL.createObjectURL(f)
  msg.value = null
}

function reset() {
  if (fileInput.value) fileInput.value.value = null
  if (preview.value) { URL.revokeObjectURL(preview.value) }
  preview.value = null
  name.value = ''
  tagInput.value = ''
  tagsArray.value = []
  aiSuggestions.value = []
  paid.value = false
  price.value = 0
  msg.value = null
  msgType.value = ''
  progress.value = 0
}

// 标签操作
function normalizeTag(t) {
  return String(t || '').trim().replace(/\s+/g, ' ')
}

function pushTag(tagRaw) {
  const t = normalizeTag(tagRaw)
  if (!t) return
  if (tagsArray.value.includes(t)) return
  tagsArray.value.push(t)
}

function pushTagFromInput() {
  if (!tagInput.value) return
  // 支持逗号分割
  const parts = tagInput.value.split(/[，,]+/).map(s => s.trim()).filter(Boolean)
  parts.forEach(p => pushTag(p))
  tagInput.value = ''
}

function onTagKeydown(e) {
  // 当按下逗号键时把当前输入作为 tag
  if (e.key === ',') {
    e.preventDefault()
    pushTagFromInput()
  }
}

function removeTag(idx) {
  tagsArray.value.splice(idx, 1)
}

function clearTags() {
  tagsArray.value = []
}

function addTagFromSuggestion(s) {
  pushTag(s)
}

// AI 生成标签 -> 向后端请求（可以上传图片以辅助生成）
async function generateTags() {
  msg.value = null
  aiSuggestions.value = []
  const f = fileInput.value?.files?.[0]
  try {
    aiTagsLoading.value = true
    // 使用 FormData 将文件发送到后端，后端返回标签数组
    const fd = new FormData()
    if (f) fd.append('image', f)
    // 也可以传入当前文本 name 或已有标签做上下文
    if (name.value) fd.append('name', name.value)

    // 假设 api.generateTags(fd) 返回 { data: ['标签1','标签2'] }
    const res = await api.generateTags(fd)
    const arr = res.data?.tags || res.data || []
    if (Array.isArray(arr)) {
      aiSuggestions.value = arr.map(a => String(a).trim()).filter(Boolean)
      if (!aiSuggestions.value.length) msg.value = 'AI 未生成标签'
    } else {
      msg.value = 'AI 返回格式错误'
      msgType.value = 'error'
    }
  } catch (e) {
    console.error(e)
    msg.value = e.response?.data?.message || '生成标签失败'
    msgType.value = 'error'
  } finally {
    aiTagsLoading.value = false
  }
}

// AI 生成名称 -> 向后端请求
async function generateName() {
  msg.value = null
  const f = fileInput.value?.files?.[0]
  try {
    aiNameLoading.value = true
    const fd = new FormData()
    if (f) fd.append('image', f)
    // 你也可以传入当前 tags 用作上下文
    if (tagsArray.value.length) fd.append('tags', tagsArray.value.join(','))
    const res = await api.generateName(fd)
    const n = res.data?.name || res.data
    if (n) name.value = String(n)
    else {
      msg.value = 'AI 未生成名称'
      msgType.value = 'error'
    }
  } catch (e) {
    console.error(e)
    msg.value = e.response?.data?.message || '生成名称失败'
    msgType.value = 'error'
  } finally {
    aiNameLoading.value = false
  }
}

// 提交上传
async function upload() {
  msg.value = null
  msgType.value = ''
  const f = fileInput.value?.files?.[0]
  if (!f) { msg.value = '请先选择文件'; msgType.value = 'error'; return }
  if (!name.value.trim()) { msg.value = '请填写名称'; msgType.value = 'error'; return }

  const fd = new FormData()
  fd.append('image', f)
  fd.append('name', name.value)
  fd.append('tags', tagsArray.value.join(','))
  fd.append('paid', paid.value ? '1' : '0')
  fd.append('price', paid.value ? String(price.value || 0) : '0')

  const jwt = localStorage.getItem('jwt_token')
  if (jwt) fd.append('jwt', jwt)

  try {
    uploading.value = true
    progress.value = 0
    const res = await api.upload(fd, {
      onUploadProgress(evt) {
        if (evt.total) progress.value = Math.round((evt.loaded / evt.total) * 100)
      }
    })
    msg.value = '上传成功'
    msgType.value = 'success'
    // 上传完成后可选择清空或保留当前状态
  } catch (e) {
    console.error(e)
    msg.value = e.response?.data?.message || '上传失败'
    msgType.value = 'error'
  } finally {
    uploading.value = false
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
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center
}

.upload-card {
  width: 100%;
  max-width: 640px;
  border-radius: 12px;
  padding: 20px;
  background: var(--glass)
}

.file-drop {
  display: block;
  border: 1px dashed rgba(255, 255, 255, 0.06);
  padding: 18px;
  border-radius: 10px;
  cursor: pointer;
  text-align: center
}

.file-placeholder {
  color: var(--muted)
}

.visually-hidden {
  display: none
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

.input.small {
  width: 120px;
  padding: 8px
}

.thumb.preview {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-radius: 8px
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center
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

.muted {
  color: var(--muted)
}

.msg {
  margin-top: 12px
}

.msg.error {
  color: #ff7b7b
}

.msg.success {
  color: #7bffb8
}

/* 标签样式 */
.tag-input-wrap {
  margin-top: 8px
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04)
}

.tag {
  background: rgba(255, 255, 255, 0.03);
  padding: 6px 8px;
  border-radius: 999px;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-size: 13px
}

.tag-remove {
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 0;
  margin-left: 4px
}

.tag-input {
  min-width: 100px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text);
  padding: 6px
}

/* AI 建议 */
.ai-suggestions {
  margin-top: 10px;
  border-top: 1px dashed rgba(255, 255, 255, 0.03);
  padding-top: 8px
}

.ai-suggestions-title {
  color: var(--muted);
  font-size: 13px;
  margin-bottom: 6px
}

.ai-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px
}

.ai-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
}

.ai-tag-text {
  font-size: 13px
}

@media (max-width:560px) {
  .upload-card {
    padding: 16px
  }

  .thumb.preview {
    height: 200px
  }
}
</style>

<style scoped>
.upload-card {
  backdrop-filter: blur(6px)
}
</style>
