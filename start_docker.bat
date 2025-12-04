@echo off
echo 🐳 Starting Campaign Studio in Docker...

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running! Please start Docker Desktop and try again.
    pause
    exit /b
)

:: Build and Start
echo 🏗️  Building and Starting Containers...
docker-compose up --build -d

echo.
echo ✅ Services Started!
echo 🌍 Frontend: http://localhost:3000
echo 🐍 Backend:  http://localhost:8001
echo 🐘 Database: localhost:5432
echo.
echo 🚀 Opening frontend in browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000
echo.
echo 📜 Logs (Press Ctrl+C to exit logs, containers will keep running):
docker-compose logs -f
