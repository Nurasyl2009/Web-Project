# TravelWay — Setup Script (run this once)
# Open PowerShell in the Project AI folder and run: .\setup.ps1

Write-Host "=== TravelWay Setup ===" -ForegroundColor Cyan

# 1. Install backend dependencies
Write-Host "`n[1/4] Installing backend packages..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "Backend install failed" -ForegroundColor Red; exit 1 }
Write-Host "Backend packages installed!" -ForegroundColor Green

# 2. Install frontend dependencies
Write-Host "`n[2/4] Installing frontend packages..." -ForegroundColor Yellow
Set-Location client
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend install failed" -ForegroundColor Red; exit 1 }
Set-Location ..
Write-Host "Frontend packages installed!" -ForegroundColor Green

# 3. Initialize Git
Write-Host "`n[3/4] Setting up Git..." -ForegroundColor Yellow
git init
git add .
git commit -m "feat: initial TravelWay project setup"
git add client/
git commit -m "feat: add React frontend (Vite + React Router)"
git add routes/ middleware/ server.js init-db.js
git commit -m "feat: add Express REST API with JWT auth and PostgreSQL"
git add README.md .gitignore
git commit -m "docs: add README, API documentation, and gitignore"
Write-Host "Git initialized with commits!" -ForegroundColor Green

# 4. Initialize Database (optional — only if PostgreSQL is running)
Write-Host "`n[4/4] Database setup (requires PostgreSQL running)" -ForegroundColor Yellow
Write-Host "To create tables, run: node init-db.js" -ForegroundColor Cyan

Write-Host "`n=== Setup complete! ===" -ForegroundColor Green
Write-Host "To start backend:  node server.js" -ForegroundColor White
Write-Host "To start frontend: cd client && npm run dev" -ForegroundColor White
