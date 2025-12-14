param ([switch]$AutoFix = $false)
$Compose = ".devcontainer/docker-compose.dev.yml"
$Dockerf = ".devcontainer/Dockerfile.toolbox"

if (-not (Test-Path $Compose)) { Write-Error "Compose file missing"; exit }

$content = Get-Content $Compose -Raw
if ($content -match "context:\s*\.\." -or $content -match "dockerfile:\s*Dockerfile.toolbox") {
    Write-Warning "?? Broken Config Detected."
    if ($AutoFix -or (Read-Host "Fix it? (y/n)") -eq 'y') {
        Set-Content -Path $Compose -Value "version: '3.8'
services:
  dev_env:
    build:
      context: .
      dockerfile: .devcontainer/Dockerfile.toolbox
    volumes:
      - .:/workspaces/CampaignStudio:cached
    command: sleep infinity
    network_mode: service:db"
        Write-Host "? Fixed. Run build again." -ForegroundColor Green
    }
} else { Write-Host "? Config looks good." -ForegroundColor Green }
