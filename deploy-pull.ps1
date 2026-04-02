# Deploy-Pull Script - Für Live-Server (Auto-Pull von GitHub)
# Diese Datei läuft auf dem LIVE-SERVER und pullt automatisch von GitHub

$RepoPath = "C:\inetpub\wwwroot\HypixelProfileEvo"  # ANPASSEN zu deinem Live-Server Pfad!
$CheckIntervalSeconds = 60  # Jede Minute checken

# Stelle sicher, dass Git installiert und konfiguriert ist
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git nicht installiert!" -ForegroundColor Red
    exit 1
}

# Git Credentials für Live-Server (falls SSH nicht eingerichtet)
git config --global credential.helper store

Set-Location $RepoPath

Write-Host "🚀 Deploy-Pull gestartet (Live-Server)" -ForegroundColor Green
Write-Host "📁 Repository: $RepoPath" -ForegroundColor Cyan
Write-Host "🔄 Check-Interval: $CheckIntervalSeconds Sekunden" -ForegroundColor Cyan
Write-Host "🛑 Drücke Ctrl+C zum Beenden`n" -ForegroundColor Red

$LastPullHash = git rev-parse HEAD

while ($true) {
    try {
        # Fetch latest from GitHub
        git fetch origin master --quiet
        
        $LatestHash = git rev-parse origin/master
        
        # Wenn neue Commits da sind, pull & deploy
        if ($LastPullHash -ne $LatestHash) {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') - 🔄 Neue Updates gefunden, pullen..." -ForegroundColor Yellow
            
            # Pull latest
            $pullResult = git pull origin master 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "$(Get-Date -Format 'HH:mm:ss') - ✅ Erfolgreich gepullt & deployed" -ForegroundColor Green
                
                # Optional: IIS App Pool neustarten (nur Windows IIS)
                # Unkommentieren falls auf IIS gehostet:
                # & "C:\Windows\System32\inetsrv\appcmd.exe" recycle apppool /apppool.name:"HypixelProfileEvo"
                
                $LastPullHash = $LatestHash
            } else {
                Write-Host "$(Get-Date -Format 'HH:mm:ss') - ❌ Pull-Fehler: $pullResult" -ForegroundColor Red
            }
        } else {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') - ✓ Aktuell" -ForegroundColor Gray
        }
    } catch {
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - ❌ Fehler: $_" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds $CheckIntervalSeconds
}
