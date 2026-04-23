from telegram import Update
from telegram.ext import ContextTypes
from utils.fetcher import fetch_all, get_symbols


async def handle_10x_volume(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    await query.message.reply_text("⏳ Scanning for 10x volume stocks... this may take a minute.")

    name_map = {sym: name for sym, name in get_symbols()}
    all_data = fetch_all(period="3mo")

    hits = []
    for symbol, df in all_data.items():
        if len(df) < 22:
            continue
        try:
            today_vol = float(df["Volume"].iloc[-1])
            avg_vol = float(df["Volume"].iloc[-21:-1].mean())
            today_open = float(df["Open"].iloc[-1])
            today_close = float(df["Close"].iloc[-1])

            if avg_vol <= 0:
                continue

            volume_ratio = today_vol / avg_vol
            is_green = today_close > today_open

            if volume_ratio >= 10 and is_green:
                name = name_map.get(symbol, symbol.replace(".NS", ""))
                change_pct = (
                    (today_close - float(df["Close"].iloc[-2])) / float(df["Close"].iloc[-2]) * 100
                )
                hits.append((name, symbol.replace(".NS", ""), today_close, change_pct, volume_ratio))
        except Exception:
            continue

    if not hits:
        await query.message.reply_text("No stocks with 10x volume (green close) found today.")
        return

    hits.sort(key=lambda x: x[4], reverse=True)

    lines = [f"🔥 *10x Volume — Green Close ({len(hits)} found)*\n"]
    for name, sym, close, chg, vol_x in hits:
        sign = "+" if chg >= 0 else ""
        lines.append(
            f"• *{sym}* — ₹{close:.1f} ({sign}{chg:.1f}%)\n"
            f"  Volume: *{vol_x:.0f}x* avg  |  {name}"
        )

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
