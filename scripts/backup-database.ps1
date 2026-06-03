# TZW LTD — PostgreSQL backup (Windows PowerShell)
# Usage: .\scripts\backup-database.ps1

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envFile = Join-Path $root ".env"

if (-not (Test-Path $envFile)) {
    Write-Error "Root .env not found at $envFile"
    exit 1
}

$content = Get-Content $envFile -Raw
if ($content -match 'DATABASE_URL="postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?"]+)') {
    $user = $matches[1]
    $pass = $matches[2]
    $host = $matches[3]
    $port = $matches[4]
    $db = $matches[5]
} else {
    Write-Error "Could not parse DATABASE_URL from .env"
    exit 1
}

$backupsDir = Join-Path $root "backups"
New-Item -ItemType Directory -Force -Path $backupsDir | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$outfile = Join-Path $backupsDir "${db}_${timestamp}.sql"

$env:PGPASSWORD = $pass
Write-Host "Exporting $db to $outfile..."

pg_dump -U $user -h $host -p $port -d $db -F p -f $outfile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup saved: $outfile" -ForegroundColor Green
} else {
    Write-Error "pg_dump failed. Add PostgreSQL bin to PATH or run: npm run db:backup"
    exit 1
}
