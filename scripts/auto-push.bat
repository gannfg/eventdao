@echo off
echo Auto-pushing EventDAO changes to GitHub...

git add .
git commit -m "Auto-update: %date% %time%"
git push origin main

echo Push completed!
pause
