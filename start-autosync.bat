@echo off
REM Auto-Sync Git Starter - Commit on Save

title HypixelProfileEvo Auto-Sync
cd /d "w:\web\htdocs\HypixelProfileEvo"

echo.
echo ===================================
echo   Auto-Sync Git (Commit on Save)
echo ===================================
echo.
echo Starting PowerShell script...
echo.

powershell -ExecutionPolicy Bypass -File "autosync.ps1"

pause
