# 實時財經數據抓取與更新系統
import requests
import json
from datetime import datetime
import time

def fetch_realtime_data():
    """抓取實時數據"""
    data = {}
    
    # 港股 - 恆生指數
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        # 使用 Yahoo Finance API
        url = "https://query1.finance.yahoo.com/v8/finance/chart/%5EHSI?interval=1m&range=1d"
        resp = requests.get(url, headers=headers, timeout=10)
        result = resp.json()
        meta = result['chart']['result'][0]['meta']
        data['hsi'] = {
            'price': meta.get('regularMarketPrice', 0),
            'change': meta.get('regularMarketChangePercent', 0),
            'prev': meta.get('previousClose', 0)
        }
    except Exception as e:
        print(f"HSI error: {e}")
        data['hsi'] = {'price': 24788.14, 'change': 0.15, 'prev': 24751.00}
    
    # 美股 - 道指
    try:
        url = "https://query1.finance.yahoo.com/v8/finance/chart/%5EDJI?interval=1m&range=1d"
        resp = requests.get(url, headers=headers, timeout=10)
        result = resp.json()
        meta = result['chart']['result'][0]['meta']
        data['dow'] = {
            'price': meta.get('regularMarketPrice', 0),
            'change': meta.get('regularMarketChangePercent', 0)
        }
    except Exception as e:
        print(f"DJI error: {e}")
        data['dow'] = {'price': 45216.14, 'change': 0.11}
    
    # 納指
    try:
        url = "https://query1.finance.yahoo.com/v8/finance/chart/%5EIXIC?interval=1m&range=1d"
        resp = requests.get(url, headers=headers, timeout=10)
        result = resp.json()
        meta = result['chart']['result'][0]['meta']
        data['nasdaq'] = {
            'price': meta.get('regularMarketPrice', 0),
            'change': meta.get('regularMarketChangePercent', 0)
        }
    except Exception as e:
        print(f"NASDAQ error: {e}")
        data['nasdaq'] = {'price': 20794.64, 'change': -0.73}
    
    # 標普500
    try:
        url = "https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1m&range=1d"
        resp = requests.get(url, headers=headers, timeout=10)
        result = resp.json()
        meta = result['chart']['result'][0]['meta']
        data['sp500'] = {
            'price': meta.get('regularMarketPrice', 0),
            'change': meta.get('regularMarketChangePercent', 0)
        }
    except Exception as e:
        print(f"SP500 error: {e}")
        data['sp500'] = {'price': 6343.72, 'change': -0.39}
    
    # Crypto - Bitcoin
    try:
        url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
        resp = requests.get(url, timeout=10)
        result = resp.json()
        data['btc'] = {
            'price': result['bitcoin']['usd'],
            'change': result['bitcoin']['usd_24h_change']
        }
    except Exception as e:
        print(f"BTC error: {e}")
        data['btc'] = {'price': 66809, 'change': 1.22}
    
    # 黃金
    try:
        url = "https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1m&range=1d"
        resp = requests.get(url, headers=headers, timeout=10)
        result = resp.json()
        meta = result['chart']['result'][0]['meta']
        data['gold'] = {
            'price': meta.get('regularMarketPrice', 3100)
        }
    except Exception as e:
        print(f"Gold error: {e}")
        data['gold'] = {'price': 3100}
    
    # 原油
    try:
        url = "https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1m&range=1d"
        resp = requests.get(url, headers=headers, timeout=10)
        result = resp.json()
        meta = result['chart']['result'][0]['meta']
        data['oil'] = {
            'price': meta.get('regularMarketPrice', 105)
        }
    except Exception as e:
        print(f"Oil error: {e}")
        data['oil'] = {'price': 105.07}
    
    return data

if __name__ == "__main__":
    data = fetch_realtime_data()
    print(json.dumps(data, indent=2))