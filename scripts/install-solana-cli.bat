@echo off
echo Installing Solana CLI for Windows...
echo.

echo Step 1: Installing Rust (required for Solana CLI)
echo This will open a new PowerShell window to install Rust
powershell -Command "Start-Process powershell -ArgumentList '-Command', 'Invoke-WebRequest -Uri https://win.rustup.rs/ -OutFile rustup-init.exe; .\rustup-init.exe -y; Remove-Item rustup-init.exe' -Verb RunAs"

echo.
echo Step 2: Please restart your terminal after Rust installation completes
echo Then run this script again to continue with Solana CLI installation
echo.

pause
