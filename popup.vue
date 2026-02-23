<template>
    <div class="mstr-pop">
        <div class="pop-header">
            <div class="brand">MSTR <span class="gold">QUANT</span> <span class="pro-tag">PRO</span></div>
            <div class="version">v2.4.0 Live</div>
        </div>

        <div class="status-card">
            <div class="status-row">
                <span class="label">LICENSE STATUS</span>
                <span class="value gold-text">PREMIUM ACTIVE</span>
            </div>
            <div class="status-row">
                <span class="label">CLOUD SYNC</span>
                <span class="value green-text">● SECURED</span>
            </div>
        </div>

        <button class="pop-btn" :class="{ 'btn-off': isVisible }" @click="togglePanel">
            {{ isVisible ? 'HIDE OVERLAY' : 'SHOW OVERLAY' }}
        </button>

        <div class="divider"></div>

        <div class="stat-container">
            <div class="stat-label">GLOBAL DATA REQUESTS</div>
            <div class="stat-num">{{ userCount.toLocaleString() }}</div>
        </div>

        <div class="admin-footer">
            <a href="mailto:potpop.max@gmail.com" class="footer-link">Support</a>
            <span class="dot-sep"></span>
            <button @click="handleClear" class="footer-link">Reset Plugin</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isVisible = ref(true)
const userCount = ref(0)

const init = async () => {
    const d = await chrome.storage.local.get(['mstr_panel_visible'])
    isVisible.value = d.mstr_panel_visible !== false
    try {
        const res = await fetch("https://twilight-glade-6711.potpop-max.workers.dev/get-all-data")
        const data = await res.json()
        if (data.userCount) userCount.value = data.userCount
    } catch (e) { console.error("Sync failed") }
}

const togglePanel = async () => {
    isVisible.value = !isVisible.value
    await chrome.storage.local.set({ mstr_panel_visible: isVisible.value })
}

const handleClear = () => {
    if (confirm("Reset all settings and data?")) {
        chrome.storage.local.clear(() => window.close())
    }
}
onMounted(init)
</script>

<style>
/* 关键修复：直接作用于全局 body，去掉插件默认白边 */
body {
    margin: 0;
    padding: 0;
    background-color: #0c0c0c;
    /* 必须设置，防止加载瞬间闪白 */
    overflow: hidden;
}
</style>

<style scoped>
/* 容器样式优化 */
.mstr-pop {
    width: 260px;
    /* 移除 padding 导致的内缩，改用内部 padding */
    padding: 24px 20px;
    /* 确保背景完全覆盖 */
    background: linear-gradient(145deg, #161616, #0c0c0c);
    color: #fff;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    /* 消除任何可能的外部边距 */
    display: flex;
    flex-direction: column;
    border-radius: 16px;
}

.pop-header {
    margin-bottom: 22px;
    text-align: center;
}

.brand {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: -0.5px;
}

.gold {
    color: #f5d547;
}

.pro-tag {
    font-size: 9px;
    background: #f5d547;
    color: #000;
    padding: 1px 6px;
    border-radius: 4px;
    margin-left: 6px;
    vertical-align: middle;
    font-weight: 800;
}

.version {
    font-size: 9px;
    color: #444;
    margin-top: 4px;
    letter-spacing: 1px;
}

/* 状态卡片：更深邃的质感 */
.status-card {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 20px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.status-row {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    margin-bottom: 8px;
}

.label {
    color: #555;
    font-weight: 600;
    text-transform: uppercase;
}

.gold-text {
    color: #f5d547;
    text-shadow: 0 0 10px rgba(245, 213, 71, 0.2);
}

.green-text {
    color: #39d353;
    font-weight: bold;
}

/* 按钮：完全去除默认边框阴影，改为纯粹的黑金 */
.pop-btn {
    width: 100%;
    padding: 14px;
    border-radius: 10px;
    border: none;
    background: #f5d547;
    color: #000;
    font-weight: 800;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.pop-btn:hover {
    background: #ffe472;
    transform: scale(1.02);
}

.btn-off {
    background: #222;
    color: #666;
}

.divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.05);
    margin: 20px 0;
}

.stat-container {
    text-align: center;
    margin-bottom: 20px;
}

.stat-label {
    font-size: 9px;
    color: #444;
    letter-spacing: 1px;
    margin-bottom: 4px;
}

.stat-num {
    font-size: 24px;
    font-weight: 200;
    color: #fff;
    font-family: 'Courier New', monospace;
}

.admin-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
}

.footer-link {
    font-size: 10px;
    color: #444;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
}

.footer-link:hover {
    color: #f5d547;
}

.dot-sep {
    width: 3px;
    height: 3px;
    background: #222;
    border-radius: 50%;
}
</style>