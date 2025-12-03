@echo off
echo 🚀 Starting Campaign Studio...

:: Start Backend
echo 🐍 Launching Backend (Port 8001)...
start "CampaignStudio Backend" cmd /k "venv\Scripts\activate && uvicorn backend.main:app --reload --port 8001"

:: Start Frontend
echo ⚛️  Launching Frontend (Port 3000)...
cd next-gen-app
start "CampaignStudio Frontend" cmd /k "npm run dev"
cd ..

echo ✅ Services launching in separate windows.
echo 🌍 Open http://localhost:3000 in your browser.
