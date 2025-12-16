# WasteNot API Postman Collection

## Import Instructions

1. Open Postman
2. Click "Import" button
3. Paste this collection JSON
4. Test the APIs

## Collection Overview

### Authentication Service (localhost:80)
- Register User
- Login
- Get Profile
- Update Profile

### Location Gateway (localhost:8080)
- Health Check
- Create Location
- Get User Location
- Find Nearby Providers
- Calculate Distance

### Marketplace Core (localhost:8081)
- Get All Products
- Get Product by ID
- Search Products
- Create Product
- Create Order
- Get Consumer Orders
- Create Donation
- Claim Donation

## Environment Variables

Create a Postman environment with:
- `auth_url`: http://localhost/wastenot-api
- `location_url`: http://localhost:8080
- `marketplace_url`: http://localhost:8081
- `auth_token`: (set after login)

## Sample Requests

### 1. Register Consumer
```
POST {{auth_url}}/api/register.php
Body:
{
  "email": "newuser@test.com",
  "password": "password123",
  "full_name": "New User",
  "role": "consumer",
  "phone": "09123456789",
  "address": "Manila"
}
```

### 2. Login
```
POST {{auth_url}}/api/login.php
Body:
{
  "email": "consumer@wastenot.com",
  "password": "password123",
  "role": "consumer"
}

Save token from response to {{auth_token}}
```

### 3. Get Products
```
GET {{marketplace_url}}/api/products
```

### 4. Find Nearby Providers
```
GET {{location_url}}/api/nearby-providers?latitude=14.599512&longitude=120.984222&radius=10
```

### 5. Create Order
```
POST {{marketplace_url}}/api/orders
Body:
{
  "consumerId": 1,
  "consumerName": "Test Consumer",
  "productId": 1,
  "productName": "BreadTalk Croissant",
  "partnerId": 1,
  "partnerName": "BreadTalk",
  "quantity": 2,
  "price": 60.00,
  "totalAmount": 120.00,
  "paymentMethod": "cash"
}
```
