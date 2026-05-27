# EduPub Manager API Documentation

This document is the frontend integration contract for Feature 01: Authentication & Role Foundation.

Base URL depends on runtime config. Local backend from `backend/.env.example` uses:

```txt
http://localhost:3001
```

All request and response bodies are JSON.

## Common Types

```ts
export type Role = 'USER' | 'ADMIN';

export type UserResponse = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type AuthResponse = {
  user: UserResponse;
  accessToken: string;
};

export type JwtPayload = {
  sub: string; // user id
  email: string;
  role: Role;
  iat: number;
  exp: number;
};

export type ValidationErrorResponse = {
  message: string[];
  error: 'Bad Request';
  statusCode: 400;
};

export type ConflictErrorResponse = {
  message: string;
  error: 'Conflict';
  statusCode: 409;
};

export type LoginUnauthorizedResponse = {
  message: 'Invalid email or password';
  error: 'Unauthorized';
  statusCode: 401;
};

export type AuthUnauthorizedResponse = {
  message: 'Unauthorized';
  statusCode: 401;
};
```

The backend never returns `passwordHash`.

## Authentication

Protected endpoints require this header:

```http
Authorization: Bearer <accessToken>
```

JWT payload contains `sub`, `email`, and `role`. The token also includes standard `iat` and `exp` claims.

Example decoded payload:

```json
{
  "sub": "df3566d8-471a-402b-804d-e805edae4b2d",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1779782987,
  "exp": 1779869387
}
```

## Endpoints

### POST /auth/register

Creates a new user account and returns an access token.

Auth: not required.

Request body:

```ts
export type RegisterRequest = {
  email: string; // required, valid email, unique
  password: string; // required, min length 6
  fullName: string; // required, min length 2, max length 100
};
```

Client must not send `role`. If sent, it is ignored. New users are always created with `role: 'USER'`.

Example request:

```json
{
  "email": "user@example.com",
  "password": "User@123456",
  "fullName": "Nguyen Van A"
}
```

Success response: `201 Created`

```ts
export type RegisterResponse = AuthResponse;
```

Example response:

```json
{
  "user": {
    "id": "df3566d8-471a-402b-804d-e805edae4b2d",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "USER",
    "avatarUrl": null,
    "createdAt": "2026-05-26T08:09:47.602Z",
    "updatedAt": "2026-05-26T08:09:47.602Z"
  },
  "accessToken": "jwt-token"
}
```

Validation error response: `400 Bad Request`

```json
{
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters",
    "fullName must be longer than or equal to 2 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

Duplicate email response: `409 Conflict`

```json
{
  "message": "Email already exists",
  "error": "Conflict",
  "statusCode": 409
}
```

### POST /auth/login

Authenticates a user and returns an access token.

Auth: not required.

Request body:

```ts
export type LoginRequest = {
  email: string; // required, valid email
  password: string; // required
};
```

Example request:

```json
{
  "email": "user@example.com",
  "password": "User@123456"
}
```

Success response: `200 OK`

```ts
export type LoginResponse = AuthResponse;
```

Example response:

```json
{
  "user": {
    "id": "df3566d8-471a-402b-804d-e805edae4b2d",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "USER",
    "avatarUrl": null,
    "createdAt": "2026-05-26T08:09:47.602Z",
    "updatedAt": "2026-05-26T08:09:47.602Z"
  },
  "accessToken": "jwt-token"
}
```

Invalid credentials response: `401 Unauthorized`

The backend intentionally does not reveal whether email or password was wrong.

```json
{
  "message": "Invalid email or password",
  "error": "Unauthorized",
  "statusCode": 401
}
```

Validation error response: `400 Bad Request`

```json
{
  "message": [
    "email must be an email"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### GET /auth/me

Returns the current authenticated user for auth bootstrap.

Auth: required.

Request body: none.

Success response: `200 OK`

```ts
export type AuthMeResponse = UserResponse;
```

Example response:

```json
{
  "id": "df3566d8-471a-402b-804d-e805edae4b2d",
  "email": "user@example.com",
  "fullName": "Nguyen Van A",
  "role": "USER",
  "avatarUrl": null,
  "createdAt": "2026-05-26T08:09:47.602Z",
  "updatedAt": "2026-05-26T08:09:47.602Z"
}
```

Missing, malformed, invalid, or expired token response: `401 Unauthorized`

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### GET /users/me

Returns the current user's profile in the users/profile domain.

Auth: required.

Request body: none.

Success response: `200 OK`

```ts
export type GetMyProfileResponse = UserResponse;
```

Example response:

```json
{
  "id": "df3566d8-471a-402b-804d-e805edae4b2d",
  "email": "user@example.com",
  "fullName": "Nguyen Van A",
  "role": "USER",
  "avatarUrl": null,
  "createdAt": "2026-05-26T08:09:47.602Z",
  "updatedAt": "2026-05-26T08:09:47.602Z"
}
```

Missing, malformed, invalid, or expired token response: `401 Unauthorized`

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### PATCH /users/me

Updates the current user's profile.

Auth: required.

Request body:

```ts
export type UpdateMyProfileRequest = {
  fullName?: string; // optional, min length 2, max length 100
  avatarUrl?: string; // optional, valid URL
};
```

The backend strips unsupported fields from the request body. Frontend must treat these fields as read-only:

```ts
type ReadonlyProfileFields = 'id' | 'email' | 'passwordHash' | 'role' | 'createdAt' | 'updatedAt';
```

Example request:

```json
{
  "fullName": "Nguyen Gia Hao",
  "avatarUrl": "https://example.com/avatar.png"
}
```

Success response: `200 OK`

```ts
export type UpdateMyProfileResponse = UserResponse;
```

Example response:

```json
{
  "id": "df3566d8-471a-402b-804d-e805edae4b2d",
  "email": "user@example.com",
  "fullName": "Nguyen Gia Hao",
  "role": "USER",
  "avatarUrl": "https://example.com/avatar.png",
  "createdAt": "2026-05-26T08:09:47.602Z",
  "updatedAt": "2026-05-26T08:09:47.749Z"
}
```

Example request with ignored read-only fields:

```json
{
  "fullName": "Nguyen Gia Hao",
  "avatarUrl": "https://example.com/avatar.png",
  "role": "ADMIN",
  "email": "hacked@example.com",
  "passwordHash": "plain-text"
}
```

Response keeps `email` and `role` unchanged:

```json
{
  "id": "df3566d8-471a-402b-804d-e805edae4b2d",
  "email": "user@example.com",
  "fullName": "Nguyen Gia Hao",
  "role": "USER",
  "avatarUrl": "https://example.com/avatar.png",
  "createdAt": "2026-05-26T08:09:47.602Z",
  "updatedAt": "2026-05-26T08:09:47.749Z"
}
```

Validation error response: `400 Bad Request`

```json
{
  "message": [
    "fullName must be longer than or equal to 2 characters",
    "avatarUrl must be a URL address"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

Missing, malformed, invalid, or expired token response: `401 Unauthorized`

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

## Frontend Handling Notes

- Store `accessToken` after successful register/login.
- Send `Authorization: Bearer <accessToken>` for `/auth/me`, `/users/me`, and `PATCH /users/me`.
- Use `/auth/me` for auth bootstrap and `/users/me` for profile screens.
- Treat `email`, `role`, `createdAt`, and `updatedAt` as read-only in the profile UI.
- For login failures, show one generic message because the backend always returns `"Invalid email or password"`.
- For validation errors, render the `message: string[]` array.
- For auth `401`, clear local auth state and route the user to login.

## Seed Accounts

Admin:

```txt
email: admin@edupub.test
password: Admin@123456
role: ADMIN
```

User:

```txt
email: user@edupub.test
password: User@123456
role: USER
```

## Feature 02: Document CRUD & Ownership Rules

### Common Types

```ts
export type DocumentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type Subject =
  | 'MATH'
  | 'LITERATURE'
  | 'ENGLISH'
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'BIOLOGY'
  | 'HISTORY'
  | 'GEOGRAPHY'
  | 'OTHER';

export type DocumentOwner = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl: string | null;
};

export type DocumentResponse = {
  id: string;
  title: string;
  description: string | null;
  subject: Subject;
  gradeLevel: number;
  status: DocumentStatus;
  coverImageUrl: string | null;
  fileUrl: string | null;
  ownerId: string;
  owner: DocumentOwner;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type DocumentListResponse = {
  items: DocumentResponse[];
  meta: PaginationMeta;
};
```

---

## Document Endpoints

All endpoints require authentication:
```http
Authorization: Bearer <accessToken>
```

### POST /documents
Creates a new document.
- **Permissions**: Both `USER` and `ADMIN` can create.
- **Rule**: The `ownerId` is always set from the JWT payload `sub`. If a client sends `ownerId` in the body, it is completely ignored.

#### Request Body
```ts
export type CreateDocumentRequest = {
  title: string; // required, string, min length 3, max length 200
  description?: string; // optional, string, max length 2000
  subject: Subject; // required, must match Subject enum
  gradeLevel: number; // required, integer, min 1, max 12
  status?: DocumentStatus; // optional, default: 'DRAFT'
  coverImageUrl?: string; // optional, valid URL format
  fileUrl?: string; // optional, valid URL format
};
```

Example request:
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

#### Responses

- **201 Created**: Returns the newly created document.
```json
{
  "id": "e2a39281-a75d-40de-b003-ef37ad927e1f",
  "title": "Sách Toán lớp 10",
  "description": "Tài liệu ôn tập chương hàm số",
  "subject": "MATH",
  "gradeLevel": 10,
  "status": "DRAFT",
  "coverImageUrl": "https://example.com/cover.png",
  "fileUrl": "https://example.com/document.pdf",
  "ownerId": "df3566d8-471a-402b-804d-e805edae4b2d",
  "owner": {
    "id": "df3566d8-471a-402b-804d-e805edae4b2d",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "USER",
    "avatarUrl": null
  },
  "createdAt": "2026-05-26T17:15:00.000Z",
  "updatedAt": "2026-05-26T17:15:00.000Z"
}
```

- **400 Bad Request**: Validation errors.
```json
{
  "message": [
    "title must be longer than or equal to 3 characters",
    "gradeLevel must not be greater than 12"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### GET /documents
Lists documents with filters and pagination.
- **Permissions / Ownership Rules**:
  - `USER`: Can only query/see documents where `ownerId === currentUser.id`.
  - `ADMIN`: Can see all documents in the system.

#### Query Parameters
All query parameters are optional:
- `q` (string): Matches search substring inside `title` and `description` (case-insensitive).
- `subject` (Subject): Filters by subject.
- `status` (DocumentStatus): Filters by status.
- `gradeLevel` (number): Filters by exact grade (1 to 12).
- `page` (number): Page number (default: `1`, min: `1`).
- `limit` (number): Items per page (default: `10`, min: `1`, max: `100`).
- `sortBy` (string): Field to sort (`createdAt` | `updatedAt` | `title` | `gradeLevel`). Default: `createdAt`.
- `sortOrder` (string): Direction (`asc` | `desc`). Default: `desc`.

#### Responses

- **200 OK**: Returns a paginated list of items.
```json
{
  "items": [
    {
      "id": "e2a39281-a75d-40de-b003-ef37ad927e1f",
      "title": "Sách Toán lớp 10",
      "description": "Tài liệu ôn tập chương hàm số",
      "subject": "MATH",
      "gradeLevel": 10,
      "status": "PUBLISHED",
      "coverImageUrl": "https://example.com/cover.png",
      "fileUrl": "https://example.com/document.pdf",
      "ownerId": "df3566d8-471a-402b-804d-e805edae4b2d",
      "owner": {
        "id": "df3566d8-471a-402b-804d-e805edae4b2d",
        "email": "user@example.com",
        "fullName": "Nguyen Van A",
        "role": "USER",
        "avatarUrl": null
      },
      "createdAt": "2026-05-26T17:15:00.000Z",
      "updatedAt": "2026-05-26T17:15:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### GET /documents/:id
Gets document details by ID.
- **Permissions / Ownership Rules**:
  - `USER`: Can only retrieve their own document. Attempting to retrieve another user's document or a non-existent document will return a `404 Not Found` to prevent data leaking.
  - `ADMIN`: Can retrieve any document.

#### Responses

- **200 OK**: Returns the `DocumentResponse`.
- **404 Not Found**: Document doesn't exist or doesn't belong to the current user (if requested by a `USER`).
```json
{
  "message": "Document not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

### PATCH /documents/:id
Updates document details by ID.
- **Permissions / Ownership Rules**:
  - `USER`: Can only edit their own document. Attempting to edit another user's document will return a `404 Not Found`.
  - `ADMIN`: Can edit any document in the system.

#### Request Body
All fields are optional:
```ts
export type UpdateDocumentRequest = {
  title?: string;
  description?: string;
  subject?: Subject;
  gradeLevel?: number;
  status?: DocumentStatus;
  coverImageUrl?: string;
  fileUrl?: string;
};
```
Note: Fields like `id`, `ownerId`, `owner`, `createdAt`, and `updatedAt` are read-only and stripped/ignored if sent.

#### Responses

- **200 OK**: Returns the updated document.
- **404 Not Found**: Document doesn't exist or is not owned by the current user (if requested by a `USER`).
- **400 Bad Request**: Validation errors.

---

### DELETE /documents/:id
Deletes a document by ID.
- **Permissions / Ownership Rules**:
  - `USER`: Can only delete their own document. Attempting to delete another user's document will return a `404 Not Found`.
  - `ADMIN`: Can delete any document.

#### Responses

- **200 OK**: Deletion successful.
```json
{
  "message": "Document deleted successfully"
}
```
- **404 Not Found**: Document doesn't exist or is not owned by the current user (if requested by a `USER`).

---

## Feature 05: Backend Uploads

Upload endpoints let authenticated users upload local assets before creating or updating document metadata.

All upload endpoints require:
```http
Authorization: Bearer <accessToken>
```

Requests must use `multipart/form-data` with exactly one file field named `file`.

### Upload Limits

- Maximum image upload size: `20MB`.
- Maximum document file upload size: `20MB`.
- Missing, malformed, invalid, or expired JWT returns `401 Unauthorized`.
- Missing file, unsupported MIME type, image size over `20MB`, or document file size over `20MB` returns `400 Bad Request`.
- The backend returns a public URL string that can be saved into `coverImageUrl` or `fileUrl` on `/documents`.

### POST /uploads/image

Uploads a cover image.

Auth: required.

Multipart field:

```txt
file: binary
```

Allowed MIME types:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

Success response: `201 Created`

```ts
export type UploadImageResponse = {
  url: string;
  path: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
};
```

Example response:

```json
{
  "url": "http://localhost:3001/uploads/images/1779859200000-a8f2c3d4-cover.png",
  "path": "/uploads/images/1779859200000-a8f2c3d4-cover.png",
  "filename": "1779859200000-a8f2c3d4-cover.png",
  "originalName": "cover.png",
  "mimeType": "image/png",
  "size": 123456
}
```

Curl example:

```bash
curl -X POST "http://localhost:3001/uploads/image" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@./cover.png;type=image/png"
```

### POST /uploads/file

Uploads a document attachment.

Auth: required.

Multipart field:

```txt
file: binary
```

Allowed MIME types:

- `application/pdf`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.ms-excel`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `application/vnd.ms-powerpoint`
- `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- `text/plain`

Success response: `201 Created`

```ts
export type UploadFileResponse = {
  url: string;
  path: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
};
```

Example response:

```json
{
  "url": "http://localhost:3001/uploads/files/1779859200000-a8f2c3d4-document.pdf",
  "path": "/uploads/files/1779859200000-a8f2c3d4-document.pdf",
  "filename": "1779859200000-a8f2c3d4-document.pdf",
  "originalName": "document.pdf",
  "mimeType": "application/pdf",
  "size": 1048576
}
```

Curl example:

```bash
curl -X POST "http://localhost:3001/uploads/file" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@./document.pdf;type=application/pdf"
```

### Document Flow With Uploaded URLs

1. Login or register to get `accessToken`.
2. Upload a cover image with `POST /uploads/image`; keep the returned `url`.
3. Upload the main document with `POST /uploads/file`; keep the returned `url`.
4. Create or update a document and pass those URLs as `coverImageUrl` and `fileUrl`.

Example create request after uploads:

```bash
curl -X POST "http://localhost:3001/documents" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sách Toán lớp 10",
    "description": "Tài liệu ôn tập chương hàm số",
    "subject": "MATH",
    "gradeLevel": 10,
    "status": "DRAFT",
    "coverImageUrl": "http://localhost:3001/uploads/images/1779859200000-cover.png",
    "fileUrl": "http://localhost:3001/uploads/files/1779859200000-document.pdf"
  }'
```

Example update request:

```bash
curl -X PATCH "http://localhost:3001/documents/$DOCUMENT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coverImageUrl": "http://localhost:3001/uploads/images/1779859200000-cover.png",
    "fileUrl": "http://localhost:3001/uploads/files/1779859200000-document.pdf"
  }'
```

---

## Feature 03: Admin User Management & Role Management

All endpoints require:
```http
Authorization: Bearer <accessToken>
```
And the authenticated user must have `role: 'ADMIN'`. Non-admin users will receive `403 Forbidden` on all routes.

### GET /admin/users
Lists all users in the system with search, filter, sorting, and pagination.

#### Query Parameters
- `q` (string): Searches keyword inside `email` and `fullName` (case-insensitive).
- `role` (Role): Filters by role (`USER` | `ADMIN`).
- `page` (number): Page number (default: `1`, min: `1`).
- `limit` (number): Items per page (default: `10`, min: `1`, max: `100`).
- `sortBy` (string): Field to sort (`createdAt` | `updatedAt` | `email` | `fullName` | `role`). Default: `createdAt`.
- `sortOrder` (string): Direction (`asc` | `desc`). Default: `desc`.

#### Response (200 OK)
```json
{
  "items": [
    {
      "id": "uuid-string",
      "email": "user@edupub.test",
      "fullName": "Test User",
      "role": "USER",
      "avatarUrl": null,
      "documentsCount": 5,
      "createdAt": "2026-05-26T00:00:00.000Z",
      "updatedAt": "2026-05-26T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 20,
    "page": 1,
    "limit": 10,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### GET /admin/users/:id
Retrieves detailed profile of a user, including recent documents and total documents count.

#### Response (200 OK)
```json
{
  "id": "uuid-string",
  "email": "user@edupub.test",
  "fullName": "Test User",
  "role": "USER",
  "avatarUrl": null,
  "documentsCount": 5,
  "recentDocuments": [
    {
      "id": "document-uuid",
      "title": "Sách Toán lớp 10",
      "subject": "MATH",
      "gradeLevel": 10,
      "status": "PUBLISHED",
      "createdAt": "2026-05-26T00:00:00.000Z",
      "updatedAt": "2026-05-26T00:00:00.000Z"
    }
  ],
  "createdAt": "2026-05-26T00:00:00.000Z",
  "updatedAt": "2026-05-26T00:00:00.000Z"
}
```

#### Response (404 Not Found)
Returned if the user does not exist.

---

### POST /admin/users
Creates a new user.

#### Request Body
```json
{
  "email": "newuser@example.com",
  "password": "User@123456",
  "fullName": "New User",
  "role": "USER",
  "avatarUrl": "https://example.com/avatar.png"
}
```

#### Response (201 Created)
```json
{
  "id": "uuid-string",
  "email": "newuser@example.com",
  "fullName": "New User",
  "role": "USER",
  "avatarUrl": "https://example.com/avatar.png",
  "documentsCount": 0,
  "createdAt": "2026-05-26T00:00:00.000Z",
  "updatedAt": "2026-05-26T00:00:00.000Z"
}
```

#### Response (409 Conflict)
Returned if the email already exists.

---

### PATCH /admin/users/:id
Updates a user's details. Only `fullName`, `email`, and `avatarUrl` are allowed.

#### Request Body
```json
{
  "email": "updated@example.com",
  "fullName": "Updated User",
  "avatarUrl": "https://example.com/new-avatar.png"
}
```

#### Response (200 OK)
```json
{
  "id": "uuid-string",
  "email": "updated@example.com",
  "fullName": "Updated User",
  "role": "USER",
  "avatarUrl": "https://example.com/new-avatar.png",
  "documentsCount": 5,
  "createdAt": "2026-05-26T00:00:00.000Z",
  "updatedAt": "2026-05-26T01:00:00.000Z"
}
```

#### Response (409 Conflict)
Returned if the email already exists on another user.

---

### PATCH /admin/users/:id/role
Updates a user's role.

#### Request Body
```json
{
  "role": "ADMIN"
}
```

#### Response (200 OK)
```json
{
  "id": "uuid-string",
  "email": "user@edupub.test",
  "fullName": "Test User",
  "role": "ADMIN",
  "avatarUrl": null,
  "documentsCount": 5,
  "createdAt": "2026-05-26T00:00:00.000Z",
  "updatedAt": "2026-05-26T01:00:00.000Z"
}
```

#### Safety Rules
- Admins cannot change their own role.
- Cannot demote/remove the last admin.

---

### DELETE /admin/users/:id
Deletes a user. Note that related documents will be cascadingly deleted.

#### Response (200 OK)
```json
{
  "message": "User deleted successfully"
}
```

#### Safety Rules
- Admins cannot delete their own account.
- Cannot delete the last admin.

---

### GET /admin/stats
Retrieves basic statistics and data summaries for the admin dashboard.

Auth: required (`ADMIN` role).

#### Query Parameters
- `recentLimit` (number): Optional, number of items to return in `recentDocuments` and `recentUsers` lists. Default: `5` (min: 1, max: 20).

#### Response (200 OK)
```json
{
  "summary": {
    "totalUsers": 12,
    "totalAdmins": 2,
    "totalRegularUsers": 10,
    "totalDocuments": 48,
    "totalDraftDocuments": 10,
    "totalPublishedDocuments": 30,
    "totalArchivedDocuments": 8
  },
  "usersByRole": [
    {
      "role": "ADMIN",
      "count": 2
    },
    {
      "role": "USER",
      "count": 10
    }
  ],
  "documentsByStatus": [
    {
      "status": "DRAFT",
      "count": 10
    },
    {
      "status": "PUBLISHED",
      "count": 30
    },
    {
      "status": "ARCHIVED",
      "count": 8
    }
  ],
  "documentsBySubject": [
    {
      "subject": "MATH",
      "count": 12
    },
    {
      "subject": "ENGLISH",
      "count": 9
    },
    {
      "subject": "LITERATURE",
      "count": 7
    }
  ],
  "documentsByGradeLevel": [
    {
      "gradeLevel": 6,
      "count": 5
    },
    {
      "gradeLevel": 9,
      "count": 8
    },
    {
      "gradeLevel": 10,
      "count": 14
    }
  ],
  "recentDocuments": [
    {
      "id": "document-uuid",
      "title": "Sách Toán lớp 10",
      "subject": "MATH",
      "gradeLevel": 10,
      "status": "PUBLISHED",
      "owner": {
        "id": "user-uuid",
        "email": "user@edupub.test",
        "fullName": "Test User",
        "role": "USER",
        "avatarUrl": null
      },
      "createdAt": "2026-05-26T00:00:00.000Z",
      "updatedAt": "2026-05-26T00:00:00.000Z"
    }
  ],
  "recentUsers": [
    {
      "id": "user-uuid",
      "email": "newuser@example.com",
      "fullName": "New User",
      "role": "USER",
      "avatarUrl": null,
      "documentsCount": 3,
      "createdAt": "2026-05-26T00:00:00.000Z",
      "updatedAt": "2026-05-26T00:00:00.000Z"
    }
  ]
}
```
