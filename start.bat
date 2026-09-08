@echo off
chcp 65001 > nul
echo ===================================================
echo     IELTS Mock Test Platform - Ishga Tushirish
echo ===================================================
echo.

echo [1/3] Backend virtualenv tekshirilmoqda...
if not exist "backend\venv\Scripts\activate.bat" (
    echo [!] Virtualenv topilmadi. Yaratilmoqda...
    cd backend
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    python seed_data.py
    cd ..
)

echo [2/3] FastAPI Backend ishga tushirilmoqda (Port: 8000)...
start "IELTS Backend (FastAPI)" cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn app.main:app --port 8000 --reload"

timeout /t 3 /nobreak > nul

echo [3/3] Next.js Frontend ishga tushirilmoqda (Port: 3000)...
start "IELTS Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   Platforma muvaffaqiyatli ishga tushdi!
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:8000
echo   - API Docs:  http://localhost:8000/docs
echo.
echo   Login ma'lumotlari:
echo   - Admin:   admin@ielts.uz   / parol: admin123
echo   - Talaba:  student@ielts.uz / parol: student123
echo ===================================================
echo.
pause
