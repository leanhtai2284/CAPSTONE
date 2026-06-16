# Thong tin nhom va de tai

- Ma nhom: C2SE.27
- Ten de tai: SmartMealVN - AI-Supported Meal Recommendation System for Vietnamese Cuisine
- Ho ten thanh vien:
  - Huy, Phan Nhu
  - Tai, Le Anh
  - Khanh, Nguyen Quoc
  - Hieu, Le Trung
  - Phuong, Nguyen Duy
- Ho va ten mentor: Vu, Truong Tien

## Cai dat chuong trinh

### Tools can co

- Node.js >= 18
- MongoDB >= 6
- npm hoac yarn

### 1) Cai backend

```bash
cd backend
npm install
```

Tao file .env trong thu muc backend:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/smartmeal

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@smartmeal.com

FRONTEND_URL=http://localhost:5173
```

### 2) Cai frontend

```bash
cd frontend
npm install
```

Tao file .env trong thu muc frontend:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3) Seed du lieu

```bash
cd backend
npm run seed:dishes
npm run seed:admin
```

### 4) Chay ung dung

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

Backend: http://localhost:5000
Frontend: http://localhost:5173
