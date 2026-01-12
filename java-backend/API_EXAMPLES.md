# API Testing Examples

Collection of curl commands to test the Rental Management System API.

## Prerequisites

```bash
# Set base URL
BASE_URL="http://localhost:8080/api"
```

## 1. Authentication

### Register Customer

```bash
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "CUSTOMER"
  }'
```

### Register Vendor

```bash
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Camera Shop Nepal",
    "email": "vendor@example.com",
    "password": "password123",
    "role": "VENDOR"
  }'
```

### Login

```bash
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Save the token from response:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Current User

```bash
curl -X GET $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Change Password

```bash
curl -X POST $BASE_URL/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

## 2. Products

### Create Product (Vendor)

```bash
curl -X POST $BASE_URL/products \
  -H "Authorization: Bearer $VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Canon EOS R5",
    "description": "Professional mirrorless camera with 45MP sensor",
    "category": "Electronics",
    "rentalPricePerDay": 5000,
    "vendorName": "Camera Rentals Nepal",
    "vendorContact": "9841234567",
    "location": "Thamel, Kathmandu",
    "latitude": 27.7172,
    "longitude": 85.3240
  }'
```

### Get All Products

```bash
curl -X GET $BASE_URL/products
```

### Get Available Products

```bash
curl -X GET $BASE_URL/products/available
```

### Search Products

```bash
curl -X GET "$BASE_URL/products?search=camera"
```

### Filter by Category

```bash
curl -X GET "$BASE_URL/products?category=Electronics"
```

### Get Product by ID

```bash
curl -X GET $BASE_URL/products/{product-id}
```

### Get My Products (Vendor)

```bash
curl -X GET $BASE_URL/products/vendor/my-products \
  -H "Authorization: Bearer $VENDOR_TOKEN"
```

### Update Product

```bash
curl -X PUT $BASE_URL/products/{product-id} \
  -H "Authorization: Bearer $VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Canon EOS R5 (Updated)",
    "rentalPricePerDay": 4500
  }'
```

### Delete Product

```bash
curl -X DELETE $BASE_URL/products/{product-id} \
  -H "Authorization: Bearer $VENDOR_TOKEN"
```

## 3. Rentals

### Create Rental

```bash
curl -X POST $BASE_URL/rentals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-uuid-here",
    "startDate": "2026-01-20",
    "days": 5,
    "deliveryAddress": "Thamel, Kathmandu",
    "contactPhone": "9841234567",
    "deliveryLatitude": 27.7172,
    "deliveryLongitude": 85.3240,
    "deliveryLocationAddress": "Thamel, Kathmandu 44600, Nepal"
  }'
```

### Get My Rentals

```bash
curl -X GET $BASE_URL/rentals/my-rentals \
  -H "Authorization: Bearer $TOKEN"
```

### Get Vendor Analytics

```bash
curl -X GET $BASE_URL/rentals/vendor/analytics \
  -H "Authorization: Bearer $VENDOR_TOKEN"
```

### Confirm Rental Payment

```bash
curl -X POST $BASE_URL/rentals/{rental-id}/confirm \
  -H "Authorization: Bearer $TOKEN"
```

### Mark as Handed Over (Vendor)

```bash
curl -X POST $BASE_URL/rentals/{rental-id}/handover \
  -H "Authorization: Bearer $VENDOR_TOKEN"
```

### Request Return (Customer)

```bash
curl -X POST $BASE_URL/rentals/{rental-id}/request-return \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Product in good condition, requesting return",
    "imageUrl": "https://cloudinary.com/..."
  }'
```

### Approve Return (Vendor)

```bash
curl -X POST $BASE_URL/rentals/{rental-id}/approve-return \
  -H "Authorization: Bearer $VENDOR_TOKEN"
```

### Reject Return (Vendor)

```bash
curl -X POST $BASE_URL/rentals/{rental-id}/reject-return \
  -H "Authorization: Bearer $VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Product damaged",
    "note": "Camera lens is scratched. Cannot accept return."
  }'
```

### Cancel Rental

```bash
curl -X POST $BASE_URL/rentals/{rental-id}/cancel \
  -H "Authorization: Bearer $TOKEN"
```

## 4. Users (Admin Only)

### Get All Users

```bash
curl -X GET $BASE_URL/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get All Vendors

```bash
curl -X GET $BASE_URL/users/vendors \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get All Customers

```bash
curl -X GET $BASE_URL/users/customers \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get Pending Verifications

```bash
curl -X GET $BASE_URL/users/pending-verifications \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Update Verification Status

```bash
curl -X PATCH "$BASE_URL/users/{user-id}/verification?status=APPROVED&verifiedBy=admin-id" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Update KYC Status

```bash
curl -X PATCH "$BASE_URL/users/{user-id}/kyc?status=APPROVED&verifiedBy=admin-id" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 5. Testing Complete Flow

### Step 1: Register & Login as Vendor

```bash
# Register vendor
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Rental Shop",
    "email": "vendor@test.com",
    "password": "password123",
    "role": "VENDOR"
  }'

# Login as vendor
VENDOR_TOKEN=$(curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@test.com",
    "password": "password123"
  }' | jq -r '.token')

echo "Vendor Token: $VENDOR_TOKEN"
```

### Step 2: Create Product

```bash
PRODUCT_ID=$(curl -X POST $BASE_URL/products \
  -H "Authorization: Bearer $VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DJI Mavic Pro",
    "description": "Professional drone for aerial photography",
    "category": "Electronics",
    "rentalPricePerDay": 3000,
    "vendorName": "Drone Rentals Nepal",
    "vendorContact": "9841234567",
    "location": "Kathmandu"
  }' | jq -r '.data.id')

echo "Product ID: $PRODUCT_ID"
```

### Step 3: Register & Login as Customer

```bash
# Register customer
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer User",
    "email": "customer@test.com",
    "password": "password123",
    "role": "CUSTOMER"
  }'

# Login as customer
CUSTOMER_TOKEN=$(curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123"
  }' | jq -r '.token')

echo "Customer Token: $CUSTOMER_TOKEN"
```

### Step 4: Create Rental

```bash
RENTAL_ID=$(curl -X POST $BASE_URL/rentals \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"startDate\": \"2026-01-20\",
    \"days\": 3,
    \"deliveryAddress\": \"Thamel, Kathmandu\",
    \"contactPhone\": \"9841234567\"
  }" | jq -r '.data.id')

echo "Rental ID: $RENTAL_ID"
```

### Step 5: Confirm Rental

```bash
curl -X POST $BASE_URL/rentals/$RENTAL_ID/confirm \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```

### Step 6: Vendor Marks as Handed Over

```bash
curl -X POST $BASE_URL/rentals/$RENTAL_ID/handover \
  -H "Authorization: Bearer $VENDOR_TOKEN"
```

### Step 7: Customer Requests Return

```bash
curl -X POST $BASE_URL/rentals/$RENTAL_ID/request-return \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Rental period ended, product in good condition"
  }'
```

### Step 8: Vendor Approves Return

```bash
curl -X POST $BASE_URL/rentals/$RENTAL_ID/approve-return \
  -H "Authorization: Bearer $VENDOR_TOKEN"
```

## 6. Response Format

All API responses follow this format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Email is required",
    "password": "Password must be at least 6 characters"
  }
}
```

## 7. Status Codes

- `200 OK` - Successful request
- `400 Bad Request` - Invalid input or business logic error
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Notes

- Replace `{product-id}`, `{rental-id}`, `{user-id}` with actual UUIDs
- Save tokens from login responses for authenticated requests
- Use `jq` for parsing JSON responses (install with `sudo apt install jq`)
- Test in order to ensure dependencies are met (e.g., create product before rental)

