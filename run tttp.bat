@echo off
:retry
echo Running batch file...

cd /d D:\Visual Studio Projects\ServerStatus-FiveM
node src/index.js


REM Đặt thời gian chờ 1 phút
timeout /t 60 /nobreak >nul
goto retry

echo Batch file completed successfully.