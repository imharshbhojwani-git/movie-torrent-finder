from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    keyboard = [
        [InlineKeyboardButton("📈 52 Week High", callback_data="52wk_high")],
        [InlineKeyboardButton("🔥 10x Volume (Green)", callback_data="10x_volume")],
    ]
    await update.message.reply_text(
        "📊 *Stock Market Scanner — NSE*\n\nChoose a scan to run:",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode="Markdown",
    )
