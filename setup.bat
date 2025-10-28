@echo off
REM Vigilant Guard - Windows Setup Script

echo ========================================================
echo    Vigilant Guard - Automated Setup Script (Windows)
echo ========================================================
echo.

echo Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
node --version
echo [OK] Node.js found
echo.

echo Checking npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed.
    pause
    exit /b 1
)
npm --version
echo [OK] npm found
echo.

echo ========================================================
echo   Installing Dependencies
echo ========================================================
echo.

echo Installing root dependencies...
call npm install
echo [OK] Root dependencies installed
echo.

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Backend installation failed
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed

REM Create backend .env if not exists
if not exist .env (
    echo Creating backend .env file...
    copy .env.example .env
    echo [OK] Backend .env created
) else (
    echo [OK] Backend .env already exists
)

cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend installation failed
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed

REM Create frontend .env if not exists
if not exist .env (
    echo Creating frontend .env file...
    echo REACT_APP_API_URL=http://localhost:5000/api > .env
    echo REACT_APP_SOCKET_URL=http://localhost:5000 >> .env
    echo [OK] Frontend .env created
) else (
    echo [OK] Frontend .env already exists
)

cd ..

echo.
echo ========================================================
echo   Seeding Database
echo ========================================================
echo.

echo Seeding database with sample data...
cd backend
call npm run seed
if %errorlevel% neq 0 (
    echo [WARNING] Database seeding failed.
    echo Please ensure MongoDB is running.
)
echo [OK] Database seeded
cd ..

echo.
echo ========================================================
echo              Setup Complete!
echo ========================================================
echo.
echo [OK] All dependencies installed
echo [OK] Environment files created
echo [OK] Database seeded with test data
echo.
echo ========================================================
echo   How to Run
echo ========================================================
echo.
echo Option 1: Run both servers with one command
echo   npm run dev
echo.
echo Option 2: Run servers separately
echo   Terminal 1 (Backend):  cd backend ^&^& npm run dev
echo   Terminal 2 (Frontend): cd frontend ^&^& npm start
echo.
echo ========================================================
echo   Demo Credentials
echo ========================================================
echo.
echo   Employee Token: EMP001
echo   Employee Token: EMP002
echo   Employee Token: EMP003
echo   Password: (leave empty)
echo.
echo Happy monitoring with Vigilant Guard!
echo.
pause


