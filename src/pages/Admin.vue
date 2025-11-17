<!-- src/pages/Admin.vue -->
<template>
    <div class="admin-page">
        <!-- 数据统计 -->
        <section class="stats-section">
            <div class="section-header">
                <h2 class="section-title">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    数据概览
                </h2>
            </div>

            <div v-if="loadingStats" class="loading-state">
                <div class="spinner"></div>
                <span>加载中...</span>
            </div>

            <div v-else-if="!stats" class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>暂无数据</p>
            </div>

            <div v-else class="stats-container">
                <!-- 时间周期统计 -->
                <div class="time-stats">
                    <div class="stat-card" v-for="period in periods" :key="period.key">
                        <div class="stat-card-header">
                            <div class="period-badge" :class="period.key">{{ period.label }}</div>
                        </div>
                        <div class="metrics-grid">
                            <div class="metric">
                                <div class="metric-label">新用户</div>
                                <div class="metric-value">{{ stats[period.key].new_users }}</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">新增壁纸</div>
                                <div class="metric-value">{{ stats[period.key].wallpapers_created }}</div>
                            </div>
                            <div class="metric">
                                <div class="metric-label">上传总数</div>
                                <div class="metric-value">{{ stats[period.key].uploads_total }}</div>
                            </div>
                            <div class="metric highlight">
                                <div class="metric-label">收入</div>
                                <div class="metric-value">¥{{ (stats[period.key].revenue_cents / 100).toFixed(2) }}
                                </div>
                            </div>
                        </div>
                        <div class="stat-divider"></div>
                        <div class="secondary-metrics">
                            <div class="mini-metric">
                                <span class="mini-label">通过</span>
                                <span class="mini-value success">{{ stats[period.key].uploads_passed }}</span>
                            </div>
                            <div class="mini-metric">
                                <span class="mini-label">失败</span>
                                <span class="mini-value error">{{ stats[period.key].uploads_failed }}</span>
                            </div>
                            <div class="mini-metric">
                                <span class="mini-label">购买</span>
                                <span class="mini-value">{{ stats[period.key].purchases }}</span>
                            </div>
                            <div class="mini-metric">
                                <span class="mini-label">收藏</span>
                                <span class="mini-value">{{ stats[period.key].favorites }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 总计统计 -->
                <div class="total-stats">
                    <div class="total-header">
                        <h3>平台总览</h3>
                        <div class="total-badge">ALL TIME</div>
                    </div>
                    <div class="total-grid">
                        <div class="total-item primary">
                            <div class="total-icon">👥</div>
                            <div class="total-info">
                                <div class="total-label">用户总数</div>
                                <div class="total-value">{{ stats.totals.users_total.toLocaleString() }}</div>
                            </div>
                        </div>
                        <div class="total-item primary">
                            <div class="total-icon">🖼️</div>
                            <div class="total-info">
                                <div class="total-label">壁纸总数</div>
                                <div class="total-value">{{ stats.totals.wallpapers_total.toLocaleString() }}</div>
                            </div>
                        </div>
                        <div class="total-item">
                            <div class="total-label">公开壁纸</div>
                            <div class="total-value">{{ stats.totals.public_wallpapers.toLocaleString() }}</div>
                        </div>
                        <div class="total-item">
                            <div class="total-label">私有壁纸</div>
                            <div class="total-value">{{ stats.totals.private_wallpapers.toLocaleString() }}</div>
                        </div>
                        <div class="total-item">
                            <div class="total-label">付费壁纸</div>
                            <div class="total-value">{{ stats.totals.paid_wallpapers.toLocaleString() }}</div>
                        </div>
                        <div class="total-item">
                            <div class="total-label">免费壁纸</div>
                            <div class="total-value">{{ stats.totals.free_wallpapers.toLocaleString() }}</div>
                        </div>
                        <div class="total-item success">
                            <div class="total-label">上传通过</div>
                            <div class="total-value">{{ stats.totals.uploads_passed_total.toLocaleString() }}</div>
                        </div>
                        <div class="total-item error">
                            <div class="total-label">上传失败</div>
                            <div class="total-value">{{ stats.totals.uploads_failed_total.toLocaleString() }}</div>
                        </div>
                        <div class="total-item">
                            <div class="total-label">下载总数</div>
                            <div class="total-value">{{ stats.totals.downloads_total.toLocaleString() }}</div>
                        </div>
                        <div class="total-item">
                            <div class="total-label">收藏总数</div>
                            <div class="total-value">{{ stats.totals.favorites_total.toLocaleString() }}</div>
                        </div>
                        <div class="total-item revenue">
                            <div class="total-label">总收入</div>
                            <div class="total-value">¥{{ (stats.totals.revenue_total_cents / 100).toLocaleString() }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 用户角色管理 -->
        <section class="management-section">
            <div class="section-header">
                <h2 class="section-title">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <path d="M20 8v6M23 11h-6" />
                    </svg>
                    用户角色管理
                </h2>
            </div>

            <div class="form-card">
                <div class="form-group">
                    <label class="form-label">用户 UUID</label>
                    <input v-model="targetUuid" class="form-input" placeholder="输入用户的 UUID" />
                </div>
                <div class="form-group">
                    <label class="form-label">角色</label>
                    <div class="role-selector">
                        <button class="role-btn" :class="{ active: roleInput === 'admin' }"
                            @click="roleInput = 'admin'">
                            Admin
                        </button>
                        <button class="role-btn" :class="{ active: roleInput === 'user' }" @click="roleInput = 'user'">
                            User
                        </button>
                    </div>
                </div>
                <button class="submit-btn" @click="setRole" :disabled="loadingRole">
                    <span v-if="!loadingRole">设置角色</span>
                    <span v-else class="btn-loading">
                        <div class="mini-spinner"></div>
                        处理中...
                    </span>
                </button>
                <div v-if="msgRole" class="form-message" :class="msgRole.includes('成功') ? 'success' : 'error'">
                    {{ msgRole }}
                </div>
            </div>
        </section>

        <!-- 用户行为日志 -->
        <section class="logs-section">
            <div class="section-header">
                <h2 class="section-title">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                    </svg>
                    用户行为日志
                </h2>
            </div>

            <div class="logs-card">
                <div class="logs-toolbar">
                    <input v-model="logsUuid" class="form-input" placeholder="输入用户 UUID" style="flex: 1;" />
                    <div class="pagination-controls">
                        <input v-model.number="page" class="page-input" type="number" min="1" placeholder="页码" />
                        <input v-model.number="size" class="page-input" type="number" min="1" placeholder="每页" />
                        <button class="query-btn" @click="loadLogs" :disabled="loadingLogs">
                            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                            查询
                        </button>
                    </div>
                </div>

                <div v-if="loadingLogs" class="loading-state small">
                    <div class="spinner small"></div>
                    <span>加载日志中...</span>
                </div>

                <div v-else-if="logs.length === 0" class="empty-state small">
                    <svg class="empty-icon small" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <path
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>暂无日志记录</p>
                </div>

                <div v-else class="logs-table-wrapper">
                    <table class="logs-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>操作</th>
                                <th>目标 UUID</th>
                                <th>元数据</th>
                                <th>时间</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in logs" :key="row.id">
                                <td><span class="log-id">{{ row.id }}</span></td>
                                <td><span class="log-action">{{ row.action }}</span></td>
                                <td><code class="log-uuid">{{ row.target_uuid }}</code></td>
                                <td><span class="log-meta">{{ formatMeta(row.meta) }}</span></td>
                                <td><span class="log-time">{{ formatTime(row.created_at) }}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="logs.length > 0" class="pagination">
                    <button class="page-btn" @click="prevPage" :disabled="page <= 1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        上一页
                    </button>
                    <div class="page-info">第 <strong>{{ page }}</strong> 页</div>
                    <button class="page-btn" @click="nextPage" :disabled="logs.length < size">
                        下一页
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const targetUuid = ref('')
const roleInput = ref('user')
const loadingRole = ref(false)
const msgRole = ref('')

const logsUuid = ref('')
const page = ref(1)
const size = ref(20)
const logs = ref([])
const loadingLogs = ref(false)
const stats = ref(null)
const loadingStats = ref(false)

const periods = [
    { key: 'today', label: '今日' },
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' }
]

async function setRole() {
    msgRole.value = ''
    if (!targetUuid.value || !roleInput.value) {
        msgRole.value = '请输入 UUID 和角色'
        return
    }
    try {
        loadingRole.value = true
        const r = await api.adminSetRole(targetUuid.value, String(roleInput.value).toLowerCase())
        msgRole.value = r.data && r.data.ok ? '✓ 角色设置成功' : '× 设置失败'
    } catch (e) {
        msgRole.value = '× ' + (e.response?.data?.error || '请求失败')
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

function formatMeta(m) {
    if (!m) return '-'
    return typeof m === 'string' ? m : JSON.stringify(m)
}
function formatTime(t) {
    try {
        return new Date(t).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch {
        return String(t)
    }
}

async function loadStats() {
    try {
        loadingStats.value = true
        const r = await api.adminStats()
        stats.value = r.data
    } catch (e) {
        stats.value = null
    } finally {
        loadingStats.value = false
    }
}

onMounted(() => { loadStats() })
</script>

<style scoped>
* {
    box-sizing: border-box;
}

.admin-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    padding: 32px 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #e2e8f0;
}

/* Section Headers */
.section-header {
    margin-bottom: 24px;
}

.section-title {
    font-size: 24px;
    font-weight: 700;
    color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
}

.section-title .icon {
    width: 28px;
    height: 28px;
    color: #60a5fa;
}

/* Loading & Empty States */
.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
    color: #94a3b8;
}

.loading-state.small {
    padding: 40px 20px;
}

.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(96, 165, 250, 0.2);
    border-top-color: #60a5fa;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.spinner.small {
    width: 24px;
    height: 24px;
    border-width: 2px;
}

.mini-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
    color: #64748b;
}

.empty-state.small {
    padding: 40px 20px;
}

.empty-icon {
    width: 64px;
    height: 64px;
    opacity: 0.4;
}

.empty-icon.small {
    width: 48px;
    height: 48px;
}

.empty-state p {
    margin: 0;
    font-size: 15px;
}

/* Stats Section */
.stats-section {
    margin-bottom: 32px;
}

.stats-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.time-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
}

.stat-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 24px;
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
    border-color: rgba(96, 165, 250, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.stat-card-header {
    margin-bottom: 20px;
}

.period-badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.period-badge.today {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    color: white;
}

.period-badge.week {
    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
    color: white;
}

.period-badge.month {
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    color: white;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 16px;
}

.metric {
    padding: 12px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.metric.highlight {
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
    border-color: rgba(96, 165, 250, 0.2);
}

.metric-label {
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 6px;
}

.metric-value {
    font-size: 24px;
    font-weight: 700;
    color: #f8fafc;
}

.metric.highlight .metric-value {
    color: #60a5fa;
}

.stat-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    margin: 16px 0;
}

.secondary-metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
}

.mini-metric {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
}

.mini-label {
    font-size: 11px;
    color: #64748b;
    margin-bottom: 4px;
}

.mini-value {
    font-size: 16px;
    font-weight: 600;
    color: #cbd5e1;
}

.mini-value.success {
    color: #34d399;
}

.mini-value.error {
    color: #f87171;
}

/* Total Stats */
.total-stats {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 24px;
}

.total-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.total-header h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #f8fafc;
}

.total-badge {
    padding: 6px 12px;
    background: rgba(148, 163, 184, 0.2);
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    letter-spacing: 0.5px;
}

.total-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
}

.total-item {
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    transition: all 0.2s ease;
}

.total-item:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
}

.total-item.primary {
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%);
    border-color: rgba(96, 165, 250, 0.2);
    display: flex;
    gap: 12px;
    align-items: center;
}

.total-icon {
    font-size: 32px;
    opacity: 0.9;
}

.total-info {
    flex: 1;
}

.total-label {
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 4px;
}

.total-value {
    font-size: 20px;
    font-weight: 700;
    color: #f8fafc;
}

.total-item.primary .total-value {
    font-size: 28px;
    color: #60a5fa;
}

.total-item.success {
    border-color: rgba(52, 211, 153, 0.3);
}

.total-item.success .total-value {
    color: #34d399;
}

.total-item.error {
    border-color: rgba(248, 113, 113, 0.3);
}

.total-item.error .total-value {
    color: #f87171;
}

.total-item.revenue {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%);
    border-color: rgba(251, 191, 36, 0.3);
}

.total-item.revenue .total-value {
    color: #fbbf24;
}

/* Management Section */
.management-section {
    margin-bottom: 32px;
}

-message {
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    text-align: center;
    animation: slideIn 0.3s ease;
}

.form-message.success {
    background: rgba(52, 211, 153, 0.15);
    border: 1px solid rgba(52, 211, 153, 0.3);
    color: #34d399;
}

.form-message.error {
    background: rgba(248, 113, 113, 0.15);
    border: 1px solid rgba(248, 113, 113, 0.3);
    color: #f87171;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Logs Section */
.logs-section {
    margin-bottom: 32px;
}

.logs-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 24px;
}

.logs-toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.pagination-controls {
    display: flex;
    gap: 8px;
}

.page-input {
    width: 80px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #f8fafc;
    font-size: 14px;
    text-align: center;
}

.page-input:focus {
    outline: none;
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.query-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.query-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(96, 165, 250, 0.3);
}

.query-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-icon {
    width: 16px;
    height: 16px;
}

/* Logs Table */
.logs-table-wrapper {
    overflow-x: auto;
    margin: 0 -24px;
    padding: 0 24px;
}

.logs-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.logs-table thead {
    position: sticky;
    top: 0;
    z-index: 1;
}

.logs-table th {
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.logs-table th:first-child {
    border-top-left-radius: 8px;
}

.logs-table th:last-child {
    border-top-right-radius: 8px;
}

.logs-table td {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 14px;
    color: #cbd5e1;
}

.logs-table tbody tr {
    transition: background 0.15s ease;
}

.logs-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.03);
}

.log-id {
    display: inline-block;
    padding: 4px 8px;
    background: rgba(148, 163, 184, 0.2);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
}

.log-action {
    display: inline-block;
    padding: 4px 10px;
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
    border: 1px solid rgba(96, 165, 250, 0.3);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #60a5fa;
}

.log-uuid {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    color: #a78bfa;
}

.log-meta {
    font-size: 13px;
    color: #94a3b8;
    max-width: 300px;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.log-time {
    font-size: 13px;
    color: #64748b;
}

/* Pagination */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.page-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #cbd5e1;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.page-btn svg {
    width: 16px;
    height: 16px;
}

.page-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateX(0);
}

.page-btn:hover:not(:disabled):first-child {
    transform: translateX(-2px);
}

.page-btn:hover:not(:disabled):last-child {
    transform: translateX(2px);
}

.page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.page-info {
    font-size: 14px;
    color: #94a3b8;
}

.page-info strong {
    color: #60a5fa;
    font-weight: 700;
}

/* Responsive Design */
@media (max-width: 768px) {
    .admin-page {
        padding: 20px 16px;
    }

    .section-title {
        font-size: 20px;
    }

    .time-stats {
        grid-template-columns: 1fr;
    }

    .total-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }

    .logs-toolbar {
        flex-direction: column;
    }

    .pagination-controls {
        flex-wrap: wrap;
    }

    .logs-table {
        font-size: 12px;
    }

    .logs-table th,
    .logs-table td {
        padding: 10px 12px;
    }
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
    .admin-page {
        background: linear-gradient(135deg, #0a0f1e 0%, #151b2e 100%);
    }
}

-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 28px;
}

.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #cbd5e1;
    margin-bottom: 8px;
}

.form-input {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: #f8fafc;
    font-size: 14px;
    transition: all 0.2s ease;
}

.form-input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.06);
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.form-input::placeholder {
    color: #64748b;
}

.role-selector {
    display: flex;
    gap: 12px;
}

.role-btn {
    flex: 1;
    padding: 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: #cbd5e1;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.role-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
}

.role-btn.active {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    border-color: transparent;
    color: white;
}

.submit-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 12px;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(96, 165, 250, 0.3);
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.form-group {
    margin-bottom: 20px;
}
</style>