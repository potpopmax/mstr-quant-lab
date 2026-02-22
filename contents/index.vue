<template>
    <div v-if="isVisible" class="mstr-v3-container">
        <div v-if="!isCollapsed" class="mstr-v3-card">
            <div class="mstr-v3-header">
                <span class="mstr-v3-logo">MSTR<span class="gold">QUANT</span></span>
                <div class="mstr-v3-controls">
                    <span v-if="isPro" class="vip-badge">PRO ACTIVE</span>
                    <button class="close-btn" @click="isCollapsed = true">✕</button>
                </div>
            </div>

            <div class="mstr-v3-body">
                <div class="label">实时溢价 (动态计算)</div>
                <div :class="['premium-val', { 'error-state': !connOk }]">
                    {{ connOk ? premium + '%' : '---' }}
                </div>

                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">MSTR 股价</span>
                        <span class="stat-value">${{ mstrPrice }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">BTC 价格</span>
                        <span class="stat-value">${{ btcPrice }}</span>
                    </div>
                </div>

                <div v-if="isPro" class="ai-box-v3">
                    <div class="ai-title">✨ AI 实时内参</div>
                    <p>{{ aiAdvice }}</p>
                </div>

                <div v-if="!isPro" class="pay-banner">
                    🔒 系统检测到参数波动，建议解锁 PRO 获取精准策略
                </div>
            </div>

            <div class="mstr-v3-footer">
                <span :class="['status-dot', { 'online': connOk }]"></span>
                {{ connOk ? '云端链路正常 (' + lastTick + ')' : '连接已断开，正在重试...' }}
            </div>
        </div>

        <div v-else class="mstr-v3-ball" @click="isCollapsed = false">
            MSTR
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isVisible = ref(true)
const isCollapsed = ref(false)
const isPro = ref(false)
const premium = ref("---")
const btcPrice = ref("---") // 对应模板中的 {{ btcPrice }}
const mstrPrice = ref("---") // 对应模板中的 {{ mstrPrice }}
const aiAdvice = ref("正在验证云端参数...")
const connOk = ref(false)
const lastTick = ref("")

const syncData = async () => {
    try {
        // 1. 抓取 BTC
        const btcRes = await fetch("https://api3.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        const btcData = await btcRes.json();
        const currentBtc = parseFloat(btcData.price);

        // 2. 抓取 MSTR (通过 AllOrigins 代理)
        const proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent("https://query1.finance.yahoo.com/v8/finance/chart/MSTR");
        const mstrRes = await fetch(proxyUrl);
        const mstrProxyData = await mstrRes.json();

        // 解析嵌套 JSON
        const mstrRaw = JSON.parse(mstrProxyData.contents);
        const currentMstr = mstrRaw.chart.result[0].meta.regularMarketPrice;

        // 3. 执行计算 (2026 最新参数)
        const mstrTotalBtc = 717131;
        const mstrTotalShares = 366114000;
        const navPerShare = (mstrTotalBtc * currentBtc) / mstrTotalShares;
        const premiumVal = ((currentMstr / navPerShare) - 1) * 100;

        // 4. 【关键修正】变量名必须与 ref 定义的一致！
        premium.value = premiumVal.toFixed(2);
        btcPrice.value = currentBtc.toLocaleString(); // 删掉 Display
        mstrPrice.value = currentMstr.toFixed(2);     // 删掉 Display

        // 更新状态和时间
        connOk.value = true;
        lastTick.value = new Date().toLocaleTimeString('zh-CN', { hour12: false });

        if (premiumVal > 20) {
            aiAdvice.value = "警告：当前溢价过高，注意回撤风险。";
        } else {
            aiAdvice.value = "当前溢价处于 2026 合理区间。";
        }

    } catch (e) {
        console.error("同步失败:", e);
        connOk.value = false;
    }
}

// 在 script setup 中添加这个函数
const updateLocalStatus = async () => {
    const d = await chrome.storage.local.get(['mstr_pro_status', 'mstr_panel_visible'])
    isPro.value = !!d.mstr_pro_status
    isVisible.value = d.mstr_panel_visible !== false
    console.log("状态已更新：", { isPro: isPro.value, isVisible: isVisible.value })
}

onMounted(() => {
    updateLocalStatus(); // 1. 启动时先读一次
    syncData();
    setInterval(syncData, 5000);

    // 2. 【关键】监听 storage 变化，Popup 一改，这里立刻有反应
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.mstr_pro_status || changes.mstr_panel_visible) {
            updateLocalStatus();
        }
    })
})
</script>

<style scoped>
.mstr-v3-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999999;
}

.mstr-v3-card {
    width: 260px;
    background: #080808;
    border: 1px solid #333;
    border-radius: 12px;
    color: #fff;
    padding: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
}

.premium-val {
    font-size: 42px;
    font-weight: 900;
    color: #ff4444;
    margin: 5px 0;
}

.premium-val.error-state {
    color: #222;
}

.gold {
    color: #f5d547;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 15px;
}

.stat-item {
    background: #111;
    padding: 8px;
    border-radius: 6px;
}

.stat-label {
    font-size: 10px;
    color: #555;
    display: block;
}

.stat-value {
    font-size: 12px;
    font-weight: bold;
}

.ai-box-v3 {
    background: #111;
    border-left: 3px solid #f5d547;
    padding: 10px;
    margin-top: 15px;
    border-radius: 4px;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    background: #f00;
    margin-right: 5px;
}

.status-dot.online {
    background: #39d353;
}

.mstr-v3-ball {
    width: 44px;
    height: 44px;
    background: #f5d547;
    color: #000;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    cursor: pointer;
}
</style>