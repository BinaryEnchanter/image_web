<!-- src/pages/Admin.vue -->
<template>
    <div class="page">
        <section class="card admin-card">
            <h3>用户角色管理</h3>
            <div class="form">
                <input v-model="targetUuid" class="input" placeholder="用户 UUID" />
                <input v-model="roleInput" class="input" placeholder="角色（示例：admin 或 user）" />
                <div class="actions">
                    <button class="btn" @click="setRole" :disabled="loadingRole">设置角色</button>
                    <div v-if="msgRole" class="muted">{{ msgRole }}</div>
                </div>
            </div>
        </section>

        <section class="card admin-card">
            <h3>用户行为日志</h3>
            <div class="form">
                <input v-model="logsUuid" class="input" placeholder="用户 UUID" />
                <div class="row">
                    <input v-model.number="page" class="input small" type="number" min="1" placeholder="页码" />
                    <input v-model.number="size" class="input small" type="number" min="1" placeholder="每页数量" />
                    <button class="btn" @click="loadLogs" :disabled="loadingLogs">查询</button>
                </div>
            </div>

            <div v-if="loadingLogs" class="muted" style="margin-top:8px">加载中...</div>
            <div v-else>
                <div v-if="logs.length === 0" class="empty-state">暂无日志</div>
                <table class="table" v-else>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Action</th>
                            <th>Target UUID</th>
                            <th>Meta</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in logs" :key="row.id">
                            <td>{{ row.id }}</td>
                            <td>{{ row.action }}</td>
                            <td>{{ row.target_uuid }}</td>
                            <td>{{ formatMeta(row.meta) }}</td>
                            <td>{{ formatTime(row.created_at) }}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="pager">
                    <button class="btn ghost" @click="prevPage" :disabled="page <= 1">上一页</button>
                    <div class="muted">第 {{ page }} 页</div>
                    <button class="btn ghost" @click="nextPage" :disabled="logs.length < size">下一页</button>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'

const targetUuid = ref('')
const roleInput = ref('')
const loadingRole = ref(false)
const msgRole = ref('')

const logsUuid = ref('')
const page = ref(1)
const size = ref(20)
const logs = ref([])
const loadingLogs = ref(false)

async function setRole() {
    msgRole.value = ''
    if (!targetUuid.value || !roleInput.value) { msgRole.value = '请输入 UUID 和角色'; return }
    try {
        loadingRole.value = true
        const r = await api.adminSetRole(targetUuid.value, String(roleInput.value).toLowerCase())
        msgRole.value = r.data && r.data.ok ? '设置成功' : '设置失败'
    } catch (e) {
        msgRole.value = e.response?.data?.error || '请求失败'
    } finally {
        loadingRole.value = false
    }
}

async function loadLogs() {
    if (!logsUuid.value) return
    try {
        loadingLogs.value = true
        const r = await api.adminGetUserLogs(logsUuid.value, page.value, size.value)
        logs.value = Array.isArray(r.data?.items) ? r.data.items : []
    } catch (e) {
        logs.value = []
    } finally {
        loadingLogs.value = false
    }
}

function prevPage() { if (page.value > 1) { page.value--; loadLogs() } }
function nextPage() { page.value++; loadLogs() }

function formatMeta(m) { return typeof m === 'string' ? m : JSON.stringify(m) }
function formatTime(t) { try { return new Date(t).toLocaleString() } catch { return String(t) } }
</script>

<style>
:root {
    --glass: rgba(255, 255, 255, 0.03);
    --muted: #9aa4b2;
    --accent: #3b82f6;
    --text: #e6eef6
}

.page {
    min-height: 60vh;
    padding: 24px
}

.card {
    background: var(--glass);
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 16px;
    border: 1px solid rgba(255, 255, 255, .06);
    box-shadow: 0 18px 40px rgba(11, 18, 32, .45)
}

.admin-card {
    animation: cardIn .28s ease both
}

.form {
    margin-top: 8px;
    display: grid;
    gap: 8px
}

.row {
    display: flex;
    gap: 8px;
    align-items: center
}

.input {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, .06);
    background: transparent;
    color: var(--text);
    transition: border-color .2s ease, box-shadow .2s ease
}

.input.small {
    width: 120px;
    padding: 8px
}

.input:focus {
    border-color: rgba(59, 130, 246, .6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, .18)
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

.btn.ghost {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, .06);
    color: var(--text)
}

.muted {
    color: var(--muted)
}

.empty-state {
    padding: 20px;
    text-align: center;
    color: var(--muted)
}

.table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 14px
}

.table th,
.table td {
    text-align: left;
    padding: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, .06)
}

.pager {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 10px
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
</style>