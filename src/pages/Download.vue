<template>
    <div class="page">
        <div class="card">
            <h3 class="title">软件下载</h3>

            <div class="buttons">
                <a class="btn" href="https://pan.baidu.com/s/16Ckztyq8ZDyR-TcmW4O9tQ?pwd=ftvj" target="_blank"
                    rel="noopener">百度网盘</a>
                <a class="btn" href="https://www.alipan.com/t/OvbOgU2xyuMojR7CkaQ6" target="_blank"
                    rel="noopener">阿里云盘</a>
                <a class="btn" href="https://github.com/BinaryEnchanter/image_server/releases/download/v1.0.1/setup.exe"
                    target="_blank" rel="noopener">GitHub</a>
            </div>

            <div class="note">
                如链接不可用或下载速度过慢，您可以发送邮件到
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
    color: var(--text-primary);
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
}

.btn:hover {
    background: rgba(255, 255, 255, 0.12);
}

.btn[disabled] {
    cursor: not-allowed;
    opacity: 0.6;
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