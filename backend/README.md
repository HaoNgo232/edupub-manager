# EduPub Manager API - Feature 01: Authentication & Role Foundation

This is the backend API for the EduPub Manager, built with **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

This initial version establishes the foundational database schemas, authentication (JWT), user profile management, role verification, and database seeding.

---

## 🛠 Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL 16
- **ORM**: Prisma ORM 7
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt (Password hashing), custom Route Guards
- **Validation**: class-validator & class-transformer

---

## ⚙️ Prerequisites & Installation

### 1. Database Setup
Ensure you have a PostgreSQL database running. You can use the provided [docker-compose.yml](../docker-compose.yml) in the project root:
```bash
# Start PostgreSQL via Docker (if not already running)
docker compose up -d
```

### 2. Install Dependencies
Navigate into the `backend/` directory and install the project packages:
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory by copying the template file:
```bash
cp .env.example .env
```
Ensure the `DATABASE_URL` in `.env` is configured correctly for your PostgreSQL instance.

---

## 🚀 Running the App

### 1. Run Database Migrations
Synchronize your database schema with Prisma:
```bash
npx prisma migrate dev --name init
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Seed Database
Populate the database with the default Test Accounts (Admin & User):
```bash
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run start:dev
```
The application will start on the port configured in `.env` (default is `http://localhost:3000`).

---

## 🔑 Test Accounts
The seeding script creates two default accounts for testing:

### 1. Regular User Account
- **Email**: `user@edupub.test`
- **Password**: `User@123456`
- **Role**: `USER`

### 2. Administrator Account
- **Email**: `admin@edupub.test`
- **Password**: `Admin@123456`
- **Role**: `ADMIN`

---

## 📡 API Endpoints

### 🔐 Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required | Body Schema |
| :--- | :--- | :--- | :---: | :--- |
| **POST** | `/auth/register` | Register a new user | No | `{ email, password, fullName }` |
| **POST** | `/auth/login` | Log in to an account | No | `{ email, password }` |
| **GET** | `/auth/me` | Get currently logged-in user profile | **Yes (Bearer Token)** | *None* |

### 👤 User Management (`/users`)

| Method | Endpoint | Description | Auth Required | Body Schema |
| :--- | :--- | :--- | :---: | :--- |
| **GET** | `/users/me` | Retrieve the logged-in user's profile | **Yes (Bearer Token)** | *None* |
| **PATCH** | `/users/me` | Update the logged-in user's profile (whitelisted fields: `fullName`, `avatarUrl`) | **Yes (Bearer Token)** | `{ fullName?, avatarUrl? }` |

---

## 🛡 Security Architecture

### 1. Password Hashing
Passwords are never stored in plain text. We use `bcrypt` with configurable salt rounds to generate cryptographically secure password hashes before persisting.

### 2. Request Validation
Incoming HTTP request bodies are strictly validated using class decorators. Any extra fields (like `role` or `passwordHash`) sent by users during profile update are stripped out automatically before database queries are made.

### 3. Route Access Guards
- **`JwtAuthGuard`**: Restricts endpoints to authenticated users only by verifying the Bearer token in the `Authorization` request header.
- **`RolesGuard`**: Combined with the `@Roles(...Role[])` decorator, it restricts endpoint access based on role permissions (e.g. `ADMIN` or `USER`).
