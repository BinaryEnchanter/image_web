<template>
    <div id="chat-widget">
        <!-- 悬浮按钮 -->
        <button class="fab" @click="toggleChat" :title="open ? '关闭 AI 助手' : '打开 AI 助手'">
            <span v-if="!open">AI</span>
            <span v-else>×</span>
        </button>

        <!-- 聊天面板 -->
        <transition name="fade">
            <div v-if="open" class="panel" @click.stop>
                <div class="header">
                    <strong>AI 助手</strong>
                    <button class="mini" @click="open = false">关闭</button>
                </div>

                <div class="msgs" ref="msgsContainer">
                    <div v-for="(m, i) in msgs" :key="i" :class="['msg', m.role]">
                        <div class="bubble">{{ m.content }}</div>
                    </div>
                </div>

                <div class="input-row">
                    <input v-model="text" @keyup.enter="send" placeholder="请输入你的问题（回车发送）" />
                    <button @click="send">发送</button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import api from '../api' // 你的 axios 封装

const open = ref(false)
const text = ref('')
const msgs = ref([])  // ✅ 确保是数组
const msgsContainer = ref(null)

function toggleChat() {
    open.value = !open.value
    if (open.value) scrollBottom()
}

async function send() {
    const content = text.value.trim()
    if (!content) return

    // ✅ 用户消息
    msgs.value.push({ role: 'user', content })
    text.value = ''
    await scrollBottom()

    try {
        // 调用后端 API
        const res = await api.aichat(content)
        const reply = res?.data?.reply || '抱歉，AI 没有返回内容。'

        // ✅ AI 回复
        msgs.value.push({ role: 'assistant', content: reply })
    } catch (err) {
        console.error('AI Chat Error:', err)
        msgs.value.push({ role: 'assistant', content: 'AI 服务暂时不可用，请稍后再试。' })
    } finally {
        await scrollBottom()
    }
}

// 自动滚动到底
async function scrollBottom() {
    await nextTick()
    const el = msgsContainer.value
    if (el) el.scrollTop = el.scrollHeight
}
</script>

<style scoped>
#chat-widget {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 2000;
}

.fab {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #3b82f6;
    color: #fff;
    border: none;
    box-shadow: 0 8px 20px rgba(0, 0, 0, .35);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    cursor: pointer;
}

.panel {
    width: 340px;
    height: 420px;
    background: linear-gradient(180deg, #071021, #0b1220);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 10px;
    color: #e6eef6;
    box-shadow: 0 20px 60px rgba(2, 6, 23, .7);
    transform-origin: bottom right;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.msgs {
    height: 320px;
    overflow: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.msg.user .bubble {
    align-self: flex-end;
    background: #0ea5a0;
    color: #041014;
    padding: 8px 10px;
    border-radius: 10px;
}

.msg.assistant .bubble {
    align-self: flex-start;
    background: rgba(255, 255, 255, 0.05);
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.input-row {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.input-row input {
    flex: 1;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.04);
    background: transparent;
    color: inherit;
}

.input-row button {
    padding: 8px 12px;
    border-radius: 8px;
    background: #3b82f6;
    color: #fff;
    border: none;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.18s;
}

.fade-enter-from {
    transform: translateY(10px);
    opacity: 0;
}
</style>
