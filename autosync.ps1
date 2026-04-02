# Auto-Sync Git Script - Commit on Save
# Committed automatisch bei Dateiänderungen mit FileSystemWatcher

$RepoPath = "w:\web\htdocs\HypixelProfileEvo"
$DebounceMs = 2000  # 2 Sekunden Debounce um mehrfache Commits zu vermeiden

Set-Location $RepoPath

# Git Credentials voreinstellen (für Auto-Auth)
git config credential.helper store
git config user.email "autosync@hypixelprofile.local"
git config user.name "AutoSync Bot"

Write-Host "🚀 Auto-Sync (Commit on Save) gestartet" -ForegroundColor Green
Write-Host "📁 Überwache: $RepoPath" -ForegroundColor Cyan
Write-Host "⏱️  Debounce: ${DebounceMs}ms" -ForegroundColor Cyan
Write-Host "🔐 Git Credentials: caching enabled" -ForegroundColor Yellow
Write-Host "🛑 Drücke Ctrl+C zum Beenden`n" -ForegroundColor Red

# FileSystemWatcher erstellen
$Watcher = New-Object System.IO.FileSystemWatcher
$Watcher.Path = $RepoPath
$Watcher.Filter = "*.*"
$Watcher.IncludeSubdirectories = $true
$Watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite, [System.IO.NotifyFilters]::FileName

# Debounce-Tracking
$LastCommitTime = [System.DateTime]::MinValue
$PendingChanges = $false

# File Change Handler
$FileChangeAction = {
    param($Source, $EventArgs)
    
    # Ignoriere Git-interne Dateien
    if ($EventArgs.FullPath -match "\.git|\.vscode|node_modules|\.ps1") {
        return
    }
    
    global:$PendingChanges = $true
}

# Handler für File Created/Changed/Deleted
$ChangeHandler = Register-ObjectEvent -InputObject $Watcher -EventName "Changed" `
    -Action $FileChangeAction -ErrorAction SilentlyContinue

# Hauptschleife für Commit
while ($true) {
    if ($PendingChanges) {
        $TimeSinceLastCommit = ((Get-Date) - $LastCommitTime).TotalMilliseconds
        
        if ($TimeSinceLastCommit -ge $DebounceMs) {
            try {
                $status = git status --porcelain
                
                if ($status) {
                    $changeCount = ($status | Measure-Object -Line).Lines
                    Write-Host "$(Get-Date -Format 'HH:mm:ss') - 💾 Saving $changeCount file(s)..." -ForegroundColor Yellow
                    
                    # Stage & Commit
                    git add -A
                    $commitMsg = "auto-save: $(Get-Date -Format 'HH:mm:ss')"
                    git commit -m $commitMsg --quiet
                    
                    # Push mit Auto-Auth
                    $pushOutput = git push 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "$(Get-Date -Format 'HH:mm:ss') - ✅ Committed & Pushed" -ForegroundColor Green
                    } else {
                        Write-Host "$(Get-Date -Format 'HH:mm:ss') - ⚠️  Push fehlgeschlagen (local commit ok)" -ForegroundColor Yellow
                    }
                    
                    $LastCommitTime = Get-Date
                    $global:PendingChanges = $false
                }
            } catch {
                Write-Host "$(Get-Date -Format 'HH:mm:ss') - ❌ Fehler: $_" -ForegroundColor Red
            }
        }
    }
    
    Start-Sleep -Milliseconds 500
}

# Cleanup
Unregister-Event -SourceIdentifier $ChangeHandler.Name -ErrorAction SilentlyContinue
$Watcher.Dispose()

