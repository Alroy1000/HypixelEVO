@echo off
REM Deploy-Pull Starter für Live-Server
REM Diese Datei auf dem LIVE-SERVER ausführen

title HypixelProfileEvo Deploy-Pull (Live-Server)
cd /d "C:\inetpub\wwwroot\HypixelProfileEvo"

if not exist "deploy-pull.ps1" (
    echo ERROR: deploy-pull.ps1 nicht gefunden!
    pause
    exit /b 1
)

echo.
echo ===================================
echo   Deploy-Pull (Live-Server)
echo ===================================
echo.
echo Starte Auto-Pull von GitHub...
echo Neue Commits werden jede 60 Sekunden gepullt.
echo.

powershell -ExecutionPolicy Bypass -File "deploy-pull.ps1"

pause
