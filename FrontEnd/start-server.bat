@echo off
cd /d "%~dp0"
echo Starting WasteNot Frontend Server...
echo Server will be available at: http://localhost:8090
echo.
http-server -p 8090 --cors -c-1
