@echo off
echo Starting DISCOM Consumer Intelligence Application...

:: Backend
echo.
echo [1/2] Starting backend (FastAPI)...
cd backend
if not exist .env (
    copy .env.example .env
    echo Created .env from .env.example — please add your ANTHROPIC_API_KEY to backend\.env
)
pip install -r requirements.txt --quiet
start "DISCOM Backend" cmd /k "uvicorn app.main:app --reload --port 8000"
cd ..

:: Frontend
echo.
echo [2/2] Starting frontend (React + Vite)...
cd frontend
call npm install --silent
start "DISCOM Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ============================================
echo  App is starting...
echo  Frontend: http://localhost:5173
echo  Backend API: http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo ============================================
echo.
echo After both windows start, open http://localhost:5173
echo Then click "Seed Demo Data" on the dashboard to load 200 consumers.
echo.
echo To enable the AI chatbot, add your Anthropic API key to backend\.env
echo ANTHROPIC_API_KEY=sk-ant-...
echo.
pause
