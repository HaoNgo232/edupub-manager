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

- Next.js Frontend: http://localhost:3000
- NestJS API Endpoint: http://localhost:3001
- PostgreSQL Database: localhost:5432

---

## Default Test Accounts

The container startup script and seeding script create two default accounts for testing:

| Account Type  | Email             | Password     | Role  |
| :------------ | :---------------- | :----------- | :---: |
| User          | user@edupub.test  | User@123456  | USER  |
| Administrator | admin@edupub.test | Admin@123456 | ADMIN |

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
- Persist backend uploads in the `backend_uploads` Docker volume mounted at `/app/uploads`.

### 2. Access the Application Services

- Next.js Frontend: http://localhost:3000
- NestJS API Endpoint: http://localhost:3001
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
   The backend will start on http://localhost:3001.

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
   The frontend will start on http://localhost:3000.

---

## Features & User Guide (Feature 02)

EduPub Manager supports educational document creation and strict access control rules (Ownership separation):

- **User Role (USER)**: Can view, create, edit, and delete only their own documents. Any attempt to read or modify other users' documents will be rejected with a `404 Not Found` response.
- **Admin Role (ADMIN)**: Full administrative access. Admins can view, edit, or delete any document in the system.

### Interactive UI Guide

1. **Accessing the Dashboard**:
   - Log in using a test account above. You will be redirected to the Home Profile page (`/`).
   - Click the **My Documents** button (or **Admin Panel** if logged in as an administrator) to open the manuscript workspace.
2. **Managing Your Documents (USER)**:
   - **List View (`/documents`)**: View your list of documents, complete with pagination, a search bar (checks titles & descriptions), and filters by **Subject** or **Status**.
   - **Create (`/documents/new`)**: Click the "New Document" button. Select a status (`Draft`, `Published`, `Archived`) using the custom selection cards, choose the subject and grade, then fill in details.
   - **Details (`/documents/:id`)**: Displays all metadata, cover image preview, download links for attachments, and ownership context.
   - **Edit (`/documents/:id/edit`)**: Modify metadata or update cover/file links.
   - **Delete**: Click "Delete" on the detail page to open the custom confirmation dialog.
3. **System Administration (ADMIN)**:
   - **Admin Console (`/admin/documents`)**: Displays all manuscripts across the entire system. Includes an **Owner column** showing creator avatar and email, along with system-wide manuscript stats cards.

---

## Backend Uploads (Feature 05)

Authenticated users can upload local files before creating or updating document metadata.

- `POST /uploads/image`: upload a cover image with `multipart/form-data`, field name `file`.
- `POST /uploads/file`: upload a document attachment with `multipart/form-data`, field name `file`.
- Both endpoints require `Authorization: Bearer <accessToken>`.
- Maximum image upload size is `2MB`; maximum document file upload size is `10MB`.
- Image MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
- File MIME types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`, `text/plain`.

Typical flow:

1. Login with `POST /auth/login` and keep the returned `accessToken`.
2. Upload the cover image and use the returned URL as `coverImageUrl`.
3. Upload the document file and use the returned URL as `fileUrl`.
4. Send `coverImageUrl` and `fileUrl` in `POST /documents` or `PATCH /documents/:id`.

```bash
curl -X POST "http://localhost:3001/uploads/image" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@./cover.png;type=image/png"

curl -X POST "http://localhost:3001/uploads/file" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@./document.pdf;type=application/pdf"
```

Full API details are documented in `docs/API_DOCUMENTATION.md`.

---

## Code Quality & Verification

### 1. Backend Verification

From the `backend/` directory, you can run:

- **Lint Check**:
  ```bash
  npm run lint
  ```
- **Code Formatter (Prettier):**
  ```bash
  npm run format
  ```
- **Unit Tests**:
  ```bash
  npm run test
  ```
- **E2E Integration Tests**:
  ```bash
  npm run test:e2e
  ```

### 2. Frontend UI Verification (Playwright E2E)

From the `frontend/` directory, ensure both local dev servers are active and execute:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
```

_Note: If running inside Docker, target the frontend mapped port instead (e.g. `http://localhost:3001`)._
