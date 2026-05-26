# EduPub Manager - Monorepo Setup Guide

EduPub Manager is a web application platform for document management. The project is structured as a monorepo consisting of a NestJS backend and a Next.js frontend.

---

## Quick Copy-Paste Start

Copy and run these commands in your terminal to set up and run the project automatically (migrations and database seeding are automatically executed in the container):

```bash
git clone https://github.com/HaoNgo232/edupub-manager.git
cd edupub-manager
docker compose up --build -d
```

Once running, access the services:
- Next.js Frontend: http://localhost:3001
- NestJS API Endpoint: http://localhost:3000
- PostgreSQL Database: localhost:5432

---

## Project Structure

- backend/: NestJS application, database models (Prisma ORM), authentication logic, and API endpoints.
- frontend/: Next.js (React) application, styling with Tailwind CSS, and user interface.
- docker-compose.yml: Docker Compose configuration to orchestrate backend, frontend, and PostgreSQL services.

---

## Running with Docker (Recommended)

The easiest way to run the entire stack (Database, Backend, and Frontend) is using Docker Compose.

### Prerequisites
- Docker installed.
- Docker Compose installed.

### 1. Build and Start the Services
Run the following command at the root of the project:
```bash
docker compose up --build -d
```

This command will:
- Set up a PostgreSQL 16 database.
- Build the NestJS backend and Next.js frontend using multi-stage Dockerfiles.
- Initialize database schemas, run migrations, and automatically seed test accounts inside the backend container.

### 2. Access the Application Services
- Next.js Frontend: http://localhost:3001
- NestJS API Endpoint: http://localhost:3000
- PostgreSQL Database: localhost:5432

---

## Local Development Setup (Manual)

If you prefer to run the applications locally on your machine for development with hot-reloading:

### Prerequisites
- Node.js (v20+ recommended)
- npm installed
- A running PostgreSQL database (You can run "docker compose up postgres -d" to only start the database container).

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy .env.example to .env:
   ```bash
   cp .env.example .env
   ```
   Ensure DATABASE_URL matches your local database credentials (e.g. host, port, username, password, and database name edupub_manager).

4. Sync Schema & Migrate Database:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. Seed Default Accounts:
   ```bash
   npx prisma db seed
   ```

6. Run backend in development mode:
   ```bash
   npm run start:dev
   ```
   The backend will start on http://localhost:3000.

---

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run frontend in development mode:
   ```bash
   npm run dev
   ```
   The frontend will start on http://localhost:3000 (or http://localhost:3001 if port 3000 is occupied by the backend).

---

## Default Test Accounts

The container startup script and seeding script create two default accounts for testing:

| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :---: |
| User | user@edupub.test | User@123456 | USER |
| Administrator | admin@edupub.test | Admin@123456 | ADMIN |

---

## Code Quality & Verification (Backend)

We enforce strict TypeScript configurations and code style linting rules.

- Check Linter Warnings:
  ```bash
  npm run lint
  ```
- Code Style Formatter (Prettier):
  ```bash
  npm run format
  ```
- Unit Tests:
  ```bash
  npm run test
  ```
