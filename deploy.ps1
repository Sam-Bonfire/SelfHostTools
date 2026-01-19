# Deploy Script for Calculators Project
Set-PSDebug -Off
try { Set-PSDebug -Trace 0 } catch {}

$ErrorActionPreference = "Stop"

# 1. Define Paths
# 1. Define Paths
$RepoRoot = $PSScriptRoot
$BuildOutputDir = Join-Path $RepoRoot "apps\calculators\dist"

# Function to parse .env file
function Load-EnvFile {
    param ($Path)
    if (Test-Path $Path) {
        Get-Content $Path | ForEach-Object {
            if ($_ -match '^\s*([^#=]+?)\s*=\s*(.*)\s*$') {
                $var = $matches[1]
                $val = $matches[2]
                if (-not (Test-Path Env:\$var)) {
                    [Environment]::SetEnvironmentVariable($var, $val, "Process")
                }
            }
        }
    }
}

# Try loading .env files (local takes precedence)
Load-EnvFile (Join-Path $RepoRoot ".env")
Load-EnvFile (Join-Path $RepoRoot ".env.local")

$DestinationPath = $env:DEPLOY_DESTINATION_PATH

if ([string]::IsNullOrWhiteSpace($DestinationPath)) {
    Write-Error "[ERROR] DEPLOY_DESTINATION_PATH is not set."
    Write-Host "Please set the DEPLOY_DESTINATION_PATH environment variable or add it to a .env.local file in the root directory." -ForegroundColor Yellow
    Write-Host "Example in .env.local:"
    Write-Host "DEPLOY_DESTINATION_PATH=\\ares.yomite.in@SSL\DavWWWRoot\services\NginxHosting\calculators"
    exit 1
}

Write-Host "--------------------------------------------------"
Write-Host "[DEPLOY] Starting Deployment Process"
Write-Host "   Source:      $BuildOutputDir"
Write-Host "   Destination: $DestinationPath"
Write-Host "--------------------------------------------------"

# 2. Build the Project
Write-Host "[BUILD] Building 'calculators' workspace..."

$npmArgs = "--filter", "calculators", "run", "build", "-s", "--", "--logLevel", "warn"
$process = Start-Process -FilePath "pnpm.cmd" -ArgumentList $npmArgs -NoNewWindow -PassThru -Wait

if ($process.ExitCode -ne 0) {
    Write-Error "[ERROR] Build failed with exit code $($process.ExitCode)"
    exit 1
}
Write-Host "[SUCCESS] Build successful!" -ForegroundColor Green

# 3. Verify Build Output
if (-not (Test-Path $BuildOutputDir)) {
    Write-Error "[ERROR] Build output directory not found at: $BuildOutputDir"
    exit 1
}

# 4. Deploy to WebDAV
Write-Host "[DEPLOY] Deploying to: $DestinationPath"

if (-not (Test-Path $DestinationPath)) {
    Write-Host "   Creating destination directory..."
    New-Item -ItemType Directory -Force -Path $DestinationPath | Out-Null
}
else {
    Write-Host "   Cleaning up old HTML, CSS, and JS files..."
    Get-ChildItem -Path $DestinationPath -Include *.html, *.css, *.js -Recurse | Remove-Item -Force
}

# Copy Files
Write-Host "   Copying files..."
try {
    Copy-Item -Path "$BuildOutputDir\*" -Destination $DestinationPath -Recurse -Force
    Write-Host "[SUCCESS] Files deployed successfully!" -ForegroundColor Green
}
catch {
    Write-Error "[ERROR] Deployment failed: $_"
    exit 1
}

Write-Host "--------------------------------------------------"
Write-Host "[FINISH] Deployment Complete!"
Write-Host "--------------------------------------------------"