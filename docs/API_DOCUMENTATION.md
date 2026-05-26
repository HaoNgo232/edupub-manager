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
