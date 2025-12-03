@echo off
echo 🐳 Stopping Campaign Studio Containers...

:: Stop and Remove Containers (Preserves Volumes/Data)
docker-compose down

echo.
echo ✅ Environment Shutdown Complete.
echo 😴 Containers are sleeping. Data is safe in the Volume.
echo.
pause
