@echo off
echo.
echo ========================================
echo   Restarting Frontend Container
echo ========================================
echo.

docker-compose restart frontend

if %errorlevel% equ 0 (
    echo.
    echo ✅ Frontend restarted successfully!
    echo.
    echo 💡 Wait ~10 seconds for compilation, then:
    echo    1. Hard refresh browser (Ctrl + Shift + R)
    echo    2. Your changes should now be visible!
    echo.
) else (
    echo.
    echo ❌ Failed to restart frontend
    echo.
)

pause
