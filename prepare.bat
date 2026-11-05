@echo off
setlocal EnableExtensions
cd /d "%~dp0"
echo.
echo ===============================================
echo    AFCSC OUR LEADERS - PREPARATION CHECK
echo ===============================================
echo.
for %%F in ("index.html" "data.js" "app.js" "style.css" "experience.css" "cinematic.css" "experience.js" "assets\afcsc-emblem.png") do (
  if not exist "%%~F" (
    echo ERROR: Missing required file: %%~F
    echo Please extract the entire ZIP, not just the batch files.
    pause
    exit /b 1
  )
)
if not exist "assets\current\avm-oa-tuwase.jpg" echo WARNING: Missing sample portrait 1.
if not exist "assets\current\avm-eo-alade.jpg" echo WARNING: Missing sample portrait 2.
echo All essential exhibition files found.
echo The project can be opened directly with index.html.
echo Note: Advanced GSAP effects need an internet connection;
echo native transitions and interaction work offline.
echo.
exit /b 0
