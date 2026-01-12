# Java Backend Project Structure

## 📂 Complete Directory Tree

```
java-backend/
├── src/
│   ├── main/
│   │   ├── java/com/rentalapp/
│   │   │   ├── RentalApplication.java          # Main Spring Boot application
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java         # Security & CORS configuration
│   │   │   ├── controller/                      # REST API Controllers (MVC Layer)
│   │   │   │   ├── AuthController.java          # Authentication endpoints
│   │   │   │   ├── ProductController.java       # Product CRUD endpoints
│   │   │   │   ├── RentalController.java        # Rental management endpoints
│   │   │   │   └── UserController.java          # User management endpoints
│   │   │   ├── dto/                             # Data Transfer Objects
│   │   │   │   ├── ApiResponse.java             # Standard API response wrapper
│   │   │   │   ├── AuthResponse.java            # Auth response with token
│   │   │   │   ├── ChangePasswordRequest.java   # Change password payload
│   │   │   │   ├── LoginRequest.java            # Login credentials
│   │   │   │   ├── ProductRequest.java          # Product creation/update
│   │   │   │   ├── RegisterRequest.java         # User registration
│   │   │   │   ├── RentalRequest.java           # Rental creation
│   │   │   │   └── UserDTO.java                 # User data transfer object
│   │   │   ├── exception/                       # Exception Handling
│   │   │   │   ├── BadRequestException.java     # 400 errors
│   │   │   │   ├── GlobalExceptionHandler.java  # Global error handler
│   │   │   │   └── ResourceNotFoundException.java # 404 errors
│   │   │   ├── model/                           # Entity Models (Database)
│   │   │   │   ├── PasswordResetToken.java      # Password reset tokens
│   │   │   │   ├── Product.java                 # Product entity
│   │   │   │   ├── Rental.java                  # Rental entity
│   │   │   │   └── User.java                    # User entity
│   │   │   ├── repository/                      # Data Access Layer (JPA)
│   │   │   │   ├── PasswordResetTokenRepository.java
│   │   │   │   ├── ProductRepository.java       # Product database operations
│   │   │   │   ├── RentalRepository.java        # Rental database operations
│   │   │   │   └── UserRepository.java          # User database operations
│   │   │   ├── security/                        # Security & JWT
│   │   │   │   ├── JwtAuthenticationFilter.java # JWT request filter
│   │   │   │   └── JwtTokenProvider.java        # JWT token generation/validation
│   │   │   ├── service/                         # Business Logic Layer
│   │   │   │   ├── AuthService.java             # Authentication logic
│   │   │   │   ├── ProductService.java          # Product business logic
│   │   │   │   ├── RentalService.java           # Rental business logic
│   │   │   │   └── UserService.java             # User business logic
│   │   │   └── util/                            # Utility classes (empty for now)
│   │   └── resources/
│   │       └── application.properties           # Application configuration
│   └── test/                                    # Test directory (empty for now)
├── .gitignore                                   # Git ignore patterns
├── API_EXAMPLES.md                              # API testing examples (curl commands)
├── Dockerfile                                   # Docker container configuration
├── docker-compose.yml                           # Docker Compose for MySQL + Backend
├── pom.xml                                      # Maven dependencies
├── PROJECT_STRUCTURE.md                         # This file
├── README.md                                    # Main documentation
└── start.sh                                     # Quick start script
```

## 📋 File Count Summary

- **Total Java Files:** 33
- **Configuration Files:** 2 (pom.xml, application.properties)
- **Documentation Files:** 3 (README.md, API_EXAMPLES.md, PROJECT_STRUCTURE.md)
- **Docker Files:** 2 (Dockerfile, docker-compose.yml)
- **Scripts:** 1 (start.sh)

## 🏗️ MVC Architecture Breakdown

### 1. **Model Layer** (4 entities)
- `User.java` - User accounts (customers, vendors, admins)
- `Product.java` - Rental products
- `Rental.java` - Rental transactions
- `PasswordResetToken.java` - Password reset tokens

### 2. **View Layer** (7 DTOs)
- Request DTOs: `LoginRequest`, `RegisterRequest`, `ProductRequest`, `RentalRequest`, `ChangePasswordRequest`
- Response DTOs: `UserDTO`, `AuthResponse`, `ApiResponse<T>`

### 3. **Controller Layer** (4 controllers)
- `AuthController` - Authentication & user management
- `ProductController` - Product CRUD operations
- `RentalController` - Rental lifecycle management
- `UserController` - User administration

### 4. **Service Layer** (4 services)
- `AuthService` - Authentication business logic
- `UserService` - User management logic
- `ProductService` - Product management logic
- `RentalService` - Rental management logic

### 5. **Repository Layer** (4 repositories)
- `UserRepository` - User data access
- `ProductRepository` - Product data access
- `RentalRepository` - Rental data access
- `PasswordResetTokenRepository` - Token data access

## 🔧 Configuration Files

### pom.xml
Maven configuration with dependencies:
- Spring Boot (Web, Data JPA, Security, Mail, Validation)
- MySQL Connector
- JWT (jjwt)
- Stripe API
- Cloudinary
- Lombok

### application.properties
Application configuration for:
- Database connection
- JWT settings
- Stripe API keys
- Cloudinary settings
- Email (Gmail SMTP)
- CORS settings

## 🔐 Security Architecture

```
Client Request
     ↓
JwtAuthenticationFilter (validates token)
     ↓
SecurityFilterChain (checks permissions)
     ↓
Controller (handles request)
     ↓
Service (business logic)
     ↓
Repository (database)
```

## 📊 Database Schema

### Users Table
- Primary Key: `id` (UUID)
- Fields: name, email, password_hash, role, verification status, KYC status
- Roles: CUSTOMER, VENDOR, SUPERADMIN

### Products Table
- Primary Key: `id` (UUID)
- Fields: name, description, category, price, image, status, vendor details, location
- Status: AVAILABLE, RENTED, UNAVAILABLE

### Rentals Table
- Primary Key: `id` (UUID)
- Foreign Keys: user_id, product_id
- Fields: dates, amount, delivery details, return status, fines
- Status: PENDING, ACTIVE, COMPLETED, CANCELLED

## 🚀 API Endpoints Summary

### Authentication (4 endpoints)
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user
- POST `/api/auth/change-password` - Change password

### Products (7 endpoints)
- GET `/api/products` - List all products
- GET `/api/products/available` - Available products
- GET `/api/products/{id}` - Get product
- POST `/api/products` - Create product (Vendor)
- PUT `/api/products/{id}` - Update product (Vendor)
- DELETE `/api/products/{id}` - Delete product (Vendor)
- GET `/api/products/vendor/my-products` - Vendor's products

### Rentals (10 endpoints)
- POST `/api/rentals` - Create rental
- GET `/api/rentals/{id}` - Get rental
- GET `/api/rentals/my-rentals` - User's rentals
- GET `/api/rentals/vendor/analytics` - Vendor analytics
- POST `/api/rentals/{id}/confirm` - Confirm payment
- POST `/api/rentals/{id}/handover` - Mark handed over
- POST `/api/rentals/{id}/request-return` - Request return
- POST `/api/rentals/{id}/approve-return` - Approve return
- POST `/api/rentals/{id}/reject-return` - Reject return
- POST `/api/rentals/{id}/cancel` - Cancel rental

### Users - Admin (8 endpoints)
- GET `/api/users` - All users
- GET `/api/users/{id}` - Get user
- GET `/api/users/vendors` - All vendors
- GET `/api/users/customers` - All customers
- GET `/api/users/pending-verifications` - Pending verifications
- GET `/api/users/pending-kyc` - Pending KYC
- PATCH `/api/users/{id}/verification` - Update verification
- PATCH `/api/users/{id}/kyc` - Update KYC

**Total API Endpoints: 29**

## 🛠️ How to Run

### Option 1: Using Maven
```bash
cd java-backend
./start.sh
```

### Option 2: Using Docker Compose
```bash
cd java-backend
docker-compose up --build
```

### Option 3: Manual
```bash
mvn clean install
mvn spring-boot:run
```

## 📦 Key Features

✅ **RESTful API** with proper HTTP methods
✅ **JWT Authentication** for secure access
✅ **Role-Based Access Control** (RBAC)
✅ **Global Exception Handling** with custom messages
✅ **Request Validation** using Bean Validation
✅ **Spring Data JPA** for database operations
✅ **Transaction Management** for data consistency
✅ **CORS Configuration** for frontend integration
✅ **Dockerfile & Docker Compose** for easy deployment
✅ **Comprehensive API Documentation** with examples

## 🔄 Data Flow Example

**Creating a Rental:**

```
1. Client → POST /api/rentals
2. JwtAuthenticationFilter validates token
3. RentalController receives request
4. @Valid triggers validation on RentalRequest
5. RentalService.createRental() called
6. ProductService checks availability
7. RentalRepository.save() persists data
8. ProductService updates product status
9. Response returned with rental details
```

## 📝 Design Patterns Used

1. **MVC Pattern** - Separation of concerns
2. **Repository Pattern** - Data access abstraction
3. **DTO Pattern** - Data transfer between layers
4. **Builder Pattern** - JWT token creation
5. **Singleton Pattern** - Spring beans
6. **Filter Pattern** - JWT authentication
7. **Dependency Injection** - Spring IoC

## 🎯 Best Practices Implemented

✅ Package organization by layer
✅ Separation of concerns
✅ RESTful naming conventions
✅ Proper HTTP status codes
✅ Standardized API responses
✅ Global exception handling
✅ Transaction management
✅ Secure password storage (BCrypt)
✅ JWT token authentication
✅ Input validation
✅ SQL injection prevention (JPA)

## 🚧 Future Enhancements (Not Implemented)

- Unit & Integration tests
- API rate limiting
- Redis caching
- Email service implementation
- File upload service (Cloudinary)
- Stripe payment integration
- WebSocket for real-time updates
- API documentation (Swagger/OpenAPI)
- Audit logging
- Scheduled tasks for fines

## 📚 Technologies & Libraries

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Programming Language |
| Spring Boot | 3.2.1 | Framework |
| MySQL | 8.0 | Database |
| Maven | 3.6+ | Build Tool |
| JWT | 0.12.3 | Authentication |
| Lombok | Latest | Code Generation |
| Stripe | 24.3.0 | Payments |
| Cloudinary | 1.36.0 | Image Storage |

## 📖 Documentation Files

1. **README.md** - Main documentation with setup instructions
2. **API_EXAMPLES.md** - Curl commands for testing all endpoints
3. **PROJECT_STRUCTURE.md** - This file, complete project overview

## ⚠️ Important Notes

- **NOT INTEGRATED** with the existing Node.js frontend
- This is a **standalone Java backend** implementation
- Uses the **same database schema** as Node.js backend
- Can run **alongside** the Node.js backend on different ports
- Created for **learning and demonstration** purposes
- All configuration values in `application.properties` need to be updated for production

## 🎓 Learning Outcomes

This project demonstrates:
- Spring Boot REST API development
- MVC architecture implementation
- JPA & Hibernate ORM
- JWT authentication & authorization
- Spring Security configuration
- Exception handling best practices
- Repository pattern usage
- DTO pattern for API responses
- Docker containerization
- Maven dependency management

---

**Created by:** Rental Management System Team  
**Date:** January 2026  
**Purpose:** Educational Java Backend Implementation

