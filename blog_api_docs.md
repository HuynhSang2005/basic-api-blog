<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

# Blog API Project Documentation

## 📋 Project Overview

Blog API được xây dựng bằng NestJS, cung cấp đầy đủ các tính năng cho một hệ thống blog hiện đại với xác thực người dùng, quản lý bài viết, phân loại và gắn tag.

### 🎯 Project Features
- **Technology Stack**: NestJS + TypeScript + Prisma + SQLite
- **Authentication**: JWT với Refresh Token
- **Role-based Access Control**: ADMIN, AUTHOR, USER
- **Core Features**:
    - ✅ User Authentication & Authorization (Register, Login, Role-based)
    - ✅ JWT Access & Refresh Token Management
    - ✅ Blog Post CRUD Operations với ownership control
    - ✅ Categories & Tags Management
    - ✅ Post Status Management (DRAFT, PUBLISHED, ARCHIVED)
    - ✅ Admin Dashboard với full control
    - ✅ Search & Filter capabilities
    - ✅ Swagger API Documentation
    - ✅ Request/Response validation với Zod

## 🏗️ Architecture Overview

### Project Structure
```
src/
├── app.module.ts                 # Root module
├── main.ts                      # Application entry point
├── common/                      # Shared utilities
│   ├── decorators/             # Custom decorators
│   ├── filters/                # Exception filters
│   ├── guards/                 # Authentication & authorization guards
│   ├── interceptors/           # Request/response interceptors
│   └── pipes/                  # Validation pipes
├── routes/                     # API routes modules
│   ├── auth/                   # Authentication endpoints
│   ├── categories/             # Categories management
│   ├── posts/                  # Posts management
│   ├── tags/                   # Tags management
│   └── users/                  # User management
└── shared/                     # Shared services & types
    ├── services/               # Shared services
    ├── types/                  # TypeScript types
    └── constants/              # Application constants
```

## 🗄️ Database Design

### Database Schema Overview

Database được thiết kế với Prisma ORM và SQLite, bao gồm 6 bảng chính:

```
├── User (Người dùng)
├── RefreshToken (JWT Refresh Tokens) 
├── Category (Danh mục bài viết)
├── Post (Bài viết)
├── Tag (Thẻ tag)
└── PostTag (Quan hệ Posts-Tags)
```

### 👥 User Table
Quản lý thông tin người dùng với role-based access control.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| username | String | Tên đăng nhập (unique) |
| email | String | Email (unique) |
| password | String | Mật khẩu đã hash |
| fullName | String? | Họ tên đầy đủ |
| avatarUrl | String? | URL ảnh đại diện |
| bio | String? | Tiểu sử ngắn |
| role | UserRole | ADMIN, AUTHOR, USER |
| status | UserStatus | ACTIVE, INACTIVE, BANNED |
| lastLoginAt | DateTime? | Lần login cuối |
| createdAt | DateTime | Thời gian tạo |
| updatedAt | DateTime | Thời gian cập nhật |

**User Roles:**
- `ADMIN`: Full control over system
- `AUTHOR`: Can create/edit own posts
- `USER`: Read-only access

### 🎫 RefreshToken Table
Quản lý JWT refresh tokens với expiration tracking.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| token | String | JWT refresh token (unique) |
| userId | Int | FK to User(id) |
| expiresAt | DateTime | Thời hạn token |
| createdAt | DateTime | Thời gian tạo |
| updatedAt | DateTime | Thời gian cập nhật |

### 📁 Category Table
Danh mục phân loại bài viết với slug support.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| name | String | Tên danh mục (unique) |
| slug | String | URL slug (unique) |
| description | String? | Mô tả danh mục |
| color | String? | Mã màu hex (#FF5733) |
| createdAt | DateTime | Thời gian tạo |
| updatedAt | DateTime | Thời gian cập nhật |

### 📝 Post Table
Bài viết chính với full content management.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| title | String | Tiêu đề bài viết |
| slug | String | URL slug (unique) |
| content | String | Nội dung bài viết (HTML/Markdown) |
| excerpt | String? | Tóm tắt ngắn |
| featuredImage | String? | URL ảnh đại diện |
| status | PostStatus | DRAFT, PUBLISHED, ARCHIVED |
| viewCount | Int | Số lượt xem (default: 0) |
| authorId | Int | FK to User(id) |
| categoryId | Int | FK to Category(id) |
| publishedAt | DateTime? | Thời điểm publish |
| createdAt | DateTime | Thời gian tạo |
| updatedAt | DateTime | Thời gian cập nhật |

**Post Status Flow:**
```
DRAFT → PUBLISHED → ARCHIVED
  ↑         ↓
  └─────────┘
```

### 🏷️ Tag Table
Thẻ tag để gắn nhãn bài viết.

| Field | Type | Description |
|-------|------|-------------|
| id | Int | Primary key |
| name | String | Tên tag (unique) |
| slug | String | URL slug (unique) |
| createdAt | DateTime | Thời gian tạo |

### 🔗 PostTag Table
Quan hệ nhiều-nhiều giữa Posts và Tags.

| Field | Type | Description |
|-------|------|-------------|
| postId | Int | FK to Post(id) |
| tagId | Int | FK to Tag(id) |
| createdAt | DateTime | Thời gian tạo |

## 🔐 Authentication & Authorization Flow

### Registration Process
1. User submit registration form (username, email, password, fullName)
2. Password được hash với bcrypt (salt rounds: 12)
3. Tạo user với role = "USER", status = "ACTIVE"
4. Return user info (không có password)

### Login Process
1. Validate email/password
2. Generate JWT payload với userId, username, role
3. Create Access Token (1 hour expiry)
4. Create Refresh Token (30 days expiry) và lưu vào database
5. Return tokens + user info

### Token Refresh Process
1. Client gửi expired access token + refresh token
2. Verify refresh token từ database
3. Generate new access token
4. Create new refresh token (rotate strategy)
5. Delete old refresh token
6. Return new tokens

### Role-based Authorization
- **Guards**: [`RoleGuard`](src/common/guards/role.guard.ts), [`PostOwnershipGuard`](src/common/guards/post-ownership.guard.ts)
- **Decorators**: `@AdminOnly()`, `@AuthorOrAdmin()`, `@PostOwner()`
- **Post Ownership**: Authors can only edit their own posts, Admins can edit any post

## 📡 API Endpoints

### 🔑 Authentication (`/auth`)
```
POST /auth/register              # Đăng ký tài khoản
POST /auth/login                 # Đăng nhập  
POST /auth/logout                # Đăng xuất (xóa refresh token)
POST /auth/refresh-token         # Refresh access token
```

### 👤 User Management (`/users`)
```
GET  /users/profile              # Lấy profile cá nhân (auth required)
PUT  /users/profile              # Cập nhật profile (auth required)
PUT  /users/change-password      # Đổi mật khẩu (auth required)

# Admin endpoints
GET  /users                      # Lấy danh sách users (admin only)
PUT  /users/:id/status           # Cập nhật status user (admin only)
```

### 📝 Posts Management (`/posts`)
```
# Public endpoints
GET    /posts                    # Lấy danh sách bài viết published
GET    /posts/search/suggestions # Gợi ý tìm kiếm
GET    /posts/popular           # Bài viết phổ biến
GET    /posts/recent            # Bài viết mới nhất
GET    /posts/:slug             # Chi tiết bài viết (tăng view count)

# Author endpoints (auth required)
GET    /posts/my-posts          # Bài viết của tôi
POST   /posts                   # Tạo bài viết mới
PUT    /posts/:id               # Cập nhật bài viết (chỉ chủ sở hữu)
DELETE /posts/:id               # Xóa bài viết (chỉ chủ sở hữu)
PUT    /posts/:id/publish       # Publish bài viết (chỉ chủ sở hữu)

# Admin endpoints
GET    /posts/admin/all         # Tất cả bài viết (bao gồm draft)
PUT    /posts/admin/:id         # Cập nhật bất kỳ bài viết nào
DELETE /posts/admin/:id         # Xóa bất kỳ bài viết nào
PUT    /posts/admin/:id/publish # Publish bất kỳ bài viết nào
PUT    /posts/admin/:id/status  # Thay đổi status bài viết
GET    /posts/stats             # Thống kê bài viết
```

### 📁 Categories Management (`/categories`)
```
# Public endpoints
GET    /categories              # Danh sách categories
GET    /categories/:id          # Chi tiết category
GET    /categories/slug/:slug   # Chi tiết category by slug

# Author/Admin endpoints (auth required)
POST   /categories              # Tạo category mới
PUT    /categories/:id          # Cập nhật category
DELETE /categories/:id          # Xóa category (kiểm tra ràng buộc)
```

### 🏷️ Tags Management (`/tags`)
```
# Public endpoints
GET    /tags                    # Danh sách tags
GET    /tags/popular           # Tags phổ biến
GET    /tags/:id               # Chi tiết tag
GET    /tags/slug/:slug        # Chi tiết tag by slug

# Author/Admin endpoints (auth required)
POST   /tags                   # Tạo tag mới
PUT    /tags/:id               # Cập nhật tag
DELETE /tags/:id               # Xóa tag (kiểm tra ràng buộc)
```

### Query Parameters Support
```
# Posts listing
?page=1&limit=10&search=keyword&status=PUBLISHED&categoryId=1&authorId=2&tagId=3&sortBy=createdAt&sortOrder=desc

# Categories/Tags listing  
?page=1&limit=10&search=keyword&sortBy=name&sortOrder=asc
```

## 🔧 Key Features Implementation

### 1. Slug Generation
- Automatic slug generation từ title/name
- Duplicate slug handling với suffix numbers
- Service: [`SlugService`](src/shared/services/slug.service.ts)

### 2. Validation với Zod
- Request/Response validation
- Type-safe DTOs
- Custom validation rules
- Error handling với proper messages

### 3. Search & Filter
- Full-text search trong title, content, excerpt
- Multi-field filtering (status, category, author, tags)
- Pagination support
- Sort by multiple fields

### 4. Admin Features
- Force operations (bypass ownership checks)
- System-wide statistics
- User management
- Content moderation

### 5. Security Features
- Password hashing với bcrypt
- JWT với proper expiration
- Refresh token rotation
- Role-based access control
- Request rate limiting (có thể thêm)

## 🚀 Development Setup

### Prerequisites
```bash
Node.js v18+
npm or yarn
```

### Installation
```bash
# Clone repository
git clone <repository-url>
cd basic-blog-api

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npx prisma generate
npx prisma db push

# Seed initial data
npm run init-seed-data

# Start development server  
npm run start:dev
```

### Default Accounts (after seeding)
```
Admin: admin@blog.com / admin123
Author: author@blog.com / author123  
User: user@blog.com / user123
```

### Environment Variables
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Configuration
ACCESS_TOKEN_SECRET="your_access_token_secret"
REFRESH_TOKEN_SECRET="your_refresh_token_secret"
ACCESS_TOKEN_EXPIRES_IN="1h"
REFRESH_TOKEN_EXPIRES_IN="30d"

# Application
NODE_ENV="development"
PORT=3000
```

## 📖 API Documentation

### Swagger Documentation
- **URL**: `http://localhost:3000/api-docs`
- **Features**:
  - Interactive API testing
  - Request/Response examples
  - Authentication support
  - Schema documentation

### Authentication Header
```
Authorization: Bearer <access_token>
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
```

## 🛡️ Security Best Practices

### Password Security
- bcrypt với salt rounds = 12
- Minimum password length: 6 characters
- Password strength validation

### JWT Security
- Short-lived access tokens (1 hour)
- Refresh token rotation
- Proper token validation
- Secure token storage recommendations

### Data Validation
- Input sanitization
- Type checking với Zod
- SQL injection prevention (Prisma ORM)
- XSS protection

### Access Control
- Role-based permissions
- Resource ownership validation
- Admin-only operations separation

## 📊 Performance Considerations

### Database Optimizations
- Prisma query optimization
- Proper indexing (handled by Prisma)
- Pagination for large datasets
- Selective field loading

### Caching Strategy
- Response caching có thể implement
- Database query caching
- Static content caching

### Monitoring
- Request logging với [`LoggingInterceptor`](src/common/interceptor/logging.interceptor.ts)
- Error tracking
- Performance metrics

## 🧪 Testing

### Test Structure
```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e

# Test coverage
npm run test:cov
```

### Test Data
- Seeding script: [`initialScript/index.ts`](initialScript/index.ts)
- Sample data for all entities
- Proper relationships setup

## 🚀 Production Deployment

### Build Process
```bash
npm run build
npm run start:prod
```

### Database Migration
```bash
npx prisma migrate deploy
```

### Environment Setup
- Production environment variables
- Database configuration
- SSL/TLS setup
- Process management (PM2, Docker)

---

**Project Info**:
- **Framework**: NestJS v11
- **Database**: Prisma + SQLite  
- **Authentication**: JWT + Refresh Token
- **Documentation**: Swagger/OpenAPI
- **Validation**: Zod + nestjs-zod
- **Last Updated**: June 2025

**Live API**: `http://localhost:3000`  
**Documentation**: `http://localhost:3000/api-docs`