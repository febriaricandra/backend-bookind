# Backend Test - Attendance Management API

Backend untuk sistem manajemen absensi dengan fitur check-in/check-out, reporting, dan integrasi message broker.

## 🚀 Tech Stack

- **Framework**: Express.js dengan TypeScript
- **Database**: PostgreSQL dengan Prisma ORM
- **Cache**: Redis
- **Message Broker**: RabbitMQ
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston

## 🛠️ Setup & Installation

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd backend-test
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` dan sesuaikan konfigurasi:
```bash
cp .env.example .env
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run generate

# Run migrations
npm run migrate

# Seed database (optional)
npm run seed
```

### 4. Run Application
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Server akan berjalan di `http://localhost:3001`

## 📚 API Documentation

Base URL: `http://localhost:3001`

### Authentication Endpoints

#### 1. Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "EMPLOYEE" // atau "ADMIN", default: "EMPLOYEE"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EMPLOYEE",
    "createdAt": "2025-11-08T10:00:00.000Z"
  }
}
```

#### 2. Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "EMPLOYEE"
    },
    "token": "jwt-token-here"
  }
}
```

### Attendance Endpoints

**Note:** Semua endpoint attendance memerlukan authentication header: `Authorization: Bearer <token>`

#### 3. Check In
```http
POST /attendance/checkin
```

**Request Body:**
```json
{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "photo": "base64-encoded-photo-string"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Check-in successful. Report will be generated asynchronously.",
  "data": {
    "id": "attendance-uuid",
    "userId": "user-uuid",
    "checkInTime": "2025-11-08T08:00:00.000Z",
    "checkInLatitude": -6.2088,
    "checkInLongitude": 106.8456,
    "checkInPhoto": "base64-photo",
    "status": "CHECKED_IN"
  }
}
```

#### 4. Check Out
```http
POST /attendance/checkout
```

**Request Body:**
```json
{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "photo": "base64-encoded-photo-string"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Check-out successful. Report will be updated asynchronously.",
  "data": {
    "id": "attendance-uuid",
    "userId": "user-uuid",
    "checkInTime": "2025-11-08T08:00:00.000Z",
    "checkOutTime": "2025-11-08T17:00:00.000Z",
    "checkOutLatitude": -6.2088,
    "checkOutLongitude": 106.8456,
    "checkOutPhoto": "base64-photo",
    "status": "CHECKED_OUT",
    "workingHours": 9
  }
}
```

#### 5. Get Today's Attendance
```http
GET /attendance/today
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": "attendance-uuid",
    "checkInTime": "2025-11-08T08:00:00.000Z",
    "checkOutTime": null,
    "status": "CHECKED_IN",
    "workingHours": 0
  }
}
```

#### 6. Get Attendance History
```http
GET /attendance/history?startDate=2025-11-01&endDate=2025-11-30
```

**Query Parameters:**
- `startDate` (optional): Format YYYY-MM-DD
- `endDate` (optional): Format YYYY-MM-DD

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "attendance-uuid",
      "date": "2025-11-08",
      "checkInTime": "2025-11-08T08:00:00.000Z",
      "checkOutTime": "2025-11-08T17:00:00.000Z",
      "status": "CHECKED_OUT",
      "workingHours": 9
    }
  ]
}
```

### Report Endpoints

**Note:** Semua endpoint report memerlukan authentication header: `Authorization: Bearer <token>`

#### 7. Get My Report
```http
GET /reports/my-report?month=11&year=2025
```

**Query Parameters:**
- `month` (optional): Bulan (1-12)
- `year` (optional): Tahun

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-11-08",
      "attendanceStatus": "PRESENT",
      "checkInTime": "2025-11-08T08:00:00.000Z",
      "checkOutTime": "2025-11-08T17:00:00.000Z",
      "workingHours": 9,
      "overtimeHours": 1
    }
  ]
}
```

#### 8. Get My Monthly Summary
```http
GET /reports/my-summary?month=11&year=2025
```

**Query Parameters (Required):**
- `month`: Bulan (1-12)
- `year`: Tahun

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "month": 11,
    "year": 2025,
    "totalWorkingDays": 22,
    "totalPresent": 20,
    "totalAbsent": 2,
    "totalLate": 3,
    "totalWorkingHours": 180,
    "totalOvertimeHours": 15,
    "attendanceRate": 90.91
  }
}
```

#### 9. Get All Reports (Admin Only)
```http
GET /reports?userId=user-uuid&startDate=2025-11-01&endDate=2025-11-30
```

**Query Parameters:**
- `userId` (optional): Filter by specific user
- `startDate` (optional): Format YYYY-MM-DD
- `endDate` (optional): Format YYYY-MM-DD

**Headers:**
- `Authorization: Bearer <admin-token>`

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "userId": "user-uuid",
      "userName": "John Doe",
      "date": "2025-11-08",
      "attendanceStatus": "PRESENT",
      "checkInTime": "2025-11-08T08:00:00.000Z",
      "checkOutTime": "2025-11-08T17:00:00.000Z",
      "workingHours": 9
    }
  ]
}
```

## 🧪 Testing dengan cURL

### 1. Register User
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "EMPLOYEE"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Check In (dengan token)
```bash
curl -X POST http://localhost:3001/attendance/checkin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "latitude": -6.2088,
    "longitude": 106.8456,
    "photo": "base64-photo-string"
  }'
```

### 4. Get Today Attendance
```bash
curl -X GET http://localhost:3001/attendance/today \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Check Out
```bash
curl -X POST http://localhost:3001/attendance/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "latitude": -6.2088,
    "longitude": 106.8456,
    "photo": "base64-photo-string"
  }'
```

### 6. Get Attendance History
```bash
curl -X GET "http://localhost:3001/attendance/history?startDate=2025-11-01&endDate=2025-11-30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Get My Monthly Summary
```bash
curl -X GET "http://localhost:3001/reports/my-summary?month=11&year=2025" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing dengan Postman

1. **Import Collection**: Buat collection baru di Postman
2. **Set Environment Variables**:
   - `base_url`: `http://localhost:3001`
   - `token`: JWT token dari login response

3. **Authentication Setup**:
   - Untuk endpoints yang memerlukan auth, gunakan Bearer Token
   - Token diperoleh dari response login

## 📝 Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "\"email\" must be a valid email"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Unauthorized: No token provided"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Forbidden: Insufficient permissions"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Internal Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## 🔒 User Roles

- **EMPLOYEE**: Dapat melakukan check-in/out, melihat attendance dan report pribadi
- **ADMIN**: Memiliki akses ke semua endpoint termasuk melihat report semua user

## 📊 Features

✅ User Authentication (Register/Login)  
✅ JWT-based Authorization  
✅ Role-based Access Control (RBAC)  
✅ Attendance Check-in/Check-out  
✅ GPS Location Tracking  
✅ Photo Upload Support  
✅ Real-time Reporting  
✅ Monthly Summary Reports  
✅ Message Broker Integration (RabbitMQ)  
✅ Redis Caching  
✅ Comprehensive Logging  
✅ Input Validation  
✅ Error Handling  

## 🐛 Common Issues

1. **Database Connection Error**: Pastikan PostgreSQL berjalan dan konfigurasi DATABASE_URL benar
2. **Redis Connection Error**: Pastikan Redis server berjalan
3. **RabbitMQ Connection Error**: 
   - Pastikan RabbitMQ server berjalan: `sudo systemctl start rabbitmq-server`
   - Check status: `sudo systemctl status rabbitmq-server`
   - Install RabbitMQ: `sudo apt install rabbitmq-server` (Ubuntu/Debian)
   - Error "Channel closed" biasanya terjadi karena RabbitMQ server mati/restart
4. **JWT Token Expired**: Login ulang untuk mendapatkan token baru
5. **CORS Error**: Pastikan origin URL ada di CORS_ORIGINS
6. **RabbitMQ Channel Closed Error**: 
   - Aplikasi sudah handle reconnection otomatis
   - Attendance tetap tersimpan meski RabbitMQ gagal
   - Check log untuk melihat status reconnection

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.
