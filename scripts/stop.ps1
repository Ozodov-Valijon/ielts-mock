$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$statePath = Join-Path $projectRoot '.runtime\processes.json'
if (-not (Test-Path -LiteralPath $statePath)) { Write-Host 'Saqlangan server jarayoni yo''q.'; exit }
$state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
foreach ($savedProcess in @($state.backend, $state.frontend)) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $savedProcess"
    if ($process -and $process.CommandLine -and $process.CommandLine.IndexOf($projectRoot, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
        Stop-Process -Id $savedProcess
        Write-Host "Loyiha serveri to''xtadi: $savedProcess"
    }
}
