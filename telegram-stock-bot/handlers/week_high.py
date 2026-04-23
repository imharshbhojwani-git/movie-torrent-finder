from telegram import Update
from telegram.ext import ContextTypes
from utils.fetcher import fetch_all, get_symbols


async def handle_52wk_high(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    await query.message.reply_text("⏳ Scanning for 52-week highs... this may take a minute.")

    name_map = {sym: name for sym, name in get_symbols()}
    all_data = fetch_all(period="1y")

    hits = []
    for symbol, df in all_data.items():
        if len(df) < 2:
            continue
        try:
            today_high = float(df["High"].iloc[-1])
            year_high = float(df["High"].max())
            today_close = float(df["Close"].iloc[-1])
            if today_high >= year_high * 0.995:
                name = name_map.get(symbol, symbol.replace(".NS", ""))
                change_pct = (
                    (today_close - float(df["Close"].iloc[-2])) / float(df["Close"].iloc[-2]) * 100
                )
                hits.append((name, symbol.replace(".NS", ""), today_close, change_pct))
        except Exception:
            continue

    if not hits:
        await query.message.reply_text("No stocks hit 52-week high today.")
        return

    hits.sort(key=lambda x: x[3], reverse=True)

    lines = [f"📈 *52-Week High Stocks ({len(hits)} found)*\n"]
    for name, sym, close, chg in hits:
        sign = "+" if chg >= 0 else ""
        lines.append(f"• *{sym}* — ₹{close:.1f} ({sign}{chg:.1f}%)\n  {name}")

    await _send_in_chunks(query.message, lines)


async def _send_in_chunks(message, lines: list[str]) -> None:
    chunk = lines[0]
    for line in lines[1:]:
        if len(chunk) + len(line) + 1 > 4000:
            await message.reply_text(chunk, parse_mode="Markdown")
            chunk = line
        else:
            chunk += "\n" + line
    if chunk:
        await message.reply_text(chunk, parse_mode="Markdown")
