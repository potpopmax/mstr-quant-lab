<template>
    <div v-if="isVisible" class="mstr-overlay">
        <div v-if="!isCollapsed" class="mstr-glass-card" @click="isCollapsed = true">
            <div class="card-header">
                <div class="brand">MSTR<span class="gold">QUANT</span> <span class="badge">LIVE</span></div>
                <div class="sync-indicator">
                    <span class="dot" :class="{ 'active': isLoaded }"></span>
                </div>
            </div>

            <div class="main-val" :class="premium > 25 ? 'red' : 'green'">
                <div class="val-label">PREMIUM</div>
                <div class="val-num">{{ isLoaded ? premium.toFixed(2) + '%' : '•••' }}</div>
            </div>

            <div class="price-grid">
                <div class="p-box"><span class="p-label">MSTR REAL</span><span class="p-num">${{ mstrPrice }}</span>
                </div>
                <div class="p-box"><span class="p-label">BTC REAL</span><span class="p-num">${{ btcPrice }}</span></div>
            </div>

            <div class="ai-insight">
                <p>{{ isLoaded ? (premium > 25 ? "High Premium: Exercise Caution." : "Healthy Zone: Optimal Holding.") :
                    "Calibrating Data..." }}</p>
            </div>

            <div class="footer-info">
                <span>SYNCED: {{ lastTick }}</span>
            </div>
        </div>

        <div v-else class="mstr-ball" @click="isCollapsed = false">
            <span class="ball-text">M</span>
            <div class="pulse"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isVisible = ref(true); const isCollapsed = ref(false); const isLoaded = ref(false);
const premium = ref(0); const mstrPrice = ref(0); const btcPrice = ref(0); const lastTick = ref("");

const syncData = async () => {
    try {
        const res = await fetch("https://twilight-glade-6711.potpop-max.workers.dev/get-all-data")
        const data = await res.json()
        if (data.success && data.btcPrice > 0) {
            const nav = (data.btcHoldings * data.btcPrice) / data.totalShares
            premium.value = ((data.mstrPrice / nav) - 1) * 100
            mstrPrice.value = data.mstrPrice.toFixed(2)
            btcPrice.value = data.btcPrice.toLocaleString()
            lastTick.value = data.serverTime
            isLoaded.value = true
        } else { isLoaded.value = false }
    } catch (e) { isLoaded.value = false }
}

onMounted(() => {
    chrome.storage.local.get(['mstr_panel_visible'], (d) => { isVisible.value = d.mstr_panel_visible !== false })
    chrome.storage.onChanged.addListener((c) => { if (c.mstr_panel_visible) isVisible.value = c.mstr_panel_visible.newValue })
    syncData();
    setInterval(syncData, 15000);
})
</script>

<style scoped>
.mstr-overlay {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2147483647;
    font-family: 'Inter', sans-serif;
    pointer-events: auto;
}

.mstr-glass-card {
    width: 210px;
    background: rgba(10, 10, 10, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 18px;
    color: #fff;
    cursor: pointer;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mstr-glass-card:hover {
    border-color: rgba(245, 213, 71, 0.3);
    transform: translateY(-2px);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.brand {
    font-weight: 900;
    font-size: 11px;
    letter-spacing: 0.5px;
}

.gold {
    color: #f5d547;
}

.badge {
    font-size: 8px;
    background: #39d353;
    color: #000;
    padding: 1px 4px;
    border-radius: 3px;
    margin-left: 5px;
    font-weight: bold;
}

.main-val {
    text-align: center;
    margin: 18px 0;
}

.val-label {
    font-size: 9px;
    color: #555;
    letter-spacing: 1px;
}

.val-num {
    font-size: 34px;
    font-weight: 900;
    line-height: 1;
    margin-top: 5px;
}

.green {
    color: #39d353;
}

.red {
    color: #ff4444;
}

.price-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.p-box {
    background: rgba(255, 255, 255, 0.03);
    padding: 10px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.03);
}

.p-label {
    font-size: 8px;
    color: #444;
    display: block;
    margin-bottom: 3px;
}

.p-num {
    font-size: 11px;
    font-weight: bold;
    color: #ccc;
}

.ai-insight {
    margin-top: 15px;
    background: rgba(255, 255, 255, 0.02);
    padding: 10px;
    border-radius: 8px;
    font-size: 10px;
    color: #888;
    border-left: 2px solid #333;
}

.footer-info {
    margin-top: 12px;
    font-size: 8px;
    color: #333;
    text-align: right;
}

.mstr-ball {
    width: 44px;
    height: 44px;
    background: #f5d547;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    position: relative;
}

.ball-text {
    color: #000;
    font-weight: 900;
    font-size: 16px;
}

.pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid #f5d547;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 0.5;
    }

    100% {
        transform: scale(1.6);
        opacity: 0;
    }
}

.dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #222;
}

.dot.active {
    background: #39d353;
    box-shadow: 0 0 5px #39d353;
}
</style>