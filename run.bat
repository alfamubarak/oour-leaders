@echo off
setlocal EnableExtensions
cd /d "%~dp0"
call "%~dp0prepare.bat"
if errorlevel 1 exit /b 1
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" (
  echo Microsoft Edge was not found; launching with your default browser.
  start "" "%~dp0index.html"
  exit /b 0
)
set "URL=file:///%~dp0index.html"
set "URL=%URL:\=/%"
echo Launching AFCSC Our Leaders in Microsoft Edge fullscreen.
start "AFCSC Hall of Fame" "%EDGE%" --new-window --kiosk "%URL%" --edge-kiosk-type=fullscreen --no-first-run
exit /b 0
