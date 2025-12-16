# WasteNot Backend Services Documentation

## Overview
The WasteNot platform consists of three backend microservices that handle different aspects of the application:

1. **Authentication Service (PHP)** - User login, registration, and profile management
2. **Location Gateway (Go)** - Geolocation services and proximity search
3. **Marketplace Core (Spring Boot)** - Product listings, orders, and donations

---

## 📋 Table of Contents
- [System Architecture](#system-architecture)
- [Database Setup](#database-setup)
- [Service Installation](#service-installation)
- [API Documentation](#api-documentation)
- [Frontend Integration](#frontend-integration)

---

## 🏗 System Architecture

```
┌─────────────┐
│   Frontend  │
│ (HTML/JS)   │
└──────┬──────┘
       │
       ├───────────────┬────────────────┬──────────────
       │               │                │
┌──────▼──────┐ ┌─────▼──────┐  ┌─────▼─────────┐
│ Auth Service│ │ Location   │  │ Marketplace   │
│   (PHP)     │ │ Gateway    │  │ Core          │
│   :80       │ │   (Go)     │  │ (Spring Boot) │
│             │ │   :8080    │  │    :8081      │
└──────┬──────┘ └─────┬──────┘  └─────┬─────────┘
       │               │                │
┌──────▼──────┐ ┌─────▼──────┐  ┌─────▼─────────┐
│wastenot_auth│ │wastenot_   │  │wastenot_      │
│   (MySQL)   │ │location    │  │marketplace    │
└─────────────┘ └────────────┘  └───────────────┘
```

---

## 💾 Database Setup

### Prerequisites
- MySQL 8.0+ or MariaDB 10.5+
- Database user with CREATE privileges

### Installation Steps

1. **Start XAMPP Services**
   - Open XAMPP Control Panel
   - Click "Start" on Apache
   - Click "Start" on MySQL

2. **Run Database Schemas**
   
   **Option A - Using phpMyAdmin (Easiest):**
   - Open http://localhost/phpmyadmin
   - Click "Import" tab
   - Upload and execute each schema.sql file:
     - `BackEnd/auth-service(PHP)/database/schema.sql`
     - `BackEnd/location-gateway(Go)/database/schema.sql`
     - `BackEnd/marketplace-core(Spring Boot Java)/database/schema.sql`
   
   **Option B - Using Command Line:**
   ```bash
   # Navigate to XAMPP MySQL bin directory
   cd C:\xampp\mysql\bin
   
   # Run schemas (no password needed for default XAMPP)
   mysql -u root < "path\to\BackEnd\auth-service(PHP)\database\schema.sql"
   mysql -u root < "path\to\BackEnd\location-gateway(Go)\database\schema.sql"
   mysql -u root < "path\to\BackEnd\marketplace-core(Spring Boot Java)\database\schema.sql"
   ```

3. **Verify Databases Created**
   ```sql
   SHOW DATABASES;
   -- Should see: wastenot_auth, wastenot_location, wastenot_marketplace
   ```

### Database Schemas

#### 1. wastenot_auth
- **users** - User accounts (consumer, ngo, partner, admin)
- **user_sessions** - Active login sessions
- **password_resets** - Password reset tokens

#### 2. wastenot_location
- **user_locations** - User geographical locations
- **provider_locations** - Provider business locations
- **location_history** - User movement tracking

#### 3. wastenot_marketplace
- **products** - Food items for sale
- **orders** - Customer orders
- **donations** - NGO donation items

---

## 🚀 Service Installation

### 1. Authentication Service (PHP)

**Requirements:**
- XAMPP installed (includes Apache, PHP, MySQL)

**Setup:**
```bash
# 1. Copy auth-service folder to XAMPP's htdocs
copy "BackEnd\auth-service(PHP)" "C:\xampp\htdocs\wastenot-api"

# 2. Start XAMPP Control Panel
# - Start Apache
# - Start MySQL

# 3. Database credentials are pre-configured for XAMPP:
# Host: localhost
# User: root
# Password: (empty)
# Port: 3306
```

**Test endpoints:**
```bash
curl http://localhost/wastenot-api/api/login.php
```

### 2. Location Gateway (Go)

**Requirements:**
- Go 1.21+
- Go modules enabled

**Setup:**
```bash
cd BackEnd/location-gateway(Go)

# Install dependencies
go mod download

# Copy environment file
copy .env.example .env

# Update .env with your database credentials

# Run service
go run main.go

# Or build executable
go build -o location-gateway
./location-gateway
```

**Test endpoints:**
```bash
curl http://localhost:8080/health
```

### 3. Marketplace Core (Spring Boot)

**Requirements:**
- Java 17+
- Maven 3.8+

**Setup:**
```bash
cd "BackEnd/marketplace-core(Spring Boot Java)"

# Update database credentials in src/main/resources/application.properties

# Install dependencies and run
mvn clean install
mvn spring-boot:run

# Or build JAR
mvn package
java -jar target/marketplace-core-1.0.0.jar
```

**Test endpoints:**
```bash
curl http://localhost:8081/api/products
```

---

## 📡 API Documentation

### Authentication Service (PHP) - Port 80

#### POST /api/register.php
Register a new user
```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "consumer",
  "phone": "09123456789",
  "address": "123 Main St"
}

Response:
{
  "success": true,
  "message": "Registration successful",
  "user_id": 1
}
```

#### POST /api/login.php
User login
```json
Request:
{
  "email": "consumer@wastenot.com",
  "password": "password123",
  "role": "consumer"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "email": "consumer@wastenot.com",
    "full_name": "Test Consumer",
    "role": "consumer"
  }
}
```

#### GET /api/profile.php
Get user profile (requires Authorization header)
```
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": {
    "id": 1,
    "email": "consumer@wastenot.com",
    "full_name": "Test Consumer",
    "role": "consumer",
    "phone": "09123456789"
  }
}
```

---

### Location Gateway (Go) - Port 8080

#### POST /api/location
Create/update user location
```json
Request:
{
  "userId": 1,
  "latitude": 14.599512,
  "longitude": 120.984222,
  "address": "Pasay City, Metro Manila"
}

Response:
{
  "success": true,
  "message": "Location created",
  "data": { ... }
}
```

#### GET /api/location/{userId}
Get user's current location

#### GET /api/nearby-providers
Find nearby providers
```
Query params:
  - latitude: 14.599512
  - longitude: 120.984222
  - radius: 10 (km, optional)

Response:
{
  "success": true,
  "data": [
    {
      "providerId": 1,
      "name": "BreadTalk Manila",
      "latitude": 14.599512,
      "longitude": 120.984222,
      "address": "SM Mall of Asia",
      "distanceKm": 0.5
    }
  ]
}
```

#### GET /api/distance
Calculate distance between two points
```
Query params:
  - lat1, lon1, lat2, lon2

Response:
{
  "success": true,
  "data": {
    "distanceKm": 5.2
  }
}
```

---

### Marketplace Core (Spring Boot) - Port 8081

#### GET /api/products
Get all active products
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "BreadTalk Croissant",
      "partnerId": 1,
      "partnerName": "BreadTalk",
      "price": 60.00,
      "oldPrice": 120.00,
      "discountPercent": 50,
      "category": "breads",
      "expiryDisplay": "Today • 8 PM",
      "pickupWindow": "4:00 PM – 7:30 PM"
    }
  ]
}
```

#### GET /api/products/{id}
Get product by ID

#### GET /api/products/category/{category}
Get products by category (breads, meals, drinks)

#### GET /api/products/search?keyword={keyword}
Search products

#### POST /api/products
Create new product
```json
Request:
{
  "name": "Fresh Bread",
  "partnerId": 1,
  "partnerName": "Bakery",
  "price": 50.00,
  "oldPrice": 80.00,
  "discountPercent": 37,
  "category": "breads",
  "description": "Fresh baked bread",
  "pickupWindow": "5:00 PM - 8:00 PM",
  "quantity": 10
}
```

#### POST /api/orders
Create an order
```json
Request:
{
  "consumerId": 1,
  "consumerName": "John Doe",
  "productId": 1,
  "productName": "Croissant",
  "partnerId": 1,
  "partnerName": "BreadTalk",
  "quantity": 2,
  "price": 60.00,
  "totalAmount": 120.00,
  "paymentMethod": "cash"
}

Response:
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "orderNumber": "ORD-A5F3D2B1",
    "status": "PENDING"
  }
}
```

#### GET /api/orders/consumer/{consumerId}
Get consumer's orders

#### PUT /api/orders/{id}/status
Update order status
```json
Request:
{
  "status": "COMPLETED"
}
```

#### GET /api/donations
Get all active donations

#### POST /api/donations
Create donation
```json
Request:
{
  "itemName": "Organic Bread",
  "providerId": 1,
  "providerName": "Bakery",
  "quantity": "50 units",
  "description": "Fresh organic bread"
}
```

#### PUT /api/donations/{id}/claim
Claim donation (for NGOs)
```json
Request:
{
  "ngoId": 1,
  "ngoName": "Food Bank NGO"
}
```

---

## 🔗 Frontend Integration

### Update Frontend JavaScript Files

#### 1. Login Integration
Update [login-consumer.js](../../FrontEnd/login/login-consumer.js):

```javascript
// Replace mock login with API call
async function handleLogin(email, password) {
    try {
        const response = await fetch('http://localhost/api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password,
                role: 'consumer'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userName', data.user.full_name);
            window.location.href = '../consumer/consumer-dashboard.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}
```

#### 2. Products Integration
Update [consumer-marketplace.js](../../FrontEnd/consumer/consumer-marketplace.js):

```javascript
// Fetch products from API
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:8081/api/products');
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.data);
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', loadProducts);
```

#### 3. Location Integration
Update [consumer-mapview.js](../../FrontEnd/consumer/consumer-mapview.js):

```javascript
// Get nearby providers
async function findNearbyProviders(latitude, longitude) {
    try {
        const response = await fetch(
            `http://localhost:8080/api/nearby-providers?latitude=${latitude}&longitude=${longitude}&radius=10`
        );
        const data = await response.json();
        
        if (data.success) {
            displayProvidersOnMap(data.data);
        }
    } catch (error) {
        console.error('Error finding providers:', error);
    }
}

// Get user's current location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        findNearbyProviders(
            position.coords.latitude,
            position.coords.longitude
        );
    });
}
```

---

## 🔒 Security Notes

1. **Change default credentials** in production
2. **Update JWT secret key** in `auth-service(PHP)/utils/jwt.php`
3. **Enable HTTPS** for all services
4. **Use environment variables** for sensitive data
5. **Implement rate limiting** on API endpoints
6. **Add input validation** and sanitization

---

## 🧪 Testing

### Sample Test Users
All passwords are `password123`:
- Consumer: `consumer@wastenot.com`
- NGO: `ngo@wastenot.com`
- Partner: `partner@wastenot.com`
- Admin: `admin@wastenot.com`

### Test with Postman
Import the included Postman collection (if created) or use curl commands provided above.

---

## 🛠 Troubleshooting

### Common Issues

**Database connection failed:**
- Verify MySQL is running
- Check credentials in config files
- Ensure databases are created

**Port already in use:**
- Change ports in configuration files
- Kill existing processes using the port

**CORS errors:**
- Services have CORS enabled by default
- Update allowed origins if needed

**Go dependencies error:**
```bash
go mod tidy
go mod download
```

**Maven build error:**
```bash
mvn clean install -U
```

---

## 📞 Support

For issues or questions:
1. Check database connections
2. Verify all services are running
3. Check server logs for errors
4. Ensure frontend URLs match backend ports

---

## 📝 License

This project is part of the WasteNot platform.
