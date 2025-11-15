<template>
  <div class="page">
    <div class="card upload-card">
      <h3>上传壁纸</h3>

      <div v-if="!aiModelsLoaded" class="ai-status">
        <div class="muted">AI模型加载中... 首次使用需要下载模型文件</div>
      </div>
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
          <button class="btn" @click="generateName" 
                  :disabled="aiNameLoading || !aiModelsLoaded"
                  style="white-space: nowrap">
            {{ aiNameLoading ? '生成中...' : 'AI 生成名称' }}
          </button>
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
            <button class="btn" @click="generateTags" 
                    :disabled="aiTagsLoading || !aiModelsLoaded">
              {{ aiTagsLoading ? '分析中...' : 'AI 生成标签' }}
            </button>
            <button class="btn ghost" @click="clearTags">清空标签</button>
            <div class="muted">已选择 {{ tagsArray.length }} 个标签</div>
          </div>

          <!-- AI 建议标签（不自动加入提交） -->
          <div v-if="aiSuggestions.length" class="ai-suggestions">
            <div class="ai-suggestions-title">AI 建议标签（点击"添加"加入提交标签）</div>
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
import { ref, computed, onMounted } from 'vue'  // 添加了 onMounted
import api from '../api'
import aiRecognition from '../utils/ai-recognition'

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
const aiSuggestions = ref([])
const aiTagsLoading = ref(false)
const aiNameLoading = ref(false)
const aiModelsLoaded = ref(false)

onMounted(async () => {
  try {
    msg.value = '正在加载AI模型...'
    aiModelsLoaded.value = await aiRecognition.init()
    if (aiModelsLoaded.value) {
      msg.value = 'AI模型加载完成'
      setTimeout(() => { msg.value = null }, 2000)
    } else {
      msg.value = 'AI模型加载失败，将使用备用方案'
      msgType.value = 'error'
    }
  } catch (error) {
    console.error('AI模型初始化错误:', error)
    msg.value = 'AI模型初始化失败'
    msgType.value = 'error'
  }
})

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

// AI 生成标签 -> 使用前端AI识别
async function generateTags() {
  msg.value = null
  aiSuggestions.value = []
  const f = fileInput.value?.files?.[0]
  
  if (!f) {
    msg.value = '请先选择图片文件'
    msgType.value = 'error'
    return
  }

  if (!aiModelsLoaded.value) {
    msg.value = 'AI模型未就绪，请稍后重试'
    msgType.value = 'error'
    return
  }

  try {
    aiTagsLoading.value = true
    msg.value = 'AI正在分析图片...'
    
    // 使用本地AI识别
    const results = await aiRecognition.recognizeFromFile(f)
    const suggestedTags = aiRecognition.generateTagsFromResults(results)
    
    aiSuggestions.value = suggestedTags
    
    if (suggestedTags.length === 0) {
      msg.value = 'AI未能识别出明显特征'
    } else {
      msg.value = `AI生成了 ${suggestedTags.length} 个标签建议`
      msgType.value = 'success'
      setTimeout(() => { msg.value = null }, 3000)
    }
    
  } catch (error) {
    console.error('AI标签生成失败:', error)
    msg.value = 'AI分析失败，请重试或手动输入标签'
    msgType.value = 'error'
  } finally {
    aiTagsLoading.value = false
  }
}

// AI 生成名称 -> 使用前端AI识别
async function generateName() {
  msg.value = null
  const f = fileInput.value?.files?.[0]
  
  if (!f) {
    msg.value = '请先选择图片文件'
    msgType.value = 'error'
    return
  }

  if (!aiModelsLoaded.value) {
    msg.value = 'AI模型未就绪，请稍后重试'
    msgType.value = 'error'
    return
  }

  try {
    aiNameLoading.value = true
    msg.value = 'AI正在生成名称...'
    
    // 使用本地AI识别
    const results = await aiRecognition.recognizeFromFile(f)
    const suggestedName = aiRecognition.generateNameFromResults(results)
    
    name.value = suggestedName
    msg.value = 'AI名称生成完成'
    msgType.value = 'success'
    setTimeout(() => { msg.value = null }, 3000)
    
  } catch (error) {
    console.error('AI名称生成失败:', error)
    msg.value = 'AI名称生成失败，请手动输入'
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

<style scoped>
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
  background: var(--glass);
  backdrop-filter: blur(6px)
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