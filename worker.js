// Cloudflare Worker - 財經數據 API Proxy
// 部署後網址: https://your-worker.your-subdomain.workers.dev

export default {
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 獲取所有市場數據
      if (path === '/api/markets' || path === '/') {
        const data = await fetchAllMarkets();
        return new Response(JSON.stringify(data), { headers: corsHeaders });
      }

      // 獲取單一股票
      if (path.startsWith('/api/quote/')) {
        const symbol = path.replace('/api/quote/', '');
        const data = await fetchYahooFinance(symbol);
        return new Response(JSON.stringify(data), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404, 
        headers: corsHeaders 
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};

async function fetchAllMarkets() {
  const symbols = {
    hsi: '%5EHSI',
    dow: '%5EDJI', 
    nasdaq: '%5EIXIC',
    sp500: '%5EGSPC',
    gold: 'GC%3DF',
    oil: 'CL%3DF'
  };

  const results = {};
  
  for (const [key, symbol] of Object.entries(symbols)) {
    try {
      const data = await fetchYahooFinance(symbol);
      results[key] = data;
    } catch (e) {
      results[key] = { error: e.message };
    }
  }

  // 獲取 Crypto
  try {
    const cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
    const cryptoData = await cryptoRes.json();
    results.crypto = cryptoData;
  } catch (e) {
    results.crypto = { error: e.message };
  }

  return {
    timestamp: new Date().toISOString(),
    markets: results
  };
}

async function fetchYahooFinance(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
  
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const data = await res.json();
  
  if (!data.chart?.result?.[0]) {
    throw new Error('No data');
  }
  
  const meta = data.chart.result[0].meta;
  const price = meta.regularMarketPrice || meta.previousClose;
  const prev = meta.previousClose || price;
  const change = prev ? ((price - prev) / prev * 100) : 0;
  
  return {
    price: price,
    change: change,
    prevClose: prev,
    currency: meta.currency || 'USD'
  };
}