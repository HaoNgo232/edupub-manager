# NestJS API Documentation

This document describes the API endpoints, authentication mechanisms, guards, and validation rules for the backend application.

## Authentication Overview

The backend uses JSON Web Token (JWT) authentication to secure endpoints. 

### Authorization Header Format
Secure endpoints require the token to be sent in the `Authorization` header using the `Bearer` scheme:
```http
Authorization: Bearer <your_jwt_access_token>
```

### JWT Payload Schema
The payload encoded inside the access token contains:
* `sub` (string): The unique user identifier (UUID).
* `email` (string): The user's registered email address.
* `role` (string): The user's authorization role, which can be `USER` or `ADMIN`.

Example decrypted payload:
```json
{
  "sub": "0f4d4506-807c-41ac-9cfd-06e85927e629",
  "email": "test_1779767091239@example.com",
  "role": "USER",
  "iat": 1779767091,
  "exp": 1779853491
}
```

---

## Guards and Decorators

The application implements NestJS guards and custom decorators to enforce route security, user retrieval, and request body validation.

### 1. JwtAuthGuard
* **Decorator**: `@UseGuards(JwtAuthGuard)`
* **Behavior**: Validates that the incoming request contains a valid JWT in the `Authorization` header.
  * If the header is missing or malformed, it rejects the request with an HTTP `401 Unauthorized` status and the message: `"Authorization token is missing"`.
  * If the token has expired, is invalid, or contains an incorrect signature, it rejects the request with an HTTP `401 Unauthorized` status and the message: `"Invalid or expired authorization token"`.
  * If the token is valid, it decodes the payload and attaches it to the request context (`request.user = payload`).

### 2. RolesGuard and @Roles(...) Decorator
* **Decorator**: `@UseGuards(RolesGuard)` combined with `@Roles(Role.USER, Role.ADMIN)`
* **Behavior**: Protects routes by enforcing Role-Based Access Control (RBAC). It reads the metadata key `'roles'` injected by `@Roles(...)` and compares it to the user's role extracted from the JWT payload.
  * If the user object or the user's role is not found in the request, it throws `403 Forbidden` with the message: `"Access denied: User role not found"`.
  * If the user's role does not match one of the allowed roles, it throws `403 Forbidden` with the message: `"Access denied: Insufficient permissions"`.

### 3. @CurrentUser() Decorator
* **Behavior**: A custom parameter decorator that extracts the validated `JwtPayload` object (`request.user`) and injects it directly into the controller handler arguments.

### 4. Input Validation & Whitelisting
* **Behavior**: The application has a global `ValidationPipe` configured with:
  ```typescript
  new ValidationPipe({
    whitelist: true,
    transform: true,
  })
  ```
  * `whitelist: true`: Properties that do not have validation decorators in the target DTO class are automatically stripped from the incoming request payload. For example, if a client tries to inject `"role": "ADMIN"` inside a `PATCH /users/me` request, the parameter is silently removed, ensuring that a regular user cannot elevate their privileges.
  * `transform: true`: Automatically converts network-received payloads to their corresponding DTO classes.

---

## API Endpoints Reference

### 1. Register User

* **Method**: `POST`
* **Path**: `/auth/register`
* **Headers**:
  * `Content-Type: application/json`

#### Request Body Schema
The request body must conform to `RegisterDto`:
* `email` (string, required): Must be a valid email address.
* `password` (string, required): Must be a string with a minimum length of 6 characters.
* `fullName` (string, required): Must be a string with a length between 2 and 100 characters.

#### Example Request Body
```json
{
  "email": "test_1779767091239@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

#### Success Response
* **Status**: `201 Created`
* **Body Schema**: Contains the sanitized user profile (without `passwordHash`) and the generated JWT `accessToken`.
* **Example Response**:
```json
{
  "user": {
    "id": "0f4d4506-807c-41ac-9cfd-06e85927e629",
    "email": "test_1779767091239@example.com",
    "fullName": "John Doe",
    "role": "USER",
    "avatarUrl": null,
    "createdAt": "2026-05-26T03:44:51.333Z",
    "updatedAt": "2026-05-26T03:44:51.333Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses
* **Status**: `409 Conflict` (Duplicate Email)
  * **Description**: Returned if the email address is already registered.
  * **Example Response**:
  ```json
  {
    "message": "Email already registered",
    "error": "Conflict",
    "statusCode": 409
  }
  ```
* **Status**: `400 Bad Request` (Validation Failures)
  * **Description**: Returned if fields fail validation rules (e.g. invalid email format, short password, missing fields).
  * **Example Response (Invalid Email)**:
  ```json
  {
    "message": [
      "Email must be a valid email address"
    ],
    "error": "Bad Request",
    "statusCode": 400
  }
  ```
  * **Example Response (Missing Fields)**:
  ```json
  {
    "message": [
      "Password is required",
      "Password must be at least 6 characters long",
      "Password must be a string",
      "Full name is required",
      "Full name cannot exceed 100 characters",
      "Full name must be at least 2 characters long",
      "Full name must be a string"
    ],
    "error": "Bad Request",
    "statusCode": 400
  }
  ```

---

### 2. Login User

* **Method**: `POST`
* **Path**: `/auth/login`
* **Headers**:
  * `Content-Type: application/json`

#### Request Body Schema
The request body must conform to `LoginDto`:
* `email` (string, required): Must be a valid email address.
* `password` (string, required): Must be a string and cannot be empty.

#### Example Request Body
```json
{
  "email": "test_1779767091239@example.com",
  "password": "password123"
}
```

#### Success Response
* **Status**: `201 Created`
* **Body Schema**: Contains the sanitized user profile and the generated JWT `accessToken`.
* **Example Response**:
```json
{
  "user": {
    "id": "0f4d4506-807c-41ac-9cfd-06e85927e629",
    "email": "test_1779767091239@example.com",
    "fullName": "John Doe",
    "role": "USER",
    "avatarUrl": null,
    "createdAt": "2026-05-26T03:44:51.333Z",
    "updatedAt": "2026-05-26T03:44:51.333Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses
* **Status**: `401 Unauthorized` (Invalid Credentials)
  * **Description**: Returned if the email does not exist or the password does not match.
  * **Example Response**:
  ```json
  {
    "message": "Invalid email or password",
    "error": "Unauthorized",
    "statusCode": 401
  }
  ```

---

### 3. Get Auth Session (Me)

* **Method**: `GET`
* **Path**: `/auth/me`
* **Headers**:
  * `Authorization: Bearer <token>` (Required)

#### Success Response
* **Status**: `200 OK`
* **Body Schema**: Returns the sanitized user profile associated with the token.
* **Example Response**:
```json
{
  "id": "0f4d4506-807c-41ac-9cfd-06e85927e629",
  "email": "test_1779767091239@example.com",
  "fullName": "John Doe",
  "role": "USER",
  "avatarUrl": null,
  "createdAt": "2026-05-26T03:44:51.333Z",
  "updatedAt": "2026-05-26T03:44:51.333Z"
}
```

#### Error Responses
* **Status**: `401 Unauthorized` (Missing Token)
  * **Example Response**:
  ```json
  {
    "message": "Authorization token is missing",
    "error": "Unauthorized",
    "statusCode": 401
  }
  ```
* **Status**: `401 Unauthorized` (Invalid Token)
  * **Example Response**:
  ```json
  {
    "message": "Invalid or expired authorization token",
    "error": "Unauthorized",
    "statusCode": 401
  }
  ```

---

### 4. Get User Profile

* **Method**: `GET`
* **Path**: `/users/me`
* **Headers**:
  * `Authorization: Bearer <token>` (Required)

#### Success Response
* **Status**: `200 OK`
* **Body Schema**: Returns the sanitized user profile.
* **Example Response**:
```json
{
  "id": "0f4d4506-807c-41ac-9cfd-06e85927e629",
  "email": "test_1779767091239@example.com",
  "fullName": "John Doe",
  "role": "USER",
  "avatarUrl": null,
  "createdAt": "2026-05-26T03:44:51.333Z",
  "updatedAt": "2026-05-26T03:44:51.333Z"
}
```

#### Error Responses
* **Status**: `401 Unauthorized` (Missing/Invalid Token)
  * **Example Response**:
  ```json
  {
    "message": "Authorization token is missing",
    "error": "Unauthorized",
    "statusCode": 401
  }
  ```

---

### 5. Update User Profile

* **Method**: `PATCH`
* **Path**: `/users/me`
* **Headers**:
  * `Authorization: Bearer <token>` (Required)
  * `Content-Type: application/json`

#### Request Body Schema
The request body must conform to `UpdateUserDto`:
* `fullName` (string, optional): Must be between 2 and 100 characters.
* `avatarUrl` (string, optional): Must be a valid URL format.

Note: Extra fields not defined in the schema (e.g. `role`, `email`, `password`) will be silently ignored and stripped due to the `whitelist` setting.

#### Example Request Body
```json
{
  "fullName": "John Updated"
}
```

#### Success Response
* **Status**: `200 OK`
* **Body Schema**: Returns the updated sanitized user profile.
* **Example Response**:
```json
{
  "id": "0f4d4506-807c-41ac-9cfd-06e85927e629",
  "email": "test_1779767091239@example.com",
  "fullName": "John Updated",
  "role": "USER",
  "avatarUrl": null,
  "createdAt": "2026-05-26T03:44:51.333Z",
  "updatedAt": "2026-05-26T03:44:51.474Z"
}
```

#### Example Whitelisting Test
If a request is sent trying to modify read-only properties:
```json
{
  "fullName": "John Updated 2",
  "role": "ADMIN",
  "email": "hacker@example.com"
}
```
The application successfully updates the `fullName` but ignores `role` and `email`:
```json
{
  "id": "0f4d4506-807c-41ac-9cfd-06e85927e629",
  "email": "test_1779767091239@example.com",
  "fullName": "John Updated 2",
  "role": "USER",
  "avatarUrl": null,
  "createdAt": "2026-05-26T03:44:51.333Z",
  "updatedAt": "2026-05-26T03:44:51.480Z"
}
```
