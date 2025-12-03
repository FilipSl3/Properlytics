@echo off
title Konfiguracja Projektu Properlytics
color 0A

echo ========================================================
echo      PROPERLYTICS - AUTOMATYCZNA INSTALACJA
echo ========================================================
echo.

:: ---------------------------------------
:: KROK 1: BACKEND (Python)
:: ---------------------------------------
echo [1/2] Konfiguracja Backendu (Python + FastAPI)...
echo --------------------------------------------------

cd backend
if %errorlevel% neq 0 (
    color 0C
    echo BLAD: Nie mozna znalezc katalogu 'backend'. Czy na pewno uruchamiasz skrypt z katalogu glownego Properlytics?
    pause
    exit /b 1
)

:: Sprawdzamy czy Python jest zainstalowany
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo BLAD: Python nie jest zainstalowany lub nie ma go w PATH!
    echo Wykonaj kroki z poprzedniej wiadomosci, aby go dodac.
    pause
    exit /b 1
)

:: Tworzenie venv, jesli nie istnieje
if not exist venv (
    echo [+] Tworzenie wirtualnego srodowiska (venv)...
    python -m venv venv
) else (
    echo [i] Venv juz istnieje. Pomijam tworzenie.
)

:: Instalacja zaleznosci
echo [+] Instalacja bibliotek z requirements.txt...
call venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    color 0C
    echo BLAD: Instalacja zaleznosci Python sie nie powiodla! Sprawdz plik requirements.txt.
    pause
    exit /b 1
)

:: Powrot do glownego katalogu
cd ..
echo.

:: ---------------------------------------
:: KROK 2: FRONTEND (React)
:: ---------------------------------------
echo [2/2] Konfiguracja Frontendu (React + Node.js)...
echo --------------------------------------------------

cd frontend
if %errorlevel% neq 0 (
    color 0C
    echo BLAD: Nie mozna znalezc katalogu 'frontend'.
    pause
    exit /b 1
)

:: Sprawdzamy czy Node.js jest zainstalowany
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo BLAD: Node.js nie jest zainstalowany! Pobierz go ze strony nodejs.org
    pause
    exit /b 1
)

:: Instalacja paczek
echo [+] Instalacja zaleznosci npm (moze to chwile potrwac)...
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo BLAD: Instalacja zaleznosci npm sie nie powiodla! Sprawdz plik package.json w folderze frontend.
    pause
    exit /b 1
)

:: Powrot do glownego katalogu
cd ..
echo.

color 0A
echo ========================================================
echo      SUKCES! Srodowisko gotowe do pracy.
echo ========================================================
echo.
echo Nacisnij dowolny klawisz, aby zamknac okno...
pause