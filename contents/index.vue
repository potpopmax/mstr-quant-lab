<script>
export const config = {
    matches: ["<all_urls>"]
}
</script>

<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue"

// 状态控制
const isVisible = ref(true) // 控制组件是否在页面显示
const btcPrice = ref(0)
const mstrPrice = ref(0)
const ratio = ref(0.0151)
const lastUpdate = ref("--:--:--")

// 计算溢价
const premium = computed(() => {
    if (btcPrice.value > 0 && mstrPrice.value > 0) {
        const intrinsicValue = btcPrice.value * ratio.value
        return ((mstrPrice.value / intrinsicValue) - 1) * 100
    }
    return 0
})

// 手动关闭逻辑
const closePanel = () => {
    isVisible.value = false
    // 可选：如果想让用户刷新前都不再出现，可以记录在 session 中
    sessionStorage.setItem('mstr_panel_closed', 'true')
}

// 获取数据逻辑
let timer = null
const updateData = async () => {
    if (!isVisible.value) return
    try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT")
        const data = await res.json()
        if (data.price) btcPrice.value = parseFloat(data.price)

        const title = document.title
        const titleMatch = title.match(/([\d,.]+)/)
        if (titleMatch && title.toUpperCase().includes('MSTR')) {
            mstrPrice.value = parseFloat(titleMatch[1].replace(/,/g, ''))
        } else if (mstrPrice.value === 0) {
            mstrPrice.value = 1850.50
        }
        lastUpdate.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    } catch (e) { console.log("Syncing...") }
}

onMounted(() => {
    // 检查是否手动关闭过
    if (sessionStorage.getItem('mstr_panel_closed') === 'true') {
        isVisible.value = false
        return
    }

    updateData()
    timer = setInterval(updateData, 5000)
})

// 核心：当脚本卸载（如关闭插件）时，彻底清理
onUnmounted(() => {
    if (timer) clearInterval(timer)
})
</script>

<template>
    <Transition name="fade">
        <div v-if="isVisible" class="mstr-card-pro">
            <button class="close-btn" @click="closePanel">×</button>

            <div class="mstr-header">
                <div class="brand">MSTR <span class="gold">QUANT</span></div>
                <div class="upgrade-btn" @click="window.open('你的收款链接')">UPGRADE</div>
            </div>

            <div class="price-section">
                <div class="row"><span>MSTR Price</span><span class="num">${{ mstrPrice.toFixed(2) }}</span></div>
                <div class="row"><span>BTC Price</span><span class="num">${{ btcPrice.toLocaleString() }}</span></div>
            </div>

            <div class="premium-box" :class="{ 'risk': premium > 35 }">
                <div class="p-title">EST. MARKET PREMIUM</div>
                <div class="p-value">{{ premium.toFixed(2) }}%</div>
                <div class="p-progress">
                    <div class="p-bar" :style="{ width: Math.min(Math.max(premium, 0), 100) + '%' }"></div>
                </div>
            </div>

            <div class="footer">
                <span>Ratio: {{ ratio }}</span>
                <span>{{ lastUpdate }}</span>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
/* 渐变消失动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.mstr-card-pro {
    position: fixed !important;
    top: 20px;
    right: 20px;
    width: 220px;
    background: rgba(18, 18, 18, 0.98) !important;
    color: #fff !important;
    padding: 18px;
    border-radius: 16px;
    border: 1px solid #333;
    z-index: 2147483647 !important;
    font-family: sans-serif;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
}

/* 关闭按钮样式 */
.close-btn {
    position: absolute;
    top: 8px;
    left: 8px;
    background: transparent;
    border: none;
    color: #444;
    font-size: 18px;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    transition: color 0.2s;
}

.close-btn:hover {
    color: #ff4444;
}

.mstr-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-left: 15px;
}

.brand {
    font-weight: 900;
    font-size: 14px;
    letter-spacing: 0.5px;
}

.gold {
    color: #f5d547;
}

.upgrade-btn {
    background: #f5d547;
    color: #000;
    font-size: 10px;
    font-weight: bold;
    padding: 3px 8px;
    border-radius: 4px;
    cursor: pointer;
}

.price-section {
    margin-bottom: 15px;
}

.row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 8px;
    color: #aaa;
}

.num {
    color: #fff;
    font-weight: 600;
    font-family: monospace;
}

.premium-box {
    background: #000;
    padding: 15px;
    border-radius: 12px;
    border: 1px solid #222;
    text-align: center;
}

.p-title {
    font-size: 10px;
    color: #666;
    margin-bottom: 8px;
}

.p-value {
    font-size: 32px;
    font-weight: 900;
    color: #28a745;
}

.risk .p-value {
    color: #ff4444;
}

.p-progress {
    height: 4px;
    background: #222;
    border-radius: 2px;
    margin-top: 12px;
    overflow: hidden;
}

.p-bar {
    height: 100%;
    background: #28a745;
    transition: width 0.6s ease;
}

.risk .p-bar {
    background: #ff4444;
}

.footer {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    color: #333;
    margin-top: 15px;
}
</style>