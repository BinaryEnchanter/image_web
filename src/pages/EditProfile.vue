<template>
    <div class="card" style="padding:20px;max-width:520px;margin:0 auto">
        <h2 style="margin-bottom:12px">编辑个人资料</h2>

        <div v-if="!user" class="muted">未登录，无法编辑。</div>

        <div v-else>
            <!-- 修改用户名 -->
            <section class="section">
                <h3>修改用户名</h3>
                <input v-model="username" placeholder="新的用户名" />
                <button class="btn" @click="updateUsername" :disabled="loading.username">
                    {{ loading.username ? "提交中..." : "保存" }}
                </button>
            </section>

            <!-- 修改邮箱 -->
            <section class="section">
                <h3>修改邮箱</h3>
                <input v-model="email" placeholder="新的邮箱地址" />
                <button class="btn" @click="updateEmail" :disabled="loading.email">
                    {{ loading.email ? "提交中..." : "保存" }}
                </button>
            </section>

            <!-- 修改密码 -->
            <section class="section">
                <h3>修改密码</h3>
                <input type="password" v-model="password" placeholder="新的密码（至少6位）" />
                <button class="btn danger" @click="updatePassword" :disabled="loading.password">
                    {{ loading.password ? "提交中..." : "保存" }}
                </button>
            </section>

            <div v-if="msg" class="msg">{{ msg }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api' // axios 实例

const user = ref(null)
const username = ref('')
const email = ref('')
const password = ref('')
const msg = ref('')

const loading = ref({
    username: false,
    email: false,
    password: false,
})

async function loadUser() {
    try {
        const res = await api.me()
        user.value = res.data
        username.value = user.value.username
        email.value = user.value.email
    } catch (e) {
        console.warn('加载用户信息失败', e)
    }
}

function showMsg(t) {
    msg.value = t
    setTimeout(() => { msg.value = '' }, 2500)
}

async function updateUsername() {
    if (!username.value.trim()) return showMsg("用户名不能为空")
    loading.value.username = true

    try {
        const res = await api.updateUsername(username.value.trim())
        showMsg("用户名修改成功")
        user.value.username = res.data.username
    } catch (e) {
        console.error(e)
        showMsg(e.response?.data?.error || "修改失败")
    }

    loading.value.username = false
}

async function updateEmail() {
    if (!email.value.includes("@")) return showMsg("邮箱格式不合法")

    loading.value.email = true

    try {
        const res = await api.updateEmail(email.value.trim())
        showMsg("邮箱修改成功")
        user.value.email = res.data.email
    } catch (e) {
        console.error(e)
        showMsg(e.response?.data?.error || "修改失败")
    }

    loading.value.email = false
}

async function updatePassword() {
    if (password.value.length < 6) return showMsg("密码至少需要 6 位")

    loading.value.password = true

    try {
        await api.updatePassword(password.value)
        showMsg("密码修改成功")
        password.value = ''
    } catch (e) {
        console.error(e)
        showMsg(e.response?.data?.error || "修改失败")
    }

    loading.value.password = false
}

onMounted(loadUser)
</script>

<style scoped>
.section {
    margin-bottom: 22px;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    animation: fadeIn .28s ease both
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }

input {
    width: 100%;
    margin: 6px 0 12px;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
    color: #e6eef6;
    transition: border-color .2s ease, box-shadow .2s ease
}
input:focus { border-color: rgba(59,130,246,.5); box-shadow: 0 0 0 3px rgba(59,130,246,.18) }

.msg {
    margin-top: 12px;
    text-align: center;
    color: #3b82f6;
}

.btn {
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    background: #3b82f6;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: transform .15s ease, box-shadow .2s ease
}
.btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(59,130,246,.35) }

.btn.danger {
    background: #ef4444;
}

.muted {
    color: #9aa4b2;
}
</style>
