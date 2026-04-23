from telegram.ext import Application, CommandHandler, CallbackQueryHandler
from config import BOT_TOKEN
from handlers.menu import start
from handlers.week_high import handle_52wk_high
from handlers.volume import handle_10x_volume


def main() -> None:
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(handle_52wk_high, pattern="^52wk_high$"))
    app.add_handler(CallbackQueryHandler(handle_10x_volume, pattern="^10x_volume$"))

    print("Bot is running...")
    app.run_polling()


if __name__ == "__main__":
    main()
