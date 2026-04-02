# 🚀 Auto-Sync & Deploy Setup

Vollautomatischer Workflow für HypixelProfileEvo:

- **Dev-PC**: Auto-Commit & Push → GitHub
- **Live-Server**: Auto-Pull von GitHub → Live

---

## 📋 Setup-Übersicht

```
┌─ Dev-PC ─────────────────┐
│ autosync.ps1             │  ← Startet mit: start-autosync.bat
│ (Commit on Save)         │  ← Pusht zu: GitHub
│ ↓                        │
└──────────────────────────┘
         ↓ (Push)
    GitHub Repo
         ↓ (Pull)
┌─ Live-Server ────────────┐
│ deploy-pull.ps1          │  ← Lauft dauernd (Hintergrund/Task)
│ (Auto-Pull jeden 60s)    │  ← Zieht Files von GitHub
└──────────────────────────┘
```

---

## 🖥️ **DEV-PC Setup** (Dein aktueller PC)

### 1. Auto-Sync starten

```bash
# Einfach doppelklick auf:
start-autosync.bat

# oder in PowerShell:
.\autosync.ps1
```

### 2. Was passiert:

- ✅ Jede Dateiänderung wird erkannt
- ✅ Automatisch committed (2s Debounce)
- ✅ Automatisch zu GitHub gepusht

---

## 🌐 **LIVE-SERVER Setup**

### 1. Konfiguriere deploy-pull.ps1

**Bearbeite diese Zeile** in `deploy-pull.ps1`:

```powershell
$RepoPath = "C:\inetpub\wwwroot\HypixelProfileEvo"  # <- HIER ANPASSEN!
```

Ersetze mit deinem echten Live-Server Pfad, z.B.:

- IIS: `C:\inetpub\wwwroot\HypixelProfileEvo`
- Apache: `/var/www/html/HypixelProfileEvo`
- Custom: Was auch immer dein Pfad ist

### 2. Script im Hintergrund starten

**Option A: PowerShell (lokal testen)**

```powershell
.\deploy-pull.ps1
```

**Option B: Windows Task Scheduler (Dauerläufer)**

1. `Win+R` → `taskschd.msc`
2. "Task erstellen"
   - **Name**: "HypixelEVO Deploy-Pull"
   - **Auslöser**: Beim Systemstart / Benutzer anmelden
   - **Aktionen**:
     ```
     Programm: C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe
     Argumente: -ExecutionPolicy Bypass -File "C:\pfad\deploy-pull.ps1"
     ```
   - **Optionen**: "Task auch wenn Benutzer nicht angemeldet" aktivieren

**Option C: GitHub Actions (automatisch, ohne Live-Server Script)**

- Noch besser: GitHub Actions im Repo als CI/CD Pipeline

### 3. Optional: IIS App Pool Neustarten

Falls die Webseite gecacht wird, uncommentiere diese Zeile in `deploy-pull.ps1`:

```powershell
& "C:\Windows\System32\inetsrv\appcmd.exe" recycle apppool /apppool.name:"HypixelProfileEvo"
```

---

## 🔐 GitHub Authentication Setup

### SSH-Keys (empfohlen, sicherer)

```bash
# Auf Dev-PC UND Live-Server:
ssh-keygen -t ed25519 -C "your@email.com"
# In GitHub Settings → Deploy Keys einfügen
```

### oder: Credentials caching (einfacher)

```bash
git config credential.helper store
# Beim ersten Push: Username/Token eingeben
# Wird gespeichert in: ~/.git-credentials
```

---

## 📊 Monitoring

### Dev-PC Log (Terminal)

```
13:45:23 - 💾 Saving 3 file(s)...
13:45:25 - ✅ Committed & Pushed
```

### Live-Server Log (Task-Scheduler Logs)

```
14:00:00 - ✓ Aktuell
14:01:00 - 🔄 Neue Updates gefunden, pullen...
14:01:05 - ✅ Erfolgreich gepullt & deployed
```

---

## 🧪 Test machen

1. **Dev-PC**: Ändere eine Datei (z.B. `style.css`)
2. **Speichern** - Script detectet automatisch
3. **GitHub**: Schau nach ob neue Commit da ist
4. **Live-Server**: Nach max 60s sollte Pull stattfinden

---

## ⚡ Troubleshooting

| Problem                | Lösung                                          |
| ---------------------- | ----------------------------------------------- |
| Push schlägt fehl      | `git config user.email` + `user.name` setzen    |
| Pull schlägt fehl      | SSH-Keys oder Token überprüfen                  |
| Alte Version live      | `git status` in Live-Server Ordner überprüfen   |
| Dateien nicht sichtbar | Browser Cache löschen oder Server-Cache clearen |

---

## 🎯 Übersicht alle Scripts

| Script               | Ort         | Was            | Start                                 |
| -------------------- | ----------- | -------------- | ------------------------------------- |
| `autosync.ps1`       | Dev-PC      | Commit on Save | `start-autosync.bat`                  |
| `deploy-pull.ps1`    | Live-Server | Auto-Pull      | PowerShell direkt oder Task Scheduler |
| `start-autosync.bat` | Dev-PC      | Launcher       | Doppelklick                           |

---

Viel Erfolg! 🚀
