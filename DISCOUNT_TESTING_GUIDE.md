# Dynamic Discount System - Testing Guide

## Quick Reference: Discount Tiers

| Days Until Expiry | Discount % | Use Case |
|---|---|---|
| ≤ 1 day | 70% | 🚨 URGENT - Expires today/tomorrow |
| ≤ 2 days | 50% | ⚠️ HIGH PRIORITY - Expires in 2 days |
| ≤ 3 days | 35% | 📌 MEDIUM - Expires in 3 days |
| ≤ 7 days | 25% | 📊 LOW - Expires in a week |
| > 7 days | 10% | ℹ️ DEFAULT - Minimum profitability |

## Test Scenarios

### Scenario 1: Urgent Inventory (1 Day Away)
**Setup:**
1. Create a new product with expiry date = Tomorrow at 23:59:59
2. Set price = $100.00

**Expected Result:**
- Discount applied: 70%
- Calculated discount price: $100 - ($100 × 70/100) = **$30.00**

**Test Command:**
```bash
curl -X GET http://localhost:8081/api/products \
  -H "Content-Type: application/json"
```

**Verify Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Fresh Vegetables",
      "price": 100.00,
      "discountPercent": 70,
      "expiryDate": "2024-12-20T23:59:59"
    }
  ]
}
```

---

### Scenario 2: High Priority Inventory (2 Days Away)
**Setup:**
1. Create product with expiry = 2 days from now
2. Set price = $50.00

**Expected Result:**
- Discount: 50%
- Final price: $50 - ($50 × 50/100) = **$25.00**

---

### Scenario 3: Long Shelf Life (10 Days Away)
**Setup:**
1. Create product with expiry = 10 days from now
2. Set price = $200.00

**Expected Result:**
- Discount: 10% (minimum)
- Final price: $200 - ($200 × 10/100) = **$180.00**

---

## Integration Testing

### Test 1: Consumer Purchasing with Discount
**Steps:**
1. Navigate to `http://localhost:5000/consumer/consumer-marketplace.html`
2. View available products
3. Click "Claim Product" on any item
4. Verify the discount price is displayed in the modal
5. Enter quantity and submit claim
6. Check that order was created with correct discounted amount

**Pass Criteria:**
- ✓ Prices show with discounts applied
- ✓ Modal displays correct total (quantity × discounted price)
- ✓ Order created with correct amounts
- ✓ Database order record has correct `totalPrice`

---

### Test 2: NGO Donation Request with Discount
**Steps:**
1. Navigate to `http://localhost:5000/ngo/ngo-marketplace.html`
2. View available products
3. Click "Request Product" on any item
4. Verify the discounted value is shown
5. Enter quantity and submit request
6. Check that donation was created with correct amounts

**Pass Criteria:**
- ✓ Item values show with discounts
- ✓ Modal displays correct total value
- ✓ Donation request created successfully
- ✓ Database donation record contains correct amounts

---

### Test 3: Product Search with Discounts
**Test Product Search Endpoint:**
```bash
curl -X GET "http://localhost:8081/api/products/search?keyword=vegetable" \
  -H "Content-Type: application/json"
```

**Verify:**
- All returned products have `discountPercent` calculated
- Discounts match expiry dates
- Frontend displays discounted prices correctly

---

### Test 4: Featured Products with Discounts
**Test Featured Endpoint:**
```bash
curl -X GET http://localhost:8081/api/products/featured \
  -H "Content-Type: application/json"
```

**Verify:**
- Featured products have discounts calculated
- Display correctly on consumer/NGO homepage

---

### Test 5: Partner Inventory View
**Test Partner Endpoint:**
```bash
curl -X GET http://localhost:8081/api/products/partner/1 \
  -H "Content-Type: application/json"
```

**Verify:**
- All partner products show discounts
- Partner can see how much inventory is discounted
- Helps partners understand urgency of sales

---

## Database Verification

### Check Order with Discounted Price
```sql
SELECT 
  id, 
  product_id, 
  consumer_id, 
  quantity, 
  total_price, 
  created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected Output:**
```
| id | product_id | consumer_id | quantity | total_price | created_at |
|----|------------|------------|----------|------------|-----------|
| 1  | 5          | 2          | 2        | 60.00      | 2024-12-19 |
| 2  | 3          | 2          | 1        | 30.00      | 2024-12-19 |
```

### Check Product Discounts
```sql
SELECT 
  id, 
  name, 
  price, 
  discount_percent, 
  expiry_date,
  (price - (price * discount_percent / 100)) as discounted_price
FROM products 
WHERE status = 'ACTIVE' 
ORDER BY expiry_date ASC;
```

---

## Frontend Testing

### Consumer Marketplace Test
1. **Test Discount Display:**
   - Open developer tools (F12)
   - Navigate to Consumer Marketplace
   - Check console for product data
   - Verify `discountPercent` is populated for each product

2. **Test Claim Form:**
   - Click claim button on any product
   - Check modal shows correct original price
   - Check modal shows correct discount percentage
   - Verify "Total Cost" updates dynamically when quantity changes
   - Submit form and verify order created

### NGO Marketplace Test
1. **Test Discount Display:**
   - Open developer tools (F12)
   - Navigate to NGO Marketplace
   - Check console for product data
   - Verify `discountPercent` is populated

2. **Test Donation Form:**
   - Click request button
   - Verify modal shows discounted value
   - Change quantity and verify total recalculates
   - Submit form and verify donation created

---

## Error Handling Tests

### Test 1: No Expiry Date
**Scenario:** Product created without expiry date
**Expected:** Discount calculation skipped, no discount applied

### Test 2: Already Expired Product
**Scenario:** Product expiry date is in the past
**Expected:** 
- System may mark as EXPIRED
- Discount calculation handles gracefully
- Product doesn't appear in active listings

### Test 3: Quantity Validation
**Scenario:** Consumer claims more than available
**Expected:** 
- Order rejected with error message
- Message: "Insufficient product quantity"
- No database changes

---

## Performance Testing

### Test API Response Time
```bash
# Test with multiple products
time curl -X GET http://localhost:8081/api/products \
  -H "Content-Type: application/json" | jq .

# Test single product
time curl -X GET http://localhost:8081/api/products/1 \
  -H "Content-Type: application/json" | jq .
```

**Expected:**
- Response time < 500ms for all requests
- Discount calculation doesn't add noticeable delay

---

## Regression Testing

### Verify Existing Functionality Still Works

1. **Create Product**
```bash
curl -X POST http://localhost:8081/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 50.00,
    "category": "Test",
    "quantity": 10,
    "partnerId": 1,
    "partnerName": "Test Partner",
    "expiryDate": "2024-12-25T23:59:59"
  }'
```

2. **Create Order**
```bash
curl -X POST http://localhost:8081/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "consumerId": 1,
    "quantity": 2,
    "totalPrice": 60.00,
    "paymentMethod": "card"
  }'
```

3. **Create Donation**
```bash
curl -X POST http://localhost:8081/api/donations \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "ngoId": 1,
    "quantity": 5,
    "organization": "Test NGO"
  }'
```

---

## Automated Test Script

**Run Full Test Suite:**
```bash
#!/bin/bash

echo "=== Dynamic Discount System Test Suite ==="
echo ""

# Test 1: All Products
echo "Test 1: Getting all products..."
curl -s http://localhost:8081/api/products | jq '.data | length'

# Test 2: Featured Products
echo "Test 2: Getting featured products..."
curl -s http://localhost:8081/api/products/featured | jq '.data | length'

# Test 3: Search
echo "Test 3: Searching products..."
curl -s "http://localhost:8081/api/products/search?keyword=fresh" | jq '.data | length'

# Test 4: Verify Discounts Applied
echo "Test 4: Verifying discount calculations..."
curl -s http://localhost:8081/api/products | jq '.data[] | {name, price, discountPercent}' | head -20

echo ""
echo "=== Test Suite Complete ==="
```

---

## Success Criteria Checklist

- [ ] Build compiles without errors
- [ ] Service starts on port 8081
- [ ] Products returned with `discountPercent` field
- [ ] Discounts calculated based on expiry dates
- [ ] Urgent items (≤1 day) show 70% discount
- [ ] Consumer claims work with discounted prices
- [ ] NGO donations work with discounted values
- [ ] Database orders record correct amounts
- [ ] Search and featured endpoints apply discounts
- [ ] Performance acceptable (< 500ms response)
- [ ] No regression in existing functionality

---

## Troubleshooting

### Issue: Discounts Not Showing
**Solution:** 
1. Verify products have `expiryDate` populated
2. Check database: `SELECT * FROM products WHERE expiry_date IS NULL`
3. Verify service restarted after code changes

### Issue: Incorrect Discount Amount
**Solution:**
1. Check product expiry date in database
2. Calculate days to expiry: `DATEDIFF(expiryDate, NOW())`
3. Verify algorithm logic in `Product.calculateDynamicDiscount()`

### Issue: Orders Not Saving
**Solution:**
1. Check MySQL connection
2. Verify `orders` table exists with all required fields
3. Check application logs for validation errors

---

## Rollback Plan

If issues occur:
1. Stop Spring Boot service
2. Revert to previous version of ProductController
3. Remove discount calculations from GET endpoints
4. Rebuild and restart
5. Investigate root cause

---

**Last Updated:** 2024
**Created For:** Dynamic Discount System v1.0
