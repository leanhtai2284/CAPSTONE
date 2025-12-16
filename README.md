# 🍽️ SmartMeal - Hệ Thống Gợi Ý Thực Đơn Thông Minh

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.1.1-blue.svg)

**SmartMeal** là một ứng dụng web toàn diện giúp người dùng lập kế hoạch bữa ăn hàng ngày dựa trên sở thích cá nhân, mục tiêu dinh dưỡng và ngân sách. Hệ thống được thiết kế đặc biệt cho ẩm thực Việt Nam với các món ăn từ Ba miền Bắc - Trung - Nam.

## Tính Năng Chính

### Cho Người Dùng

- **Gợi ý thực đơn AI**: Hệ thống AI thông minh gợi ý món ăn dựa trên:
  - Vùng miền (Bắc, Trung, Nam)
  - Mục tiêu dinh dưỡng (giảm cân, tăng cơ, duy trì sức khỏe)
  - Chế độ ăn (Keto, Eat Clean, Vegetarian, High Protein, Traditional)
  - Dị ứng và thành phần cần tránh
  - Ngân sách chi tiêu
- **Quản lý thực đơn**: Lưu, chỉnh sửa và chia sẻ thực đơn yêu thích
- **Tra cứu dinh dưỡng**: Xem thông tin dinh dưỡng chi tiết của từng món ăn
- **Tìm kiếm công thức**: Tìm kiếm món ăn theo tên, nguyên liệu, vùng miền
- **Lập kế hoạch tuần**: Tạo thực đơn cho cả tuần với tính toán tự động
- **Góc dinh dưỡng**: Bài viết và tin tức về sức khỏe, dinh dưỡng
- **Đánh giá & phản hồi**: Gửi phản hồi và đánh giá món ăn

### 👨‍💼 Cho Quản Trị Viên

- **Dashboard thống kê**: Theo dõi người dùng, công thức, phản hồi
- **Quản lý công thức**: Thêm, sửa, xóa món ăn và công thức nấu
- **Quản lý người dùng**: Xem, chỉnh sửa thông tin người dùng
- **Quản lý tin tức**: Đăng bài viết về dinh dưỡng và ẩm thực
- **Xử lý phản hồi**: Xem và trả lời phản hồi từ người dùng
- **Báo cáo thống kê**: Xem báo cáo chi tiết về hoạt động hệ thống

## 🏗️ Kiến Trúc Hệ Thống

```
smartmeal/
├── backend/              # Node.js/Express API Server
│   ├── src/
│   │   ├── ai_module/   # Module AI gợi ý thực đơn
│   │   ├── config/      # Cấu hình (DB, Passport, ENV)
│   │   ├── controllers/ # Business logic
│   │   ├── models/      # MongoDB schemas
│   │   ├── routes/      # API endpoints
│   │   ├── middlewares/ # Auth, validation, error handling
│   │   ├── utils/       # Utilities (email, pagination)
│   │   └── scripts/     # Seed data scripts
│   └── data/            # CSV data files
│
├── frontend/            # React + Vite Application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── context/     # React Context (Auth, Loading)
│   │   ├── hooks/       # Custom React hooks
│   │   └── routes/      # Route configuration
│   └── public/          # Static assets

```

## Công Nghệ Sử Dụng

### Backend

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5.1.0
- **Database**: MongoDB (Mongoose 8.19.2)
- **Authentication**:
  - JWT (jsonwebtoken)
  - Passport.js (Google OAuth 2.0)
- **Security**: bcryptjs
- **Email**: Nodemailer
- **Data Processing**:
  - Cheerio (Web scraping)
  - CSV Parser
- **Development**: Nodemon

### Frontend

- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router DOM 7.9.1
- **Styling**:
  - Tailwind CSS 3.4.17
  - Framer Motion 12.23.24 (Animations)
- **UI Components**:
  - Headless UI
  - Lucide React (Icons)
  - React Icons
- **Charts**: Recharts 3.3.0
- **HTTP Client**: Axios 1.12.2
- **OAuth**: @react-oauth/google
- **Notifications**: React Toastify
- **Other**:
  - React Intersection Observer
  - React to Print
  - Swiper (Carousel)

## Cài Đặt

### Yêu Cầu Hệ Thống

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm hoặc yarn

### 1. Clone Repository

```bash
git clone <repository-url>
cd smartmeal
```

### 2. Cài Đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/smartmeal

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@smartmeal.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Cài Đặt Frontend

```bash
cd frontend
npm install
```

Tạo file `.env` trong thư mục `frontend`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Khởi Tạo Database

```bash
cd backend

# Seed dữ liệu món ăn vào database
npm run seed:dishes

# Tạo tài khoản admin
npm run seed:admin
```

## Chạy Ứng Dụng

### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Server chạy tại: http://localhost:5000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# App chạy tại: http://localhost:5173
```

## Tài Khoản Mặc Định

Sau khi chạy script `npm run seed:admin`, bạn có thể đăng nhập với:

**Admin:**

- Email: admin@smartmeal.com
- Password: [Xem trong script seed_admin.js]

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Endpoints Chính

#### Authentication

- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập
- `GET /auth/google` - Đăng nhập Google
- `POST /auth/logout` - Đăng xuất
- `POST /auth/forgot-password` - Quên mật khẩu
- `POST /auth/reset-password` - Đặt lại mật khẩu

#### Users

- `GET /users/profile` - Lấy thông tin profile
- `PUT /users/profile` - Cập nhật profile
- `PUT /users/preferences` - Cập nhật sở thích

#### Recipes

- `GET /recipes` - Lấy danh sách công thức
- `GET /recipes/:id` - Lấy chi tiết công thức
- `POST /recipes` - Tạo công thức mới (Admin)
- `PUT /recipes/:id` - Cập nhật công thức (Admin)
- `DELETE /recipes/:id` - Xóa công thức (Admin)

#### Menus

- `POST /menus/suggest` - Gợi ý thực đơn
- `GET /menus/saved` - Lấy thực đơn đã lưu
- `POST /menus/save` - Lưu thực đơn
- `DELETE /menus/:id` - Xóa thực đơn

#### Nutrition

- `GET /nutrition` - Lấy thông tin dinh dưỡng
- `GET /nutrition/search` - Tìm kiếm thông tin dinh dưỡng

#### Favorites

- `GET /favorites` - Lấy danh sách yêu thích
- `POST /favorites` - Thêm vào yêu thích
- `DELETE /favorites/:id` - Xóa khỏi yêu thích

#### News

- `GET /news` - Lấy danh sách tin tức
- `GET /news/:id` - Chi tiết tin tức
- `POST /news` - Tạo tin tức (Admin)
- `PUT /news/:id` - Cập nhật tin tức (Admin)
- `DELETE /news/:id` - Xóa tin tức (Admin)

#### Feedback

- `GET /feedback` - Lấy phản hồi
- `POST /feedback` - Gửi phản hồi
- `PUT /feedback/:id` - Cập nhật phản hồi (Admin)

#### Admin

- `GET /admin/statistics` - Thống kê tổng quan
- `GET /admin/users` - Quản lý người dùng
- `GET /admin/reports` - Báo cáo hệ thống

## AI Module

Hệ thống AI của SmartMeal sử dụng rule-based engine để gợi ý món ăn phù hợp:

### Các Rules

1. **Diet Rule**: Lọc theo chế độ ăn tổng quan
2. **Traditional Rule**: Món ăn truyền thống Việt Nam
3. **High Protein Rule**: Món giàu protein (>18g)
4. **Eat Clean Rule**: Món ăn sạch, ít chế biến
5. **Vegetarian Rule**: Món chay
6. **Keto Rule**: Món ít carbs (<10g), nhiều chất béo

### Thuật Toán

- Lọc theo dị ứng và ngân sách
- Áp dụng rules theo chế độ ăn
- Ưu tiên nguyên liệu yêu thích
- Cân bằng dinh dưỡng (protein, carbs, fat, calories)
- Đa dạng vùng miền và loại món

## UI/UX Features

- **Dark Mode**: Hỗ trợ chế độ tối/sáng
- **Responsive Design**: Tương thích mobile, tablet, desktop
- **Smooth Animations**: Framer Motion transitions
- **Toast Notifications**: Real-time feedback
- **Lazy Loading**: Tối ưu performance
- **Intersection Observer**: Lazy load images
- **Print Support**: In thực đơn

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs
- **Google OAuth**: Third-party authentication
- **CORS Configuration**: Restricted origins
- **Input Validation**: Middleware validation
- **Error Handling**: Centralized error handler
