<template>
  <div class="page">
    <div class="card upload-card">
      <h3>上传壁纸</h3>

      <div class="form" style="margin-top:12px">
        <!-- 使用 for + id 方式避免双重触发文件选择对话框 -->
        <label for="fileInput" class="file-drop" @dragover.prevent @drop.prevent="onDrop">
          <input id="fileInput" type="file" ref="fileInput" class="visually-hidden" @change="onFileChange" />

          <div v-if="!preview" class="file-placeholder">
            点击或拖拽图片到此处上传（支持 jpg/png）
          </div>
          <img v-if="preview" :src="preview" class="thumb preview" />
        </label>

        <input v-model="name" class="input" placeholder="名称（必填）" />
        <input v-model="tags" class="input" placeholder="标签，逗号分隔（可选）" />

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
import { ref } from 'vue'
import api from '../api'

const fileInput = ref(null)
const name = ref('')
const tags = ref('')
const paid = ref(false)
const price = ref(0)
const msg = ref(null)
const msgType = ref('')
const preview = ref(null)
const uploading = ref(false)
const progress = ref(0)

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
  // 不要清空 input，这样后续上传不会重复触发选择
  preview.value = URL.createObjectURL(f)
  msg.value = null
}

function reset() {
  // 清除文件选择但不触发文件对话框
  if (fileInput.value) fileInput.value.value = null
  if (preview.value) { URL.revokeObjectURL(preview.value) }
  preview.value = null
  name.value = ''
  tags.value = ''
  paid.value = false
  price.value = 0
  msg.value = null
  msgType.value = ''
  progress.value = 0
}

async function upload() {
  msg.value = null
  msgType.value = ''
  const f = fileInput.value?.files?.[0]
  if (!f) { msg.value = '请先选择文件'; msgType.value = 'error'; return }
  if (!name.value.trim()) { msg.value = '请填写名称'; msgType.value = 'error'; return }

  const fd = new FormData()
  fd.append('image', f)
  fd.append('name', name.value)
  fd.append('tags', tags.value)
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
