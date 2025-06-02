    # Blog API Project Documentation

## 📋 Project Overview

API này cung cấp các tính năng cơ bản của một hệ thống blog bao gồm xác thực người dùng, quản lý bài viết, phân loại và gắn tag.

### 🎯 Project Scope
- **Timeline**: 2 tuần
- **Team Size**: 2 người (1 Backend Developer, 1 Frontend Developer)
- **Technology**: NestJS(BE) + ReactJS(FE) + PostgreSQL
- **Authentication**: JWT với Refresh Token
- **Core Features**:
    - ✅ User Authentication (Register, Login)
    - ✅ JWT Access & Refresh Token Management
    - ✅ Blog Post CRUD Operations
    - ✅ Categories & Tags Management
    - ✅ Post Status Management (Draft, Published, Archived, etc.)

## 🗄️ Database Design

### Database Schema Overview

Database được thiết kế với 5 bảng chính để hỗ trợ các tính năng cốt lõi của blog API:

```
├── users (Người dùng)
├── refresh_tokens (JWT Refresh Tokens)
├── categories (Danh mục bài viết)
├── posts (Bài viết)
├── tags (Thẻ tag)
└── post_tags (Quan hệ Posts-Tags)

```

### 👥 Users Table
Quản lý thông tin người dùng và xác thực.

| Field | Type | Description |
|-------|------|-------------|
| id | SERIAL | Primary key |
| username | VARCHAR(50) | Tên đăng nhập (unique) |
| email | VARCHAR(100) | Email (unique) |
| password | VARCHAR(255) | Mật khẩu đã hash |
| full_name | VARCHAR(100) | Họ tên đầy đủ |
| avatar_url | VARCHAR(255) | URL ảnh đại diện |
| bio | TEXT | Tiểu sử ngắn |
| status | VARCHAR(20) | Trạng thái: active, inactive, banned |
| last_login_at | TIMESTAMP | Lần login cuối |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |

**User Status Flow:**
Người dùng được tạo với trạng thái `active`. Có thể chuyển sang `inactive` hoặc `banned`.

### 🎫 Refresh Tokens Table
Quản lý JWT refresh tokens để maintain sessions.

| Field | Type | Description |
|-------|------|-------------|
| id | SERIAL | Primary key |
| token | VARCHAR(255) | JWT refresh token (unique) |
| user_id | INTEGER | FK to users(id) |
| expires_at | TIMESTAMP | Thời hạn token |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |

### 📁 Categories Table
Danh mục phân loại bài viết.

| Field | Type | Description |
|-------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(100) | Tên danh mục (unique) |
| slug | VARCHAR(100) | URL slug (unique) |
| description | TEXT | Mô tả danh mục |
| color | VARCHAR(7) | Mã màu hex (#FF5733) |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |

### 📝 Posts Table
Bài viết chính của blog.

| Field | Type | Description |
|-------|------|-------------|
| id | SERIAL | Primary key |
| title | VARCHAR(255) | Tiêu đề bài viết |
| slug | VARCHAR(255) | URL slug (unique) |
| content | TEXT | Nội dung bài viết |
| excerpt | TEXT | Tóm tắt ngắn |
| featured_image | VARCHAR(255) | URL ảnh đại diện |
| status | VARCHAR(20) | Trạng thái bài viết (draft, published, archived) |
| view_count | INTEGER | Số lượt xem |
| author_id | INTEGER | FK to users(id) |
| category_id | INTEGER | FK to categories(id) |
| published_at | TIMESTAMP | Thời điểm publish |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |

**Post Status Flow:**

```
draft → published → archived

```

### 🏷️ Tags Table
Thẻ tag để gắn nhãn bài viết.

| Field | Type | Description |
|-------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(50) | Tên tag (unique) |
| slug | VARCHAR(50) | URL slug (unique) |
| created_at | TIMESTAMP | Thời gian tạo |

### 🔗 Post Tags Table
Quan hệ nhiều-nhiều giữa Posts và Tags.

| Field | Type | Description |
|-------|------|-------------|
| id | SERIAL | Primary key |
| post_id | INTEGER | FK to posts(id) |
| tag_id | INTEGER | FK to tags(id) |
| created_at | TIMESTAMP | Thời gian tạo |

## 🔐 Authentication Flow

### Registration Process
1. User submit registration form (username, email, password, full_name, etc.)
2. Tạo user với status = "active"

### Login Process
1. User login với email/password
2. Tạo Access Token (ví dụ: 15-30 phút)
3. Tạo Refresh Token (ví dụ: 7-30 ngày) và lưu vào database
4. Return cả 2 tokens cho client

### Token Refresh Process
1. Access Token hết hạn
2. Client gửi Refresh Token
3. Verify Refresh Token từ database (check tồn tại và chưa hết hạn)
4. Tạo Access Token mới
5. Optional: Rotate Refresh Token (tạo refresh token mới, xóa token cũ)

## 📡 API Endpoints Structure

### Authentication Endpoints

```
POST /api/auth/register          # Đăng ký tài khoản
POST /api/auth/login             # Đăng nhập
POST /api/auth/logout            # Đăng xuất (xóa refresh token)
POST /api/auth/refresh-token     # Refresh access token

POST /api/auth/register          # Đăng ký tài khoản
POST /api/auth/login             # Đăng nhập
POST /api/auth/logout            # Đăng xuất 
POST /api/auth/refresh-token     # Refresh access token
```

### User Management
```
GET  /api/users/profile          # Lấy thông tin profile (auth)
PUT  /api/users/profile          # Cập nhật profile (auth)
PUT  /api/users/change-password  # Đổi mật khẩu (auth)

```

### Posts Management
```
GET    /api/posts                # Lấy danh sách bài viết (public, có thể filter theo author_id cho "my posts")
GET    /api/posts/:slug          # Lấy chi tiết bài viết (public)
POST   /api/posts                # Tạo bài viết mới (auth)
PUT    /api/posts/:id            # Cập nhật bài viết (auth, chỉ chủ sở hữu)
DELETE /api/posts/:id            # Xóa bài viết (auth, chỉ chủ sở hữu)

```

### Categories Management
```
GET    /api/categories           # Lấy danh sách categories (public)
POST   /api/categories           # Tạo category (auth)
PUT    /api/categories/:id       # Cập nhật category (auth)
DELETE /api/categories/:id       # Xóa category (auth)

```

### Tags Management
```
GET    /api/tags                 # Lấy danh sách tags (public)
POST   /api/tags                 # Tạo tag (auth)
PUT    /api/tags/:id             # Cập nhật tag (auth)
DELETE /api/tags/:id             # Xóa tag (auth)

```

## 🛡️ Security Considerations

### Password Security
- Sử dụng bcrypt để hash password
- Minimum password length: 8 characters
- Password complexity requirements (nên có)

### JWT Security
- Access Token: Short-lived (ví dụ: 15-30 phút)
- Refresh Token: Longer-lived (ví dụ: 7-30 days)
- Refresh tokens được lưu trữ an toàn trong database (có thể thu hồi/revokable)
- HTTPS bắt buộc để truyền tokens
- Cân nhắc cơ chế Token blacklisting khi logout hoặc token bị lộ.

## 🚀 Development Setup

### Prerequisites
- Node.js (v20+)
- PostgreSQL (v13+)
- npm hoặc yarn

### Database Setup
1. Tạo PostgreSQL database
2. Chạy schema SQL (file `.sql` đã chỉnh sửa) để tạo tables
3. Configure connection string trong file môi trường

### Environment Variables Example
```env
DATABASE_URL=postgresql://user:password@localhost:5432/blog_db
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
```

## 📊 Performance Optimizations

### Database Indexes
- Primary keys và unique constraints
- Foreign key indexes
- Composite indexes cho query thường dùng
- Text search indexes cho title/content

### Query Optimizations
- Pagination cho danh sách bài viết
- Eager loading cho relationships
- Select only needed fields
- Connection pooling

### Git Workflow
- Feature branches
- Code review process
- Conventional commits
- Automated testing trước merge

### API Documentation
- Swagger/OpenAPI documentation
- Postman collection
- Request/Response examples

---

**Project Timeline**: 2 weeks  
**Team**: 2 developers  
**Tech Stack**: NestJs, ReactJs, PostgreSQL
**Last Updated**: May 2025