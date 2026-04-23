@echo off
setlocal enabledelayedexpansion
title Stock Market Bot
cd /d "%~dp0"

:: First time: save token
if not exist ".env" (
    echo.
    echo === First Time Setup ===
    set /p TOKEN="Paste your Telegram Bot Token: "
    echo BOT_TOKEN=!TOKEN!> .env
    echo Token saved.
    echo.
)

:: First time: create virtual environment and install packages
if not exist "venv" (
    echo Installing dependencies for the first time, please wait...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt --quiet
    echo.
    echo Setup complete^^!
    echo.
) else (
    call venv\Scripts\activate.bat
)

echo ================================
echo   Stock Market Bot is running
echo   Open Telegram, send /start
echo   Press Ctrl+C to stop
echo ================================
echo.
python bot.py

pause
