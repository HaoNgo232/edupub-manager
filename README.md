# EduPub Manager

EduPub Manager là một hệ thống quản lý tài liệu giáo dục được xây dựng theo mô hình full-stack gồm:

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** NestJS, TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **Deployment local:** Docker Compose

Dự án được phát triển theo chủ đề **quản lý tài liệu/sách giáo dục**, phù hợp với bối cảnh hệ thống xuất bản và quản lý tài nguyên học tập.

Người dùng có thể tạo và quản lý tài liệu của chính mình. Quản trị viên có thể quản lý toàn bộ tài liệu, người dùng, phân quyền và xem thống kê tổng quan của hệ thống.

---

## 1. Hướng dẫn cài đặt

### 1.1. Cài đặt nhanh bằng Docker Compose

Cách này được khuyến nghị để chạy toàn bộ hệ thống nhanh nhất.

Yêu cầu:

- Đã cài Docker
- Đã cài Docker Compose

Copy và chạy các lệnh sau:

```bash
git clone https://github.com/HaoNgo232/edupub-manager.git
cd edupub-manager
docker compose up --build -d
```

Sau khi chạy thành công, truy cập:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

Lệnh trên sẽ tự động:

- Khởi động PostgreSQL 16
- Build backend NestJS
- Build frontend Next.js
- Chạy Prisma migration
- Seed dữ liệu mẫu
- Tạo tài khoản USER và ADMIN mặc định
- Mount volume cho file upload

---

### 1.2. Dừng hệ thống

```bash
docker compose down
```

Nếu muốn xóa cả database volume:

```bash
docker compose down -v
```

---

### 1.3. Chạy local thủ công không dùng docker

#### Bước 1: Chạy PostgreSQL thủ công

Tại thư mục root:

```bash
docker compose up postgres -d
```

---

#### Bước 2: Chạy backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma generate
npx prisma db seed
npm run start:dev
```

Backend chạy tại:

```txt
http://localhost:3001
```

---

#### Bước 3: Chạy frontend

Mở terminal khác:

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại:

```txt
http://localhost:3000
```

---

## 2. Thông tin tài khoản test

Hệ thống tạo sẵn 2 tài khoản để kiểm thử:

| Loại tài khoản | Email             | Password     | Role  |
| -------------- | ----------------- | ------------ | ----- |
| User           | user@edupub.test  | User@123456  | USER  |
| Administrator  | admin@edupub.test | Admin@123456 | ADMIN |

> Nếu quá trình đăng nhập gặp lỗi **Internal Server Error**, hãy di chuyển vào thư mục `backend` và chạy lệnh `npm run seed` để thiết lập lại dữ liệu mẫu, sau đó thử đăng nhập lại.

---

## 3. Giới thiệu chủ đề

**EduPub Manager** là ứng dụng web giúp quản lý tài liệu giáo dục như sách, giáo trình, tài liệu học tập hoặc tài nguyên tham khảo.

Mỗi tài liệu có thể gồm:

- Tiêu đề
- Mô tả
- Môn học
- Khối/lớp
- Trạng thái
- Ảnh bìa
- File tài liệu đính kèm
- Người sở hữu tài liệu

Hệ thống có 2 vai trò chính:

### USER

Người dùng thường có thể:

- Đăng ký tài khoản
- Đăng nhập
- Xem/chỉnh sửa profile
- Tạo tài liệu của mình
- Xem, sửa, xóa tài liệu do chính mình tạo
- Tìm kiếm, lọc và phân trang tài liệu của mình
- Upload ảnh bìa và file tài liệu

### ADMIN

Quản trị viên có thể:

- Xem dashboard thống kê hệ thống
- Quản lý toàn bộ tài liệu trong hệ thống
- Quản lý người dùng
- Tạo người dùng mới
- Cập nhật thông tin người dùng
- Phân quyền USER/ADMIN
- Xóa người dùng
- Xem thống kê tài liệu, người dùng và hoạt động gần đây

---

## 4. Các tính năng đã hoàn thành theo yêu cầu đề bài

### Authentication

- Đăng ký tài khoản
- Đăng nhập
- JWT Authentication
- Mã hóa password bằng bcrypt
- Lấy thông tin user hiện tại
- Bảo vệ route bằng token

### Phân quyền USER/ADMIN

- Role USER và ADMIN
- USER chỉ được quản lý dữ liệu của chính mình
- ADMIN có quyền quản lý dữ liệu toàn hệ thống
- Bảo vệ API admin bằng role guard
- Chặn USER truy cập khu vực admin

### Profile

- USER xem profile của mình
- USER cập nhật profile cá nhân

### Quản lý tài liệu

- Tạo tài liệu
- Xem danh sách tài liệu
- Xem chi tiết tài liệu
- Cập nhật tài liệu
- Xóa tài liệu
- Phân quyền ownership:
  - USER chỉ xem/sửa/xóa tài liệu của mình
  - ADMIN xem/sửa/xóa toàn bộ tài liệu
- Tìm kiếm theo tiêu đề/mô tả
- Lọc theo môn học
- Lọc theo trạng thái
- Lọc theo khối/lớp
- Phân trang
- Sắp xếp dữ liệu
- Responsive UI cho desktop/mobile

### Quản lý người dùng cho ADMIN

- Xem danh sách người dùng
- Tìm kiếm người dùng theo tên/email
- Lọc theo role
- Phân trang
- Xem chi tiết người dùng
- Tạo người dùng mới
- Cập nhật thông tin người dùng
- Đổi role USER/ADMIN
- Xóa người dùng
- Chặn admin tự xóa chính mình
- Chặn admin tự đổi role của chính mình

### Admin Dashboard

- Tổng số người dùng
- Tổng số admin
- Tổng số user thường
- Tổng số tài liệu
- Tổng số tài liệu theo trạng thái
- Thống kê tài liệu theo môn học
- Thống kê tài liệu theo khối/lớp
- Thống kê user theo role
- Danh sách tài liệu mới nhất
- Danh sách người dùng mới nhất
- Biểu đồ thống kê trên giao diện admin

### Upload ảnh/file

- Upload ảnh bìa tài liệu
- Upload file tài liệu
- Validate loại file
- Validate dung lượng file
- Lưu file vào backend local storage
- Trả URL file để gắn vào tài liệu
- Hiển thị ảnh bìa và file trong trang chi tiết tài liệu

### Docker & Documentation

- Docker Compose cho frontend, backend và PostgreSQL
- Tự động chạy migration và seed khi khởi động container
- Có tài khoản test USER và ADMIN
- Có README hướng dẫn cài đặt và kiểm thử
- Có API documentation trong `docs/API_DOCUMENTATION.md`

---

## 5. Luồng kiểm thử các tính năng theo yêu cầu đề bài

### 5.1. Kiểm thử Authentication

Truy cập:

```txt
http://localhost:3000/login
```

Kiểm thử:

1. Đăng nhập bằng tài khoản USER.
2. Đăng xuất.
3. Đăng nhập bằng tài khoản ADMIN.
4. Thử đăng nhập sai password.
5. Đăng ký tài khoản mới.
6. Kiểm tra sau khi đăng nhập hệ thống chuyển hướng đúng theo role.

Kết quả mong đợi:

- Đăng nhập đúng thì vào được hệ thống.
- Đăng nhập sai hiển thị lỗi.
- User thường không vào được trang admin.
- Admin vào được trang admin.

---

### 5.2. Kiểm thử USER chỉ quản lý dữ liệu của mình

Đăng nhập bằng:

```txt
user@edupub.test
User@123456
```

Truy cập:

```txt
http://localhost:3000/documents
```

Kiểm thử:

1. Xem danh sách tài liệu của user.
2. Tạo tài liệu mới.
3. Xem chi tiết tài liệu vừa tạo.
4. Cập nhật tài liệu.
5. Xóa tài liệu.
6. Tìm kiếm tài liệu theo tiêu đề hoặc mô tả.
7. Lọc tài liệu theo môn học.
8. Lọc tài liệu theo trạng thái.
9. Lọc tài liệu theo khối/lớp.
10. Chuyển trang bằng pagination.

Kết quả mong đợi:

- USER chỉ thấy tài liệu của chính mình.
- USER không thấy tài liệu của user khác.
- Các thao tác CRUD hoạt động đúng.
- Search/filter/pagination hoạt động đúng.

---

### 5.3. Kiểm thử upload ảnh bìa và file tài liệu

Đăng nhập bằng tài khoản USER hoặc ADMIN.

Truy cập:

```txt
http://localhost:3000/documents/new
```

Kiểm thử:

1. Tạo tài liệu mới.
2. Upload ảnh bìa.
3. Upload file tài liệu.
4. Submit form.
5. Mở trang chi tiết tài liệu.
6. Kiểm tra ảnh bìa hiển thị.
7. Kiểm tra link file có thể mở được.
8. Vào edit tài liệu.
9. Thay ảnh bìa hoặc file tài liệu mới.
10. Lưu lại và kiểm tra dữ liệu cập nhật.

Kết quả mong đợi:

- Upload ảnh hợp lệ thành công.
- Upload file hợp lệ thành công.
- Ảnh bìa được hiển thị trong chi tiết tài liệu.
- File tài liệu có link mở được.
- File sai định dạng hoặc quá dung lượng bị từ chối.

---

### 5.4. Kiểm thử ADMIN quản lý toàn bộ tài liệu

Đăng nhập bằng:

```txt
admin@edupub.test
Admin@123456
```

Truy cập:

```txt
http://localhost:3000/admin/documents
```

Kiểm thử:

1. Xem danh sách toàn bộ tài liệu trong hệ thống.
2. Kiểm tra có hiển thị thông tin owner của tài liệu.
3. Tìm kiếm tài liệu.
4. Lọc tài liệu theo môn học.
5. Lọc tài liệu theo trạng thái.
6. Lọc tài liệu theo khối/lớp.
7. Xem chi tiết tài liệu của user khác.
8. Cập nhật tài liệu của user khác.
9. Xóa tài liệu của user khác.

Kết quả mong đợi:

- ADMIN thấy toàn bộ tài liệu.
- ADMIN có thể quản lý tài liệu của mọi user.
- Danh sách admin có thông tin owner.
- Search/filter/pagination hoạt động trên toàn hệ thống.

---

### 5.5. Kiểm thử ADMIN quản lý người dùng

Đăng nhập bằng tài khoản ADMIN.

Truy cập:

```txt
http://localhost:3000/admin/users
```

Kiểm thử:

1. Xem danh sách người dùng.
2. Tìm kiếm người dùng theo tên/email.
3. Lọc người dùng theo role USER/ADMIN.
4. Xem chi tiết người dùng.
5. Tạo user mới.
6. Cập nhật thông tin user.
7. Đổi role USER thành ADMIN.
8. Đổi role ADMIN thành USER.
9. Xóa user khác.
10. Thử tự xóa chính tài khoản admin đang đăng nhập.
11. Thử tự đổi role của chính tài khoản admin đang đăng nhập.

Kết quả mong đợi:

- ADMIN quản lý được user.
- ADMIN đổi role được cho user khác.
- ADMIN không tự xóa được chính mình.
- ADMIN không tự đổi role của chính mình.
- Không có dữ liệu password hash hiển thị trên UI.

---

### 5.6. Kiểm thử Admin Dashboard và thống kê cơ bản

Đăng nhập bằng tài khoản ADMIN.

Truy cập:

```txt
http://localhost:3000/admin
```

Kiểm thử:

1. Xem tổng số users.
2. Xem tổng số documents.
3. Xem số lượng tài liệu theo trạng thái.
4. Xem số lượng tài liệu theo môn học.
5. Xem số lượng tài liệu theo khối/lớp.
6. Xem thống kê user theo role.
7. Xem danh sách tài liệu mới nhất.
8. Xem danh sách người dùng mới nhất.
9. Kiểm tra biểu đồ thống kê.
10. Bấm link chuyển sang quản lý documents/users.

Kết quả mong đợi:

- Dashboard chỉ ADMIN truy cập được.
- Số liệu thống kê hiển thị đúng.
- Biểu đồ hiển thị dữ liệu trực quan.
- Recent documents và recent users hiển thị đúng.

---

### 5.7. Kiểm thử phân quyền route

Kiểm thử với tài khoản USER:

```txt
user@edupub.test
User@123456
```

Thử truy cập trực tiếp:

```txt
http://localhost:3000/admin
http://localhost:3000/admin/documents
http://localhost:3000/admin/users
```

Kết quả mong đợi:

- USER bị redirect hoặc bị chặn khỏi khu vực admin.

Kiểm thử khi chưa đăng nhập:

1. Đăng xuất.
2. Truy cập trực tiếp `/documents`.
3. Truy cập trực tiếp `/admin`.

Kết quả mong đợi:

- Người chưa đăng nhập bị chuyển về trang login.

---

## 6. Cấu trúc dự án

```txt
edupub-manager/
├── backend/
│   ├── prisma/             # Schema, migrations và database seed
│   ├── src/                # Mã nguồn NestJS API
│   │   ├── modules/        # Các module chính (admin, auth, documents, uploads, users)
│   │   ├── prisma/         # Prisma service kết nối database
│   │   └── main.ts         # Điểm khởi đầu của backend API
│   ├── test/               # E2E tests
│   ├── Dockerfile          # Dockerfile cho backend
│   └── README.md
├── frontend/
│   ├── app/                # Giao diện Next.js App Router
│   │   ├── admin/          # Admin Dashboard & quản lý người dùng/tài liệu
│   │   ├── context/        # React context (AuthContext)
│   │   ├── documents/      # Giao diện quản lý tài liệu cá nhân của user
│   │   ├── login/          # Giao diện đăng nhập
│   │   └── register/       # Giao diện đăng ký
│   ├── components/         # Các Reusable UI Components (SideNav, StatusBadge,...)
│   ├── lib/                # API client, HTTP config và helper functions
│   ├── public/             # Static assets (fonts, images)
│   ├── e2e/                # Playwright E2E tests
│   ├── Dockerfile          # Dockerfile cho frontend
│   └── README.md
├── docs/
│   └── API_DOCUMENTATION.md # Tài liệu API chi tiết
├── docker-compose.yml       # Khởi chạy frontend, backend và PostgreSQL qua Docker
├── AGENTS.md                # Hướng dẫn phát triển dành cho AI Agents
├── DESIGN.md                # Thiết kế hệ thống và UI/UX
└── README.md
```

### backend/

Chứa NestJS API, Prisma schema, authentication, authorization, document APIs, admin APIs và upload APIs.

### frontend/

Chứa Next.js application, giao diện người dùng, admin dashboard, document management UI và user management UI.

### docs/

Chứa tài liệu API chi tiết.

### docker-compose.yml

Dùng để chạy toàn bộ hệ thống gồm frontend, backend và PostgreSQL.

---

## 7. API chính

Một số nhóm API chính:

### Auth

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Users

```txt
GET   /users/me
PATCH /users/me
```

### Documents

```txt
GET    /documents
POST   /documents
GET    /documents/:id
PATCH  /documents/:id
DELETE /documents/:id
```

### Admin Users

```txt
GET    /admin/users
GET    /admin/users/:id
POST   /admin/users
PATCH  /admin/users/:id
PATCH  /admin/users/:id/role
DELETE /admin/users/:id
```

### Admin Dashboard

```txt
GET /admin/stats
```

### Uploads

```txt
POST /uploads/image
POST /uploads/file
```

Chi tiết API nằm trong:

```txt
docs/API_DOCUMENTATION.md
```

---

## 8. Kiểm tra chất lượng code

### Backend

Chạy trong thư mục `backend/`:

```bash
npm run lint
npm run format
npm run test
npm run test:e2e
```

### Frontend

Chạy trong thư mục `frontend/`:

```bash
npm run lint
```

Nếu muốn chạy Playwright E2E:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
```

---

## 9. Ghi chú về upload file

Upload file hiện được lưu bằng local storage trong backend.

Khi chạy bằng Docker, file upload được lưu trong Docker volume để tránh mất dữ liệu khi container restart.

Các endpoint upload yêu cầu đăng nhập:

```txt
POST /uploads/image
POST /uploads/file
```

Giới hạn upload hiện tại:

- Image: tối đa 20MB
- Document file: tối đa 20MB

Image MIME types hỗ trợ:

```txt
image/jpeg
image/png
image/webp
image/gif
```

Document MIME types hỗ trợ:

```txt
application/pdf
application/msword
application/vnd.openxmlformats-officedocument.wordprocessingml.document
application/vnd.ms-excel
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
application/vnd.ms-powerpoint
application/vnd.openxmlformats-officedocument.presentationml.presentation
text/plain
```

---

## 10. Ghi chú khi review

Cách kiểm thử nhanh nhất:

1. Chạy hệ thống bằng Docker Compose.
2. Đăng nhập bằng tài khoản ADMIN.
3. Kiểm tra dashboard tại `/admin`.
4. Kiểm tra quản lý tài liệu tại `/admin/documents`.
5. Kiểm tra quản lý người dùng tại `/admin/users`.
6. Đăng xuất.
7. Đăng nhập bằng tài khoản USER.
8. Kiểm tra document ownership tại `/documents`.
9. Tạo tài liệu mới có upload ảnh/file.
10. Kiểm tra USER không truy cập được khu vực admin.

---

## 11. Công nghệ sử dụng

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- Playwright

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Multer

### DevOps

- Docker
- Docker Compose
