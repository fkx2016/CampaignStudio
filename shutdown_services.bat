@echo off
echo 🛑 INITIATING RUTHLESS SHUTDOWN...

:: 1. Kill by Image Name (The Broad Sweep)
echo 🧹 Sweeping common process names...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM uvicorn.exe /T 2>nul

:: 2. The "Port Clutch" Fix (The Sniper)
:: Hunt down anything still holding Port 8001 (Backend)
echo 🔫 Hunting zombies on Port 8001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8001') do (
    echo    Found zombie PID %%a on Port 8001. Terminating...
    taskkill /F /PID %%a 2>nul
)

:: Hunt down anything still holding Port 3000 (Frontend)
echo 🔫 Hunting zombies on Port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo    Found zombie PID %%a on Port 3000. Terminating...
    taskkill /F /PID %%a 2>nul
)

echo 💀 All targets neutralized. Ports 3000 and 8001 should be clean.
