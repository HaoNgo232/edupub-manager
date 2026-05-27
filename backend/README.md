# EduPub Manager API

## Tech stack

- NestJS
- TypeScript
- PostgreSQL
- Prisma
- JWT Authentication
- Role-based authorization
- bcrypt password hashing
- class-validator and class-transformer

## Setup

1. Install dependencies

```bash
npm install
```

2. Copy env

```bash
cp .env.example .env
```

3. Start PostgreSQL

From the repository root:

```bash
docker compose up -d postgres
```

4. Run migration

```bash
npx prisma migrate dev
```

5. Seed database

```bash
npm run seed
```

6. Start dev server

```bash
npm run start:dev
```

The API runs on the port configured by `PORT` in `.env`. The example env uses `http://localhost:3001`.

## Test accounts

Admin:

- email: `admin@edupub.test`
- password: `Admin@123456`

User:

- email: `user@edupub.test`
- password: `User@123456`

## Authentication endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /users/me`
- `PATCH /users/me`

Protected endpoints require an `Authorization: Bearer <accessToken>` header.

## Document endpoints

All endpoints require authentication.

- `POST /documents`: Create a document.
  - Set `ownerId` automatically based on the current user.
- `GET /documents`: Get list of documents.
  - Supporting pagination, filters, and searches.
  - Regular users can only see their own documents. Admins see all.
- `GET /documents/:id`: Get document detail.
  - Access control: Users can only view their own documents (otherwise returns 404). Admins can view any.
- `PATCH /documents/:id`: Update document.
  - Access control: Users can only edit their own documents (otherwise returns 404). Admins can edit any.
- `DELETE /documents/:id`: Delete document.
  - Access control: Users can only delete their own documents (otherwise returns 404). Admins can delete any.

### GET /documents Query Parameters

- `q`: Search keyword in `title` and `description` (case-insensitive).
- `subject`: Filter by subject enum (`MATH`, `LITERATURE`, `ENGLISH`, `PHYSICS`, `CHEMISTRY`, `BIOLOGY`, `HISTORY`, `GEOGRAPHY`, `OTHER`).
- `status`: Filter by status enum (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
- `gradeLevel`: Filter by grade level (integer from 1 to 12).
- `page`: Page number (default: 1, min: 1).
- `limit`: Items count per page (default: 10, min: 1, max: 100).
- `sortBy`: Field to sort by (`createdAt`, `updatedAt`, `title`, `gradeLevel`). Default: `createdAt`.
- `sortOrder`: Sorting direction (`asc` or `desc`). Default: `desc`.

### Example Create Request

`POST /documents`
```json
{
  "title": "Sách Toán lớp 10",
  "description": "Tài liệu ôn tập chương hàm số",
  "subject": "MATH",
  "gradeLevel": 10,
  "status": "DRAFT",
  "coverImageUrl": "https://example.com/cover.png",
  "fileUrl": "https://example.com/document.pdf"
}
```

### Example List Response (200 OK)

`GET /documents?q=toan&subject=MATH&status=PUBLISHED&gradeLevel=10&page=1&limit=10`
```json
{
  "items": [
    {
      "id": "uuid-string",
      "title": "Sách Toán lớp 10",
      "description": "Tài liệu ôn tập chương hàm số",
      "subject": "MATH",
      "gradeLevel": 10,
      "status": "PUBLISHED",
      "coverImageUrl": "https://example.com/cover.png",
      "fileUrl": "https://example.com/document.pdf",
      "ownerId": "user-uuid",
      "owner": {
        "id": "user-uuid",
        "email": "user@edupub.test",
        "fullName": "Regular User",
        "role": "USER",
        "avatarUrl": null
      },
      "createdAt": "2026-05-26T00:00:00.000Z",
      "updatedAt": "2026-05-26T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

## Admin User Management Endpoints (Feature 03)

All endpoints require JWT token and `ADMIN` role.

- `GET /admin/users`: Get list of users.
  - Query parameters:
    - `q`: Search by `email` or `fullName` (case-insensitive).
    - `role`: Filter by role (`USER` | `ADMIN`).
    - `page`: Page number (default: 1, min: 1).
    - `limit`: Items per page (default: 10, min: 1, max: 100).
    - `sortBy`: Field to sort (`createdAt`, `updatedAt`, `email`, `fullName`, `role`). Default: `createdAt`.
    - `sortOrder`: Direction (`asc` | `desc`). Default: `desc`.
- `GET /admin/users/:id`: Get user details, including `documentsCount` and `recentDocuments`.
- `POST /admin/users`: Create a user (hashing password, no `passwordHash` in response).
- `PATCH /admin/users/:id`: Update user details (fullName, email, avatarUrl).
- `DELETE /admin/users/:id`: Delete a user. Includes safety rules to prevent self-deletion or deleting the last admin.

## Admin Dashboard + Basic Statistics Endpoints (Feature 04)

All endpoints require JWT token and `ADMIN` role.

- `GET /admin/stats`: Get overview statistics for the Admin Dashboard.
  - Query parameters:
    - `recentLimit`: optional, limit for recent items (default: 5, min: 1, max: 20).
  - Response fields:
    - `summary`: Object containing `totalUsers`, `totalAdmins`, `totalRegularUsers`, `totalDocuments`, `totalDraftDocuments`, `totalPublishedDocuments`, `totalArchivedDocuments`.
    - `usersByRole`: Breakdown by role, normalized to always contain both `ADMIN` and `USER` entries.
    - `documentsByStatus`: Breakdown by status, normalized to always contain `DRAFT`, `PUBLISHED`, and `ARCHIVED` entries.
    - `documentsBySubject`: Breakdown by subject, only including subjects with documents.
    - `documentsByGradeLevel`: Breakdown by grade level, sorted ascending.
    - `recentDocuments`: Most recent documents (orderBy `createdAt` desc) with sanitized owner basic info.
    - `recentUsers`: Most recent registered users (orderBy `createdAt` desc) with `documentsCount`.



