@echo off
REM Smart Campus - Start All Services
REM This script starts the Email Service, Java Backend, and Frontend

echo.
echo ========================================
echo   Smart Campus - Service Startup
echo ========================================
echo.

REM Start Email Service in new window
echo [1/3] Starting Email Service (Node.js + Nodemailer)...
cd email-service
start "Email Service" cmd /k npm start
cd ..
timeout /t 3

REM Start Java Backend in new window
echo [2/3] Starting Java Backend (Spring Boot)...
cd smart-campus
start "Java Backend" cmd /k mvn spring-boot:run
cd ..
timeout /t 3

REM Start Frontend in new window
echo [3/3] Starting Frontend (React + Vite)...
cd smart-campus-frontend
start "Frontend" cmd /k npm run dev
cd ..

echo.
echo ========================================
echo   All services starting in separate windows!
echo ========================================
echo.
echo Frontend:     http://localhost:5173
echo Backend:      http://localhost:8081
echo Email Service: http://localhost:3001
echo.
echo Press any key to exit this window...
pause
