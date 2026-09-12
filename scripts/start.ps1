param([switch]$SkipInstall)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $projectRoot 'backend'
$frontendDir = Join-Path $projectRoot 'frontend'
$runtimeDir = Join-Path $projectRoot '.runtime'
$pythonPath = Join-Path $backendDir 'venv\Scripts\python.exe'
New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
if (-not (Test-Path -LiteralPath $pythonPath)) {
    & python -m venv (Join-Path $backendDir 'venv')
    if ($LASTEXITCODE -ne 0) { throw 'Python 3.12+ o''rnating.' }
}
if (-not $SkipInstall) {
    & $pythonPath -m pip install -r (Join-Path $backendDir 'requirements.txt')
    if ($LASTEXITCODE -ne 0) { throw 'Backend paketlari o''rnatilmadi.' }
    Push-Location $frontendDir
    try {
        & npm.cmd ci
        if ($LASTEXITCODE -ne 0) { throw 'Frontend paketlari o''rnatilmadi.' }
    } finally { Pop-Location }
}
Push-Location $backendDir
try {
    & $pythonPath bootstrap.py
    if ($LASTEXITCODE -ne 0) { throw 'Baza tayyorlanmadi; yuqoridagi xatoni tekshiring.' }
} finally { Pop-Location }

foreach ($port in @(8000, 3000)) {
    if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
        throw "$port port band. Avval ishlayotgan loyiha serverini to''xtating."
    }
}
$backend = Start-Process -FilePath $pythonPath -ArgumentList @('-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8000') -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtimeDir 'backend.log') -RedirectStandardError (Join-Path $runtimeDir 'backend-error.log')
$nodePath = (Get-Command node.exe).Source
$nextPath = Join-Path $frontendDir 'node_modules\next\dist\bin\next'
$frontend = Start-Process -FilePath $nodePath -ArgumentList @(('"' + $nextPath + '"'),'dev','--hostname','127.0.0.1','--port','3000') -WorkingDirectory $frontendDir -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtimeDir 'frontend.log') -RedirectStandardError (Join-Path $runtimeDir 'frontend-error.log')
@{ backend = $backend.Id; frontend = $frontend.Id } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $runtimeDir 'processes.json')
$ready = $false
for ($attempt = 0; $attempt -lt 40; $attempt++) {
    try {
        $apiResponse = Invoke-WebRequest 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 2
        $webResponse = Invoke-WebRequest 'http://127.0.0.1:3000/' -UseBasicParsing -TimeoutSec 2
        if ($apiResponse.StatusCode -eq 200 -and $webResponse.StatusCode -eq 200) { $ready = $true; break }
    } catch { Start-Sleep -Milliseconds 1000 }
}
if (-not $ready) { throw "Server tayyor bo''lmadi. Loglar: $runtimeDir" }
Write-Host 'Tayyor: http://localhost:3000'
Write-Host 'Admin yaratish: backend\venv\Scripts\python.exe backend\bootstrap.py --admin-email EMAIL'
Write-Host 'To''xtatish: powershell -File scripts\stop.ps1'
