<template>
    <div class="page">
        <section class="card" style="max-width:720px;margin:24px auto;padding:20px">
            <h3>充值（测试模式）</h3>
            <p class="muted">本页面仅用于课程测试，不会接入真实支付网关。充值将直接增加你的金币余额。</p>

            <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
                <button v-for="a in presets" :key="a" class="preset" :class="{ active: selected === a }"
                    @click="select(a)">
                    {{ a }} 金币
                </button>
            </div>

            <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
                <label>自定义：</label>
                <input type="number" v-model.number="custom" min="1"
                    style="width:120px;padding:8px;border-radius:8px;border:1px solid #ccc" />
                <div class="muted">单位：金币</div>
            </div>

            <div style="margin-top:18px;display:flex;gap:10px;align-items:center">
                <button class="btn" @click="doRecharge">充值</button>
                <button class="btn ghost" @click="refreshProfile">刷新余额</button>
                <div class="muted">当前余额：<span class="accent">{{ userCoins }}</span></div>
            </div>

            <div v-if="message" style="margin-top:12px;color:var(--muted)">{{ message }}</div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { useUserStore } from '../store/user'
const presets = [10, 50, 100, 500]
const selected = ref(null)
const custom = ref(null)
const message = ref('')
const userCoins = ref(0)
const userStore = useUserStore()
async function loadProfile() {
    try {
        const r = await api.me()
        const u = r.data
        userCoins.value = u.coins || 0
        await userStore.load()
    } catch (e) {
        console.warn('无法获取用户信息', e)
        userCoins.value = 0
    }
}

function select(a) {
    selected.value = a
    custom.value = null
}

async function doRecharge() {
    message.value = ''
    const amount = custom.value ? Number(custom.value) : (selected.value ? Number(selected.value) : 0)
    if (!amount || amount <= 0) {
        message.value = '请输入大于 0 的充值数额'
        return
    }
    try {
        const r = await api.recharge(amount)
        if (r.data && r.data.ok) {
            message.value = `充值成功！流水 ${r.data.txn_id}，新余额 ${r.data.new_coins}`
            userCoins.value = r.data.new_coins
            await userStore.load()
        } else {
            message.value = '充值结果异常：' + JSON.stringify(r.data)
        }
    } catch (e) {
        console.error(e)
        message.value = '充值失败：' + (e.response?.data?.error || e.message)
    }
}

async function refreshProfile() {
    await loadProfile()
}

onMounted(loadProfile)
</script>

<style>
:root {
    --muted: #9aa4b2;
    --accent: #3b82f6;
    --glass: rgba(255, 255, 255, 0.03)
}

.page {
    min-height: 60vh
}

.card {
    background: var(--glass);
    padding: 12px;
    border-radius: 12px;
    max-width: 720px;
    margin: 24px auto
}

.preset {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    cursor: pointer;
    transition: transform .12s ease, box-shadow .2s ease, background-color .2s ease
}
.preset:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(59,130,246,.25) }

.preset.active {
    background: var(--accent);
    color: white
}

.btn {
    background: var(--accent);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: transform .15s ease, box-shadow .2s ease
}
.btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(59,130,246,.35) }

.btn.ghost {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.06)
}

.muted {
    color: var(--muted)
}

.accent {
    color: var(--accent);
    font-weight: 700
}
</style>
