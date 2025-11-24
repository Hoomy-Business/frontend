@echo off
echo.
echo ========================================
echo   Demarrage en mode LAN
echo ========================================
echo.

REM Obtenir l'IP locale
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%
echo IP Locale detectee: %IP%
echo.
echo Frontend: http://%IP%:5000
echo Backend:  http://%IP%:3000
echo.
echo Appuyez sur une touche pour demarrer...
pause >nul

REM Démarrer le serveur Vite avec l'IP locale
set VITE_API_BASE_URL=http://%IP%:3000/api
npm run dev

