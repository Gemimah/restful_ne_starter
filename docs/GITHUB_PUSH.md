# Push to GitHub — `restful_ne_starter`

## One-time setup on GitHub

1. Sign in to [GitHub](https://github.com).
2. Click **New repository**.
3. Name: **`restful_ne_starter`** (must match the script default).
4. Leave it **empty** (no README, no .gitignore — this project already has them).
5. Click **Create repository**.

## Run the script (Windows)

From the project root in PowerShell:

```powershell
.\scripts\push-to-github.ps1
```

Or via npm:

```powershell
npm run push:github
```

The script will:

- Initialize Git if this folder is not a repo yet
- Ask for your **GitHub username** (first run only) and set `origin` to  
  `https://github.com/YOUR_USERNAME/restful_ne_starter.git`
- Stage all changes (`.env` files are **never** committed)
- Ask for a **commit message**
- Push to the `main` branch

### Push rejected (`fetch first`)?

This happens when GitHub already has commits (e.g. you created the repo **with a README** or an old template).

Your local folder has the real project. **Replace** what is on GitHub with your local code:

```powershell
.\scripts\push-to-github.ps1 -ReplaceRemote
```

Only use `-ReplaceRemote` if you do not need to keep the files currently on GitHub.

### With options

```powershell
.\scripts\push-to-github.ps1 -Username "YourGitHubUsername" -Message "TZW exam: fire extinguisher system"
```

```powershell
.\scripts\push-to-github.ps1 -ReplaceRemote -Message "TZW fire extinguisher management system"
```

```powershell
npm run push:github -- -Username "YourGitHubUsername" -Message "Initial commit"
```

## Authentication

When Git asks for credentials:

- **Username:** your GitHub username
- **Password:** a [Personal Access Token](https://github.com/settings/tokens) (classic token with `repo` scope), not your GitHub account password

Or install [GitHub CLI](https://cli.github.com/) and run `gh auth login`.

## Change remote later

```powershell
git remote set-url origin https://github.com/YOUR_USERNAME/restful_ne_starter.git
```
