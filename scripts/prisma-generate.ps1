# Stop Node processes that lock Prisma query_engine, then regenerate client.
# Run from repo root: .\scripts\prisma-generate.ps1

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

$node = Get-Process node -ErrorAction SilentlyContinue
if ($node) {
  Write-Host 'Stopping Node.js processes (close npm run dev first if possible)...' -ForegroundColor Yellow
  $node | Stop-Process -Force
  Start-Sleep -Seconds 2
}

Write-Host 'Generating Prisma client...' -ForegroundColor Cyan
npx prisma generate --schema=prisma/schema.prisma
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host 'If EPERM persists: close Cursor terminals, end Node in Task Manager, then run this script again.' -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host 'Done. Start the app with: npm run dev' -ForegroundColor Green
