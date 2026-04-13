@echo off
set SCRIPT_DIR=%~dp0
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%setup-windows.ps1"

echo.
echo Press any key to close this window...
pause >nul
