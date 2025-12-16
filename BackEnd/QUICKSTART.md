# Quick Start Guide - WasteNot Backend

## 🚀 Get Started in 5 Minutes

### Step 1: Copy PHP Service to XAMPP
```bash
# Copy auth-service to XAMPP htdocs
xcopy "BackEnd\auth-service(PHP)" "C:\xampp\htdocs\wastenot-api" /E /I /Y
```

### Step 2: Setup Databases
```bash
# 1. Open XAMPP Control Panel and start:
#    - Apache
#    - MySQL

# 2. Open phpMyAdmin: http://localhost/phpmyadmin
# 3. Import these SQL files using the Import tab:
#    - BackEnd/auth-service(PHP)/database/schema.sql
#    - BackEnd/location-gateway(Go)/database/schema.sql
#    - BackEnd/marketplace-core(Spring Boot Java)/database/schema.sql
```

### Step 3: Start Other Services

**Terminal 1 - PHP Auth Service:**
```bash
# Already running via XAMPP Apache
# No action needed - Apache is running
```

**Terminal 2 - Go Location Service:**
```bash
cd BackEnd/location-gateway(Go)
go run main.go
```

**Terminal 3 - Spring Boot Marketplace:**
```bash
cd "BackEnd/marketplace-core(Spring Boot Java)"
mvn spring-boot:run
```

### Step 4: Test Services

Open browser or use curl:
```bash
# Auth Service (via XAMPP)
curl http://localhost/wastenot-api/api/login.php

# Location Service
curl http://localhost:8080/health

# Marketplace Service
curl http://localhost:8081/api/products
```

### Step 5: Test Login

Use these credentials:
- Email: `consumer@wastenot.com`
- Password: `password123`

```bash
curl -X POST http://localhost/wastenot-api/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"consumer@wastenot.com","password":"password123","role":"consumer"}'
```

## 📋 Service URLs

| Service | URL | Database |
|---------|-----|----------|
| Auth (PHP via XAMPP) | http://localhost/wastenot-api | wastenot_auth |
| Location (Go) | http://localhost:8080 | wastenot_location |
| Marketplace (Java) | http://localhost:8081 | wastenot_marketplace |

## 🔧 Configuration Files

- PHP: `auth-service(PHP)/config/database.php`
- Go: `location-gateway(Go)/.env`
- Java: `marketplace-core(Spring Boot Java)/src/main/resources/application.properties`

## 📖 Full Documentation

See [README.md](README.md) for complete API documentation and integration guide.
