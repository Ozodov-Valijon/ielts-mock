@echo off
chcp 65001 > nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start.ps1"
if errorlevel 1 (
    echo Ishga tushirishda xatolik. Yuqoridagi xabarni tekshiring.
    pause
    exit /b 1
)
pause
