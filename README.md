# API Documentation Management

Công cụ quản lý tài liệu API cho nội bộ team, tập trung vào khai báo project, endpoint, header, params, request body và response mẫu. Ứng dụng chỉ quản lý tài liệu, không thực thi request API thật.

## Tech stack

- Frontend: ReactJS, Vite, Tailwind CSS
- Backend: NodeJS, ExpressJS, JWT
- Database: MongoDB

## Cấu trúc

```txt
API_documentation_management/
+-- front-end/
+-- back-end/
```

## Chạy backend

```bash
cd back-end
npm install
copy .env.example .env
npm run dev
```

Cần cấu hình trong `back-end/.env`:

```txt
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/api_documentation_management
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## Chạy frontend

```bash
cd front-end
npm install
copy .env.example .env
npm run dev
```

Frontend mặc định gọi API tại:

```txt
VITE_API_URL=http://localhost:5000/api
```

## Dữ liệu demo

- Tài khoản: `demo@apidoc.test`
- Mật khẩu: `Demo@123`
- Số project: 3
- Số API: 12

## Tính năng MVP

- Đăng ký, đăng nhập bằng JWT
- Quản lý project API
- Quản lý endpoint theo project
- Khai báo method, URL, header, path params, query params, request body, response
- Tìm kiếm và lọc endpoint
- Giao diện xem tài liệu API rõ ràng, dễ tra cứu

## API chính

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id

GET    /api/projects/:projectId/apis
POST   /api/projects/:projectId/apis
GET    /api/projects/:projectId/apis/:id
PUT    /api/projects/:projectId/apis/:id
DELETE /api/projects/:projectId/apis/:id
```
