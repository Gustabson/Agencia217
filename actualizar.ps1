# Regenera manifest.json escaneando documentos/ y recursos/
# Doble-click en actualizar.bat lo ejecuta sin abrir consola.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Get-FolderItems($folder) {
    $path = Join-Path $root $folder
    if (-not (Test-Path $path)) { return @() }
    Get-ChildItem -Path $path -File |
        Where-Object { -not $_.Name.StartsWith('.') } |
        Sort-Object Name |
        ForEach-Object {
            [ordered]@{
                name = $_.Name
                size = [int64]$_.Length
            }
        }
}

$manifest = [ordered]@{
    documentos = @(Get-FolderItems 'documentos')
    recursos   = @(Get-FolderItems 'recursos')
}

$json = $manifest | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText((Join-Path $root 'manifest.json'), $json + "`n", [System.Text.UTF8Encoding]::new($false))

$totalDocs = $manifest.documentos.Count
$totalRec  = $manifest.recursos.Count
Write-Host ""
Write-Host "  OK  manifest.json actualizado" -ForegroundColor Green
Write-Host "      Documentos: $totalDocs"
Write-Host "      Recursos:   $totalRec"
Write-Host ""
Write-Host "  Acordate de hacer:  git add . ; git commit -m 'Actualizo archivos' ; git push" -ForegroundColor Yellow
Write-Host ""
