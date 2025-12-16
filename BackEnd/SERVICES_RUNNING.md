# WasteNot Backend Services - Running Status

**Date:** December 16, 2025  
**Status:** ✅ ALL SERVICES OPERATIONAL

## Service Status

### 1. ✅ PHP Authentication Service
- **Port:** 80 (Apache/XAMPP)
- **URL:** http://localhost/wastenot-api
- **Database:** wastenot_auth (MySQL)
- **Status:** ONLINE
- **Endpoints:**
  - `POST /api/login.php` - User authentication ✓ Tested
  - `GET /api/profile.php` - Get user profile
  - `PUT /api/profile.php` - Update profile

**Test Command:**
```powershell
$body = @{email='consumer@wastenot.com'; password='password123'; role='consumer'} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost/wastenot-api/api/login.php" -Method POST -ContentType "application/json" -Body $body
```

### 2. ✅ Go Location Gateway
- **Port:** 8080
- **URL:** http://localhost:8080
- **Database:** wastenot_location (MySQL)
- **Status:** ONLINE
- **Endpoints:**
  - `GET /api/nearby-providers` - Find nearby providers ✓ Tested
  - Query params: `latitude`, `longitude`, `radius`

**Test Command:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/nearby-providers?latitude=14.5995&longitude=120.9842&radius=10"
```

### 3. ✅ Java Spring Boot Marketplace
- **Port:** 8081
- **URL:** http://localhost:8081
- **Database:** wastenot_marketplace (MySQL)
- **Status:** ONLINE
- **Endpoints:**
  - `GET /api/products` - List all products ✓ Tested
  - `GET /api/products/{id}` - Get product details
  - `POST /api/orders` - Create order
  - `GET /api/orders/consumer/{id}` - Get consumer orders
  - `GET /api/donations/available` - List donations

**Test Command:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8081/api/products"
```

## Issues Fixed

### Issue 1: Apache Not Responding
**Problem:** Port 80 not listening, Apache service not installed  
**Solution:** Started Apache directly using `apache_start.bat`  
**Status:** ✅ Fixed

### Issue 2: Password Authentication Failing
**Problem:** Bcrypt password hashes in database were incorrect  
**Solution:** Generated new hash using PHP's `password_hash()` and updated all users  
**New Hash:** `$2y$10$Cf7McQ/jlVznw/hetkmZPOcd6923CT7bxvYDTASXR790yGKacc/y6`  
**Status:** ✅ Fixed

### Issue 3: Go Service Query Parameters
**Problem:** Frontend using `lat/long` but backend expects `latitude/longitude`  
**Solution:** Frontend already using correct parameters  
**Status:** ✅ No changes needed

## Test Credentials

All users use the same password: `password123`

| Email | Role | Password |
|-------|------|----------|
| consumer@wastenot.com | consumer | password123 |
| ngo@wastenot.com | ngo | password123 |
| partner@wastenot.com | partner | password123 |
| admin@wastenot.com | admin | password123 |

## Database Sample Data

### Products (wastenot_marketplace)
- 4 products loaded with prices, descriptions, providers
- Categories: Food, Meals, Breads, Drinks

### Locations (wastenot_location)
- Provider locations with coordinates
- User location tracking enabled

### Users (wastenot_auth)
- 4 users (1 per role)
- All with proper bcrypt password hashes
- JWT authentication working

## How to Test the Full Stack

### 1. Backend Test (All services running)
```powershell
# Test Auth
$body = @{email='consumer@wastenot.com'; password='password123'; role='consumer'} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost/wastenot-api/api/login.php" -Method POST -ContentType "application/json" -Body $body

# Test Location
Invoke-RestMethod -Uri "http://localhost:8080/api/nearby-providers?latitude=14.5995&longitude=120.9842&radius=10"

# Test Marketplace
Invoke-RestMethod -Uri "http://localhost:8081/api/products"
```

### 2. Frontend Test (UI Testing)
1. Open `FrontEnd/login/login-consumer.html` in your browser
2. Login with: consumer@wastenot.com / password123
3. Browse marketplace (fetches from Spring Boot)
4. View map (fetches from Go service)
5. Place an order (saves to MySQL)
6. Check orders page (loads from database)

### 3. Test Different User Roles
- **Consumer:** Browse products, place orders, view map
- **NGO:** View donations, request food
- **Partner:** Manage products, view orders
- **Admin:** Manage users, view analytics

## Stopping Services

### Stop Apache (XAMPP)
```powershell
Stop-Process -Name "httpd" -Force
```

### Stop Go Service
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*go*"} | Stop-Process -Force
```

### Stop Java/Maven
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*java*"} | Stop-Process -Force
```

### Or use XAMPP Control Panel
- Stop Apache and MySQL buttons
- Close manually opened PowerShell windows for Go and Java

## Monitoring Logs

### PHP Logs
- Apache error log: `C:\xampp\apache\logs\error.log`
- PHP error log: Check php.ini settings

### Go Logs
- Console output in PowerShell window
- Add file logging in main.go if needed

### Java Logs
- Spring Boot console output
- Check `logs/` folder if configured

## Port Reference

| Service | Port | Protocol |
|---------|------|----------|
| PHP (Apache) | 80 | HTTP |
| MySQL | 3306 | TCP |
| Go Location | 8080 | HTTP |
| Java Marketplace | 8081 | HTTP |

## Next Steps

1. ✅ All backend services running
2. ✅ Frontend connected to backend
3. ✅ Authentication working
4. ✅ Database populated with sample data
5. 🔄 Test complete user flows through UI
6. 🔄 Add more sample data if needed
7. 🔄 Implement remaining admin/partner features

## Support Files

- [README.md](README.md) - Project overview
- [QUICKSTART.md](QUICKSTART.md) - Setup guide
- [XAMPP_SETUP.md](XAMPP_SETUP.md) - XAMPP configuration
- [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) - Frontend-backend connection
- [POSTMAN_COLLECTION.md](POSTMAN_COLLECTION.md) - API testing

---

**Last Updated:** December 16, 2025  
**All Systems:** ✅ OPERATIONAL
