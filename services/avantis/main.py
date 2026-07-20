"""
Avantis market-data sidecar for Builders DEX.
Uses avantis-trader-sdk for pairs + live marks; Binance public klines for OHLCV candles.
"""

from __future__ import annotations

import asyncio
import os
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Builders DEX · Avantis sidecar", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_RPC = os.getenv("AVANTIS_BASE_RPC", "https://mainnet.base.org")

# Map Avantis pair names → Binance spot symbols for candle history
BINANCE_MAP = {
    "BTC/USD": "BTCUSDT",
    "ETH/USD": "ETHUSDT",
    "SOL/USD": "SOLUSDT",
    "BNB/USD": "BNBUSDT",
    "XRP/USD": "XRPUSDT",
    "DOGE/USD": "DOGEUSDT",
    "AVAX/USD": "AVAXUSDT",
    "LINK/USD": "LINKUSDT",
    "ARB/USD": "ARBUSDT",
    "OP/USD": "OPUSDT",
    "MATIC/USD": "MATICUSDT",
    "POL/USD": "POLUSDT",
    "WIF/USD": "WIFUSDT",
    "PEPE/USD": "PEPEUSDT",
    "SUI/USD": "SUIUSDT",
    "APT/USD": "APTUSDT",
    "TIA/USD": "TIAUSDT",
    "INJ/USD": "INJUSDT",
    "NEAR/USD": "NEARUSDT",
    "AAVE/USD": "AAVEUSDT",
}

_trader = None
_pairs_cache: dict[int, dict[str, Any]] | None = None
_pairs_lock = asyncio.Lock()


def get_trader():
    global _trader
    if _trader is None:
        from avantis_trader_sdk import TraderClient

        _trader = TraderClient(BASE_RPC)
    return _trader


def pair_to_dict(index: int, pair: Any) -> dict[str, Any]:
    from_ = getattr(pair, "from_", None) or getattr(pair, "from", None) or ""
    to = getattr(pair, "to", "") or "USD"
    name = f"{from_}/{to}" if from_ else str(pair)
    return {
        "pairIndex": index,
        "name": name,
        "from": from_,
        "to": to,
        "binanceSymbol": BINANCE_MAP.get(name),
    }


@app.get("/health")
async def health():
    return {"ok": True, "rpc": BASE_RPC, "sdk": "avantis-trader-sdk"}


@app.get("/pairs")
async def pairs(force: bool = False):
    global _pairs_cache
    async with _pairs_lock:
        if _pairs_cache is not None and not force:
            return {"pairs": list(_pairs_cache.values())}
        try:
            trader = get_trader()
            info = await trader.pairs_cache.get_pairs_info()
            mapped: dict[int, dict[str, Any]] = {}
            # info may be dict keyed by index
            if isinstance(info, dict):
                for idx, pair in info.items():
                    mapped[int(idx)] = pair_to_dict(int(idx), pair)
            else:
                for idx, pair in enumerate(info):
                    mapped[idx] = pair_to_dict(idx, pair)
            _pairs_cache = mapped
            return {"pairs": list(mapped.values())}
        except Exception as exc:  # noqa: BLE001
            # Fallback static majors if Base RPC / SDK fails
            fallback = [
                {"pairIndex": 0, "name": "BTC/USD", "from": "BTC", "to": "USD", "binanceSymbol": "BTCUSDT"},
                {"pairIndex": 1, "name": "ETH/USD", "from": "ETH", "to": "USD", "binanceSymbol": "ETHUSDT"},
                {"pairIndex": 2, "name": "SOL/USD", "from": "SOL", "to": "USD", "binanceSymbol": "SOLUSDT"},
            ]
            return {"pairs": fallback, "warning": str(exc)}


@app.get("/price/{pair_index}")
async def price(pair_index: int):
    try:
        from avantis_trader_sdk import FeedClient

        feed = FeedClient()
        data = await feed.get_price_update_data(pair_index=pair_index)
        pro = getattr(data, "pro", None)
        core = getattr(data, "core", None)
        mark = None
        if pro is not None:
            mark = float(getattr(pro, "price", None) or getattr(pro, "converted_price", 0) or 0)
        if (mark is None or mark == 0) and core is not None:
            mark = float(getattr(core, "price", None) or getattr(core, "converted_price", 0) or 0)
        return {"pairIndex": pair_index, "price": mark, "source": "avantis-pyth"}
    except Exception as exc:  # noqa: BLE001
        # Fallback: Binance ticker via pair name
        await pairs()
        meta = (_pairs_cache or {}).get(pair_index)
        symbol = (meta or {}).get("binanceSymbol") or "ETHUSDT"
        async with httpx.AsyncClient(timeout=12) as client:
            r = await client.get(
                "https://api.binance.com/api/v3/ticker/price",
                params={"symbol": symbol},
            )
            r.raise_for_status()
            body = r.json()
            return {
                "pairIndex": pair_index,
                "price": float(body["price"]),
                "source": "binance-fallback",
                "warning": str(exc),
            }


@app.get("/candles")
async def candles(
    pair_index: int = Query(1),
    interval: str = Query("15m"),
    limit: int = Query(120, ge=10, le=500),
):
    await pairs()
    meta = (_pairs_cache or {}).get(pair_index)
    if not meta:
        # try load again
        await pairs(force=True)
        meta = (_pairs_cache or {}).get(pair_index)
    symbol = (meta or {}).get("binanceSymbol")
    if not symbol:
        # default by common indexes
        symbol = {0: "BTCUSDT", 1: "ETHUSDT"}.get(pair_index, "ETHUSDT")

    allowed = {"1m", "5m", "15m", "1h", "4h", "1d"}
    if interval not in allowed:
        raise HTTPException(400, f"interval must be one of {sorted(allowed)}")

    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(
            "https://api.binance.com/api/v3/klines",
            params={"symbol": symbol, "interval": interval, "limit": limit},
        )
        if r.status_code != 200:
            raise HTTPException(502, f"Candle provider error: {r.text[:200]}")
        raw = r.json()

    out = [
        {
            "time": int(k[0] // 1000),
            "open": float(k[1]),
            "high": float(k[2]),
            "low": float(k[3]),
            "close": float(k[4]),
            "volume": float(k[5]),
        }
        for k in raw
    ]
    return {
        "pairIndex": pair_index,
        "symbol": symbol,
        "interval": interval,
        "candles": out,
        "provider": "binance",
        "markSource": "avantis-pyth when available",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=int(os.getenv("AVANTIS_PORT", "8765")))
