# Smart Campus - Start All Services (PowerShell)
# This script starts the Email Service, Java Backend, and Frontend

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Smart Campus - Service Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to start service in new window
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$Path,
        [string]$Command
    )
    
    Write-Host "[*] Starting $ServiceName..." -ForegroundColor Yellow
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = "powershell"
    $processInfo.Arguments = "-NoExit -Command `"Set-Location '$Path'; $Command`""
    $processInfo.UseShellExecute = $true
    [System.Diagnostics.Process]::Start($processInfo) | Out-Null
}

$projectRoot = Get-Location

# Start Email Service
Start-Service -ServiceName "Email Service (Node.js + Nodemailer)" `
              -Path "$projectRoot\email-service" `
              -Command "npm start"
Start-Sleep -Seconds 3

# Start Java Backend
Start-Service -ServiceName "Java Backend (Spring Boot)" `
              -Path "$projectRoot\smart-campus" `
              -Command "mvn spring-boot:run"
Start-Sleep -Seconds 3

# Start Frontend
Start-Service -ServiceName "Frontend (React + Vite)" `
              -Path "$projectRoot\smart-campus-frontend" `
              -Command "npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   All services starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access your services at:" -ForegroundColor Cyan
Write-Host "  Frontend:      http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend:       http://localhost:8081" -ForegroundColor Green
Write-Host "  Email Service: http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "Services are opening in separate PowerShell windows..." -ForegroundColor Yellow
Write-Host ""
