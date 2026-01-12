# Rental Management System - Java Backend

A RESTful API backend for a rental management system built with **Spring Boot 3** and **MySQL**.

## 🏗️ Architecture

This project follows the **MVC (Model-View-Controller)** pattern with a clear separation of concerns:

```
java-backend/
├── src/main/java/com/rentalapp/
│   ├── controller/        # REST API Controllers
│   ├── service/           # Business Logic Layer
│   ├── repository/        # Data Access Layer (JPA Repositories)
│   ├── model/             # Entity Models
│   ├── dto/               # Data Transfer Objects
│   ├── security/          # JWT Authentication & Security
│   ├── config/            # Configuration Classes
│   ├── exception/         # Custom Exceptions & Error Handling
│   └── util/              # Utility Classes
├── src/main/resources/
│   └── application.properties
└── pom.xml                # Maven Dependencies
```

## 🚀 Tech Stack

- **Framework:** Spring Boot 3.2.1
- **Language:** Java 17
- **Database:** MySQL 8.0
- **ORM:** Spring Data JPA (Hibernate)
- **Security:** Spring Security + JWT (JSON Web Tokens)
- **Build Tool:** Maven
- **Payment Gateway:** Stripe API
- **Cloud Storage:** Cloudinary
- **Email:** JavaMail (Gmail SMTP)

## 📦 Dependencies

- `spring-boot-starter-web` - REST API
- `spring-boot-starter-data-jpa` - Database ORM
- `spring-boot-starter-security` - Authentication & Authorization
- `spring-boot-starter-validation` - Request Validation
- `spring-boot-starter-mail` - Email Services
- `mysql-connector-j` - MySQL Driver
- `jjwt` - JWT Token Management
- `stripe-java` - Payment Processing
- `cloudinary-http44` - Image Upload
- `lombok` - Boilerplate Code Reduction

## ⚙️ Configuration

### 1. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE rental_system;
```

### 2. Application Properties

Update `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/rental_system
spring.datasource.username=root
spring.datasource.password=your_password

# JWT Secret (Change in production!)
jwt.secret=your-256-bit-secret-key-change-this-in-production

# Stripe Keys
stripe.api.key=sk_test_your_stripe_secret_key

# Cloudinary
cloudinary.cloud.name=your_cloud_name
cloudinary.api.key=your_api_key
cloudinary.api.secret=your_api_secret

# Gmail SMTP
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

## 🏃 Running the Application

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

### Build & Run

```bash
# Navigate to java-backend folder
cd java-backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The server will start on `http://localhost:8080`

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| GET | `/me` | Get current user | Yes |
| POST | `/change-password` | Change password | Yes |

### Products (`/api/products`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all products | No |
| GET | `/available` | Get available products | No |
| GET | `/{id}` | Get product by ID | No |
| POST | `/` | Create product | Vendor/Admin |
| PUT | `/{id}` | Update product | Vendor/Admin |
| DELETE | `/{id}` | Delete product | Vendor/Admin |
| GET | `/vendor/my-products` | Get vendor's products | Vendor/Admin |

### Rentals (`/api/rentals`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create rental | Yes |
| GET | `/{id}` | Get rental by ID | Yes |
| GET | `/my-rentals` | Get user's rentals | Yes |
| GET | `/vendor/analytics` | Vendor analytics | Vendor/Admin |
| POST | `/{id}/confirm` | Confirm rental payment | Yes |
| POST | `/{id}/handover` | Mark as handed over | Vendor/Admin |
| POST | `/{id}/request-return` | Request return | Yes |
| POST | `/{id}/approve-return` | Approve return | Vendor/Admin |
| POST | `/{id}/reject-return` | Reject return | Vendor/Admin |
| POST | `/{id}/cancel` | Cancel rental | Yes |
| GET | `/overdue` | Get overdue rentals | Admin |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all users | Admin |
| GET | `/{id}` | Get user by ID | Yes |
| GET | `/vendors` | Get all vendors | Admin |
| GET | `/customers` | Get all customers | Admin |
| GET | `/pending-verifications` | Pending verifications | Admin |
| GET | `/pending-kyc` | Pending KYC | Admin |
| PATCH | `/{id}/verification` | Update verification | Admin |
| PATCH | `/{id}/kyc` | Update KYC status | Admin |

## 🔐 Authentication

This API uses **JWT (JSON Web Tokens)** for authentication.

### Request Headers

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### User Roles

- `CUSTOMER` - Regular users who rent products
- `VENDOR` - Product owners
- `SUPERADMIN` - System administrators

## 📝 Request/Response Examples

### Register User

**Request:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "CUSTOMER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "isVerified": false
  }
}
```

### Create Product

**Request:**
```json
POST /api/products
Authorization: Bearer <token>
{
  "name": "Canon EOS R5",
  "description": "Professional mirrorless camera",
  "category": "Electronics",
  "rentalPricePerDay": 5000,
  "vendorName": "Camera Rentals Nepal",
  "vendorContact": "9841234567",
  "location": "Kathmandu"
}
```

### Create Rental

**Request:**
```json
POST /api/rentals
Authorization: Bearer <token>
{
  "productId": "product-uuid",
  "startDate": "2026-01-15",
  "days": 5,
  "deliveryAddress": "Thamel, Kathmandu",
  "contactPhone": "9841234567",
  "deliveryLatitude": 27.7172,
  "deliveryLongitude": 85.3240,
  "deliveryLocationAddress": "Thamel, Kathmandu 44600, Nepal"
}
```

## 🗄️ Database Schema

### Users Table
- `id` (UUID, PK)
- `name`, `email`, `password_hash`
- `role` (CUSTOMER/VENDOR/SUPERADMIN)
- `is_verified`, `verification_status`
- `kyc_status`, `profile_image`
- Timestamps

### Products Table
- `id` (UUID, PK)
- `name`, `description`, `category`
- `rental_price_per_day`, `image_url`
- `status` (AVAILABLE/RENTED/UNAVAILABLE)
- `vendor_id`, `location`, `latitude`, `longitude`
- Timestamps

### Rentals Table
- `id` (UUID, PK)
- `user_id`, `product_id`
- `start_date`, `end_date`, `status`
- `total_amount`, `delivery_address`
- `delivery_latitude`, `delivery_longitude`
- `handed_over_at`, `returned_at`
- `fine_amount`, `daily_fine`
- `return_request_status`
- Timestamps

## 🛠️ Development

### Create Superadmin

Run SQL directly:

```sql
INSERT INTO users (id, name, email, password_hash, role, is_verified) 
VALUES (UUID(), 'Admin', 'admin@rental.com', '$2a$10$<bcrypt_hash>', 'SUPERADMIN', true);
```

Or use bcrypt to hash password first, then insert.

### Hot Reload

Spring Boot DevTools is included for automatic restart on code changes.

## 📚 Additional Features

### Exception Handling
- Global exception handler with `@RestControllerAdvice`
- Custom exceptions: `ResourceNotFoundException`, `BadRequestException`
- Validation error responses

### Security
- Password encryption with BCrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- CORS configuration

### Data Validation
- Bean Validation annotations (`@NotBlank`, `@Email`, etc.)
- Request validation with `@Valid`

## 🧪 Testing

```bash
# Run tests
mvn test

# Run with coverage
mvn test jacoco:report
```

## 📦 Deployment

### Build JAR

```bash
mvn clean package
```

### Run JAR

```bash
java -jar target/rental-backend-1.0.0.jar
```

### Docker (Optional)

```dockerfile
FROM openjdk:17-slim
COPY target/rental-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 🤝 Contributing

1. Follow Java coding conventions
2. Use meaningful variable names
3. Write unit tests for services
4. Document all public APIs

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

Rental Management System Team

---

**Note:** This backend is NOT integrated with the existing Node.js frontend. It's a standalone Java implementation for learning purposes.

