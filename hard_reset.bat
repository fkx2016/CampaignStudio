@echo off
echo ☢️  INITIATING HARD RESET...

:: 1. Shutdown everything
call shutdown_services.bat

:: 2. Wait a moment for file locks to release
timeout /t 2 /nobreak >nul

:: 3. Reset Database
echo 🗑️  Wiping and Reseeding Database...
venv\Scripts\python backend/reset_db.py

:: 4. Restart
echo 🔄 Restarting services...
call start_services.bat

echo 🏁 Hard Reset Complete.
