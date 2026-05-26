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
