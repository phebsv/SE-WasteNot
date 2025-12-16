# WasteNot Backend - XAMPP Setup Guide

## Quick Setup for XAMPP

### ✅ Prerequisites
- XAMPP installed (download from https://www.apachefriends.org/)
- Go 1.21+ (for Location Service)
- Java 17+ & Maven (for Marketplace Service)

---

## 🚀 Automated Setup

### Run the Setup Script:
```bash
# From the BackEnd folder
setup-xampp.bat
```

The script will:
1. Copy PHP files to XAMPP's htdocs
2. Guide you through starting XAMPP services
3. Open phpMyAdmin for database setup
4. Test the auth service

---

## 📝 Manual Setup (Alternative)

### Step 1: Start XAMPP
1. Open **XAMPP Control Panel**
2. Click **Start** for:
   - Apache
   - MySQL

### Step 2: Copy PHP Service
```bash
# Copy auth service to XAMPP htdocs
xcopy "BackEnd\auth-service(PHP)" "C:\xampp\htdocs\wastenot-api" /E /I /Y
```

### Step 3: Setup Databases
1. Open http://localhost/phpmyadmin
2. Click **Import** tab
3. Import each SQL file:
   - `BackEnd/auth-service(PHP)/database/schema.sql`
   - `BackEnd/location-gateway(Go)/database/schema.sql`
   - `BackEnd/marketplace-core(Spring Boot Java)/database/schema.sql`

### Step 4: Start Other Services

**Location Service (Go):**
```bash
cd BackEnd\location-gateway(Go)
go run main.go
```

**Marketplace Service (Java):**
```bash
cd "BackEnd\marketplace-core(Spring Boot Java)"
mvn spring-boot:run
```

---

## 🧪 Test Your Setup

### Test Auth Service:
```bash
curl http://localhost/wastenot-api/api/login.php
```

### Test Login:
```bash
curl -X POST http://localhost/wastenot-api/api/login.php ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"consumer@wastenot.com\",\"password\":\"password123\",\"role\":\"consumer\"}"
```

### Test Other Services:
```bash
# Location Service
curl http://localhost:8080/health

# Marketplace Service
curl http://localhost:8081/api/products
```

---

## 📍 Service Endpoints

| Service | URL | Status Check |
|---------|-----|--------------|
| **PHP Auth** | http://localhost/wastenot-api | http://localhost/wastenot-api/api/login.php |
| **Go Location** | http://localhost:8080 | http://localhost:8080/health |
| **Java Marketplace** | http://localhost:8081 | http://localhost:8081/api/products |
| **phpMyAdmin** | http://localhost/phpmyadmin | - |

---

## 🔧 XAMPP Configuration

### Database Settings
The PHP service is pre-configured for XAMPP defaults:
- **Host:** localhost
- **User:** root
- **Password:** *(empty)*
- **Port:** 3306

### Apache Settings
- PHP auth service runs on Apache (port 80)
- .htaccess handles URL rewriting and CORS
- No additional Apache configuration needed

---

## 🐛 Troubleshooting

### Issue: Apache won't start
**Solution:** Another service might be using port 80
1. Open XAMPP Control Panel
2. Click "Config" → "Apache (httpd.conf)"
3. Change `Listen 80` to `Listen 8080`
4. Restart Apache
5. Update URLs to: http://localhost:8080/wastenot-api

### Issue: MySQL won't start
**Solution:** Another MySQL instance might be running
1. Stop other MySQL services (check Windows Services)
2. Or change XAMPP MySQL port in my.cnf

### Issue: "Access denied for user 'root'"
**Solution:** XAMPP MySQL might have a password set
1. Open phpMyAdmin
2. Check user settings
3. Update password in `auth-service(PHP)/config/database.php`

### Issue: CORS errors
**Solution:** Ensure .htaccess is working
1. Check Apache config allows .htaccess overrides
2. Ensure mod_rewrite is enabled
3. Restart Apache

### Issue: 404 on API endpoints
**Solution:** URL rewriting might not be working
1. Use full path: `http://localhost/wastenot-api/api/login.php`
2. Check .htaccess exists in wastenot-api folder
3. Enable mod_rewrite in XAMPP

---

## 📱 Frontend Integration

Update your frontend API URLs to:

```javascript
// Frontend API configuration
const API_CONFIG = {
    auth: 'http://localhost/wastenot-api',
    location: 'http://localhost:8080',
    marketplace: 'http://localhost:8081'
};

// Example: Login
fetch(`${API_CONFIG.auth}/api/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
});
```

---

## 📚 Additional Resources

- **Full Documentation:** [README.md](README.md)
- **API Reference:** [POSTMAN_COLLECTION.md](POSTMAN_COLLECTION.md)
- **XAMPP Documentation:** https://www.apachefriends.org/docs/

---

## 🎯 Test Credentials

Use these for testing:

| Role | Email | Password |
|------|-------|----------|
| Consumer | consumer@wastenot.com | password123 |
| NGO | ngo@wastenot.com | password123 |
| Partner | partner@wastenot.com | password123 |
| Admin | admin@wastenot.com | password123 |

---

## ✅ Verification Checklist

- [ ] XAMPP Apache is running
- [ ] XAMPP MySQL is running
- [ ] Auth service files copied to htdocs
- [ ] Three databases created (auth, location, marketplace)
- [ ] Sample data imported
- [ ] Auth service responds to requests
- [ ] Go location service running on port 8080
- [ ] Java marketplace service running on port 8081
- [ ] All test endpoints return valid responses

---

**Need Help?** Check the full documentation in [README.md](README.md)
