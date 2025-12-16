@echo off
echo ========================================
echo WasteNot Backend Setup for XAMPP
echo ========================================
echo.

REM Check if XAMPP is installed
if not exist "C:\xampp" (
    echo ERROR: XAMPP not found at C:\xampp
    echo Please install XAMPP first: https://www.apachefriends.org/
    pause
    exit /b 1
)

echo [1/4] Copying PHP Auth Service to XAMPP...
xcopy "%~dp0auth-service(PHP)" "C:\xampp\htdocs\wastenot-api" /E /I /Y
if errorlevel 1 (
    echo ERROR: Failed to copy files
    pause
    exit /b 1
)
echo     ✓ Files copied successfully

echo.
echo [2/4] Checking XAMPP Services...
echo     Please ensure XAMPP Control Panel is running with:
echo     - Apache (Started)
echo     - MySQL (Started)
echo.
pause

echo.
echo [3/4] Database Setup...
echo     Opening phpMyAdmin in your browser...
echo     Please import these SQL files in order:
echo     1. %~dp0auth-service(PHP)\database\schema.sql
echo     2. %~dp0location-gateway(Go)\database\schema.sql
echo     3. %~dp0marketplace-core(Spring Boot Java)\database\schema.sql
echo.
start http://localhost/phpmyadmin
pause

echo.
echo [4/4] Testing PHP Auth Service...
timeout /t 2 /nobreak > nul
curl -s http://localhost/wastenot-api/api/login.php > nul
if errorlevel 1 (
    echo     ⚠ Warning: Could not connect to auth service
    echo     Make sure Apache is running in XAMPP
) else (
    echo     ✓ Auth service is accessible
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Service URLs:
echo   Auth Service:     http://localhost/wastenot-api
echo   phpMyAdmin:       http://localhost/phpmyadmin
echo.
echo Test Credentials:
echo   Email:    consumer@wastenot.com
echo   Password: password123
echo.
echo Next Steps:
echo   1. Start Location Service (Go):
echo      cd BackEnd\location-gateway(Go)
echo      go run main.go
echo.
echo   2. Start Marketplace Service (Java):
echo      cd BackEnd\marketplace-core(Spring Boot Java)
echo      mvn spring-boot:run
echo.
echo For full documentation, see: BackEnd\README.md
echo ========================================
pause
