@echo off
REM Quick Start Script for Palpali E-Commerce

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║      🏺 PALPALI E-COMMERCE - QUICK START                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js from https://nodejs.org/
    exit /b 1
)
echo ✓ Node.js installed

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found!
    exit /b 1
)
echo ✓ npm installed

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm run install-all
if errorlevel 1 (
    echo ❌ Installation failed!
    exit /b 1
)
echo ✓ Dependencies installed

REM Create .env if it doesn't exist
if not exist server\.env (
    echo.
    echo 🔧 Creating server/.env...
    (
        echo MONGODB_URI=mongodb://localhost:27017/palpali
        echo JWT_SECRET=your-super-secret-key-change-in-production
        echo PORT=5000
        echo NODE_ENV=development
        echo CLIENT_URL=http://localhost:5173
    ) > server\.env
    echo ✓ Created server/.env (update with your MongoDB URI)
)

REM Start development
echo.
echo 🚀 Starting development servers...
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo 📝 Press Ctrl+C to stop
echo.
timeout /t 3
call npm run dev
