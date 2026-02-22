<template>
    <div class="mstr-pop">
        <div class="pop-title">MSTR <span class="gold">QUANT</span></div>
        <button class="pop-btn" @click="togglePanel">
            {{ isVisible ? '👁️ 隐藏桌面面板' : '👁️ 显示桌面面板' }}
        </button>
        <div :class="['pay-card', { 'is-vip': isPro }]" @click="doPay">
            <div class="pay-title">{{ isPro ? '💎 VIP 订阅已激活' : '🔒 点击模拟支付成功' }}</div>
            <p>激活后桌面面板将实时同步云端参数</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isPro = ref(false)
const isVisible = ref(true)

const init = async () => {
    const d = await chrome.storage.local.get(['mstr_pro_status', 'mstr_panel_visible'])
    isPro.value = !!d.mstr_pro_status
    isVisible.value = d.mstr_panel_visible !== false
}

const togglePanel = async () => {
    isVisible.value = !isVisible.value
    await chrome.storage.local.set({ mstr_panel_visible: isVisible.value })
}

const doPay = async () => {
    if (isPro.value) return
    let { mstr_uuid } = await chrome.storage.local.get('mstr_uuid')

    // 如果没拿到 UUID，临时造一个，确保请求能发出去
    if (!mstr_uuid) {
        mstr_uuid = 'user_' + Math.random().toString(36).substr(2, 9);
        await chrome.storage.local.set({ mstr_uuid });
    }

    try {
        const res = await fetch(`https://twilight-glade-6711.potpop-max.workers.dev/activate?id=${mstr_uuid}`)
        if (res.ok) {
            // 这里存入 storage 后，上面的 onChanged 监听器就会在面板端触发
            await chrome.storage.local.set({ mstr_pro_status: true })
            isPro.value = true
        }
    } catch (e) {
        // 暴力破解：如果 Worker 挂了，我们也强行点亮（仅限本地测试使用）
        await chrome.storage.local.set({ mstr_pro_status: true })
        isPro.value = true
    }
}

onMounted(init)
</script>

<style scoped>
.mstr-pop {
    width: 220px;
    padding: 15px;
    background: #000;
    color: #fff;
}

.gold {
    color: #f5d547;
}

.pop-btn {
    width: 100%;
    padding: 8px;
    margin-bottom: 15px;
    background: #222;
    border: 1px solid #444;
    color: #fff;
    border-radius: 6px;
}

.pay-card {
    padding: 12px;
    border: 1px solid #333;
    border-radius: 10px;
    cursor: pointer;
    background: #111;
}

.pay-card.is-vip {
    border-color: #f5d547;
    background: rgba(245, 213, 71, 0.1);
}
</style>