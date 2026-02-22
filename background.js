// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_MSTR_PRICE") {
        // 强制使用 query1 镜像，这个最稳定
        fetch(`https://query1.finance.yahoo.com/v8/finance/chart/MSTR?interval=1m&range=1d&_=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
                if (price) {
                    sendResponse({ price: price });
                } else {
                    sendResponse({ error: "No Price" });
                }
            })
            .catch(err => sendResponse({ error: err.message }));
        return true; // 必须返回 true，否则异步请求会报端口关闭错误
    }
});