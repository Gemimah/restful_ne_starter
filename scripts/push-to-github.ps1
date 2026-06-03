# Push restful_ne_starter to GitHub
# Usage:
#   .\scripts\push-to-github.ps1
#   .\scripts\push-to-github.ps1 -Message "Add registration validation"
#   .\scripts\push-to-github.ps1 -Username "YourGitHubUsername"
#   npm run push:github

param(
    [Parameter(Mandatory = $false)]
    [string] $Message,

    [Parameter(Mandatory = $false)]
    [string] $Username,

    [Parameter(Mandatory = $false)]
    [string] $Branch = "main",

    [Parameter(Mandatory = $false)]
    [string] $RepoName = "restful_ne_starter",

    # Use when GitHub was created with a README or has an old template you want to replace
    [Parameter(Mandatory = $false)]
    [switch] $ReplaceRemote
)

$ErrorActionPreference = "Stop"

function Write-Step($text) {
    Write-Host "`n==> $text" -ForegroundColor Cyan
}

function Write-Ok($text) {
    Write-Host $text -ForegroundColor Green
}

function Write-Warn($text) {
    Write-Host $text -ForegroundColor Yellow
}

function Write-Err($text) {
    Write-Host "ERROR: $text" -ForegroundColor Red
}

# Repo root (parent of scripts/)
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "TZW LTD - Push to GitHub ($RepoName)" -ForegroundColor White
Write-Host "Working directory: $root"

# Git installed?
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Err "Git is not installed or not on PATH. Install from https://git-scm.com/download/win"
    exit 1
}

# --- Initialize repository if needed ---
if (-not (Test-Path (Join-Path $root ".git"))) {
    Write-Step "Initializing new Git repository..."
    git init -b $Branch
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Ok "Git repository initialized (branch: $Branch)"
} else {
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = "SilentlyContinue"
    $currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
    $ErrorActionPreference = $prevEap
    if ($currentBranch) { $Branch = $currentBranch }
}

# --- Remote origin ---
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
$remoteUrl = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) { $remoteUrl = $null }
$ErrorActionPreference = $prevEap

if (-not $remoteUrl) {
    if (-not $Username) {
        $Username = Read-Host "Enter your GitHub username (for https://github.com/USER/$RepoName.git)"
    }
    if ([string]::IsNullOrWhiteSpace($Username)) {
        Write-Err "GitHub username is required to set the remote."
        exit 1
    }
    $remoteUrl = "https://github.com/$Username/$RepoName.git"
    Write-Step "Adding remote origin: $remoteUrl"
    git remote add origin $remoteUrl
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Ok "Remote origin added."
    Write-Warn "Create the empty repo on GitHub first if it does not exist:"
    Write-Warn "  https://github.com/new - Repository name: $RepoName (no README if you already have code)"
} else {
    Write-Ok "Remote origin: $remoteUrl"
}

# --- Safety: block secrets ---
Write-Step "Checking for sensitive files..."
$envFiles = @()
if (Test-Path (Join-Path $root ".env")) { $envFiles += ".env" }
Get-ChildItem -Path $root -Recurse -Filter ".env" -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notlike "*\node_modules\*" } |
    ForEach-Object {
        $rel = $_.FullName.Substring($root.Length + 1)
        if ($envFiles -notcontains $rel) { $envFiles += $rel }
    }

if ($envFiles.Count -gt 0) {
    Write-Warn "These .env files exist locally (must NOT be committed):"
    $envFiles | ForEach-Object { Write-Warn "  - $_" }
}

$stagedSecrets = git ls-files --cached 2>$null | Where-Object { $_ -match "(^|/)\.env$|credentials|\.pem$|id_rsa" }
if ($stagedSecrets) {
    Write-Err "Sensitive files are already staged. Unstage them before pushing:"
    $stagedSecrets | ForEach-Object { Write-Err "  $_" }
    exit 1
}

# --- Stage changes ---
Write-Step "Staging changes (respects .gitignore)..."
git add -A
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$aboutToStageEnv = git diff --cached --name-only 2>$null | Where-Object { $_ -match "(^|/)\.env$" }
if ($aboutToStageEnv) {
    Write-Err "Aborting: .env would be committed. Add .env to .gitignore and run: git reset HEAD"
    $aboutToStageEnv | ForEach-Object { Write-Err "  $_" }
    exit 1
}

$status = git status --porcelain
if (-not $status) {
    Write-Ok "No changes to commit."
} else {
    Write-Host ""
    git status -s

    if (-not $Message) {
        $Message = Read-Host "`nCommit message"
    }
    if ([string]::IsNullOrWhiteSpace($Message)) {
        Write-Err "Commit message is required."
        exit 1
    }

    Write-Step "Creating commit..."
    git commit -m "$Message"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Ok "Commit created."
}

# --- Sync with remote (if it exists) ---
Write-Step "Checking GitHub for existing commits..."
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "SilentlyContinue"
git fetch origin 2>$null
$ErrorActionPreference = $prevEap

$remoteRef = "origin/$Branch"
git rev-parse --verify $remoteRef 2>$null | Out-Null
$hasRemoteBranch = ($LASTEXITCODE -eq 0)

if ($hasRemoteBranch) {
    $behindCount = [int](git rev-list --count "HEAD..$remoteRef" 2>$null)
    $aheadCount = [int](git rev-list --count "$remoteRef..HEAD" 2>$null)

    if ($behindCount -gt 0) {
        Write-Warn "GitHub has $behindCount commit(s) that are not in your local folder."
        Write-Warn "Common cause: repository was created with a README or an older template on GitHub."

        if ($ReplaceRemote) {
            Write-Step "Replacing GitHub branch with your local code (-ReplaceRemote)..."
            git push --force-with-lease -u origin $Branch
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Ok "Successfully replaced remote and pushed to GitHub!"
                if ($remoteUrl) {
                    $web = $remoteUrl -replace "\.git$", ""
                    $web = $web -replace "^git@github\.com:", "https://github.com/"
                    Write-Ok "Repository: $web"
                }
                exit 0
            }
            Write-Err "Force push failed. Close GitHub in the browser and try again."
            exit $LASTEXITCODE
        }

        Write-Host ""
        Write-Err "Push would be rejected (fetch first)."
        Write-Warn "Your local project should replace what is on GitHub. Run:"
        Write-Warn "  .\scripts\push-to-github.ps1 -ReplaceRemote"
        Write-Warn "Or with a message:"
        Write-Warn "  .\scripts\push-to-github.ps1 -ReplaceRemote -Message `"TZW fire extinguisher system`""
        Write-Warn "Only use -ReplaceRemote if you do NOT need to keep the current GitHub files."
        exit 1
    }

    if ($aheadCount -eq 0 -and -not (git status --porcelain)) {
        Write-Ok "Already up to date with GitHub."
        exit 0
    }
}

# --- Push ---
Write-Step "Pushing to GitHub (origin $Branch)..."
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
git push -u origin $Branch
$pushFailed = ($LASTEXITCODE -ne 0)
$ErrorActionPreference = $prevEap

if ($pushFailed) {
    Write-Host ""
    Write-Err "Push failed."
    Write-Warn "If you saw 'fetch first' or 'rejected', run:"
    Write-Warn "  .\scripts\push-to-github.ps1 -ReplaceRemote"
    Write-Warn "Other fixes:"
    Write-Warn "  1. Create the repo on GitHub: https://github.com/new?name=$RepoName"
    Write-Warn "  2. Sign in: git credential manager  OR use a Personal Access Token as password"
    Write-Warn "  3. Wrong remote?  git remote set-url origin https://github.com/USER/$RepoName.git"
    Write-Warn "  4. Branch name: try  git push -u origin HEAD"
    exit $LASTEXITCODE
}

Write-Host ""
Write-Ok "Successfully pushed to GitHub!"
if ($remoteUrl) {
    $web = $remoteUrl -replace "\.git$", ""
    $web = $web -replace "^git@github\.com:", "https://github.com/"
    Write-Ok "Repository: $web"
}
