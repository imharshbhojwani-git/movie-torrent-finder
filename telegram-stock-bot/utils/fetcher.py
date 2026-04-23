import yfinance as yf
import pandas as pd
from pathlib import Path

BATCH_SIZE = 50


def get_symbols() -> list[tuple[str, str]]:
    csv_path = Path(__file__).parent.parent / "data" / "nifty500.csv"
    df = pd.read_csv(csv_path).drop_duplicates(subset=["Symbol"])
    return list(zip(df["Symbol"], df["Name"]))


def _download_batch(symbols: list[str], period: str) -> dict[str, pd.DataFrame]:
    results = {}
    if not symbols:
        return results

    if len(symbols) == 1:
        sym = symbols[0]
        try:
            data = yf.download(sym, period=period, auto_adjust=True, progress=False)
            if not data.empty:
                results[sym] = data
        except Exception:
            pass
        return results

    try:
        raw = yf.download(
            " ".join(symbols),
            period=period,
            group_by="ticker",
            auto_adjust=True,
            threads=True,
            progress=False,
        )
        for sym in symbols:
            try:
                sym_data = raw[sym].dropna(how="all")
                if not sym_data.empty:
                    results[sym] = sym_data
            except (KeyError, TypeError):
                pass
    except Exception:
        pass

    return results


def fetch_all(period: str = "1y") -> dict[str, pd.DataFrame]:
    symbols = [s for s, _ in get_symbols()]
    all_data = {}
    for i in range(0, len(symbols), BATCH_SIZE):
        batch = symbols[i : i + BATCH_SIZE]
        all_data.update(_download_batch(batch, period))
    return all_data
