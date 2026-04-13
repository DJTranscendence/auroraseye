#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "==> Aurora's Eye setup (macOS)"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install from https://nodejs.org and re-run this script."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Install Node.js from https://nodejs.org and re-run this script."
  exit 1
fi

echo "==> Installing npm dependencies"
npm install

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is required for one-click tool installation."
  echo "Install Homebrew from https://brew.sh and run this script again."
  exit 1
fi

install_brew_pkg_if_missing() {
  local package_name="$1"
  local command_name="$2"

  if command -v "$command_name" >/dev/null 2>&1; then
    echo "==> $package_name already installed"
    return
  fi

  echo "==> Installing $package_name"
  brew install "$package_name"
}

install_brew_pkg_if_missing ffmpeg ffmpeg
install_brew_pkg_if_missing yt-dlp yt-dlp

if ! command -v ffprobe >/dev/null 2>&1; then
  echo "ffprobe not found after install. Please verify ffmpeg installation."
  exit 1
fi

echo ""
echo "Setup complete."
echo "Run: npm run dev"
