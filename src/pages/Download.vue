<template>
    <div class="page">
        <div class="card">
            <h3 class="title">软件下载</h3>

            <div class="buttons">
                <button class="btn" disabled>百度网盘（暂未开放）</button>
                <button class="btn" disabled>123云盘（暂未开放）</button>
                <button class="btn" disabled>GitHub（暂未开放）</button>
            </div>

            <div class="note">
                当前下载链接暂未提供，您可以发送邮件到
                <a class="mail" href="mailto:1109583154@qq.com">1109583154@qq.com</a>
                通过邮件获取软件。
            </div>
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.page {
    max-width: 900px;
    margin: 0 auto;
}

.card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
}

.title {
    margin: 0 0 12px;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
}

.buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin: 12px 0 8px;
}

.btn {
    padding: 10px 16px;
    border-radius: 10px;
    border: none;
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-secondary);
    font-weight: 600;
    cursor: not-allowed;
}

.note {
    margin-top: 8px;
    color: var(--text-muted);
    font-size: 14px;
}

.mail {
    color: var(--primary);
    text-decoration: none;
}

.mail:hover {
    text-decoration: underline;
}
</style>