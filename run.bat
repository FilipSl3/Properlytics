@echo off
title Uruchamianie Properlytics
echo ==========================================
echo    STARTOWANIE SYSTEMU PROPERLYTICS
echo ==========================================

echo.
echo 1. Uruchamianie Backend API (Port 8000)...
start "Backend API" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload"

echo 2. Uruchamianie Frontend React (Port 3000)...
start "Frontend UI" cmd /k "cd frontend && npm start"

echo.
echo Gotowe! Okna powinny sie otworzyc.
echo Mozesz zamknac to okno (serwery dzialaja w tle).
timeout /t 5