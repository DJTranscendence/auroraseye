Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "==> Aurora's Eye setup (Windows)"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is required. Install from https://nodejs.org and re-run this script."
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm is required. Install Node.js from https://nodejs.org and re-run this script."
  exit 1
}

Write-Host "==> Installing npm dependencies"
npm install

function Install-WithWinget {
  param(
    [Parameter(Mandatory = $true)][string]$Id,
    [Parameter(Mandatory = $true)][string]$Name
  )

  Write-Host "==> Installing $Name with winget"
  winget install --id $Id --exact --silent --accept-package-agreements --accept-source-agreements | Out-Host
}

function Install-WithChoco {
  param(
    [Parameter(Mandatory = $true)][string]$Package,
    [Parameter(Mandatory = $true)][string]$Name
  )

  Write-Host "==> Installing $Name with Chocolatey"
  choco install $Package -y | Out-Host
}

$hasWinget = [bool](Get-Command winget -ErrorAction SilentlyContinue)
$hasChoco = [bool](Get-Command choco -ErrorAction SilentlyContinue)

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  if ($hasWinget) {
    Install-WithWinget -Id 'Gyan.FFmpeg' -Name 'ffmpeg'
  } elseif ($hasChoco) {
    Install-WithChoco -Package 'ffmpeg' -Name 'ffmpeg'
  } else {
    Write-Host "Install ffmpeg manually from https://ffmpeg.org/download.html"
    exit 1
  }
} else {
  Write-Host "==> ffmpeg already installed"
}

if (-not (Get-Command yt-dlp -ErrorAction SilentlyContinue)) {
  if ($hasWinget) {
    Install-WithWinget -Id 'yt-dlp.yt-dlp' -Name 'yt-dlp'
  } elseif ($hasChoco) {
    Install-WithChoco -Package 'yt-dlp' -Name 'yt-dlp'
  } else {
    Write-Host "Install yt-dlp manually from https://github.com/yt-dlp/yt-dlp#installation"
    exit 1
  }
} else {
  Write-Host "==> yt-dlp already installed"
}

if (-not (Get-Command ffprobe -ErrorAction SilentlyContinue)) {
  Write-Host "ffprobe not found after install. Verify ffmpeg installation and PATH."
  exit 1
}

Write-Host ""
Write-Host "Setup complete."
Write-Host "Run: npm run dev"
