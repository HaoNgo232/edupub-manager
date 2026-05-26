# Repository Guidelines

## Project Structure & Module Organization

EduPub Manager is a monorepo with a NestJS API and a Next.js frontend. Backend source lives in `backend/src`, organized by modules such as `auth`, `users`, and `prisma`; backend tests are in `backend/src/**/*.spec.ts` and `backend/test`. Prisma schema, migrations, and seed data are in `backend/prisma`. Frontend routes and UI live in `frontend/app`, with global styles in `frontend/app/globals.css`. Root docs include `docker-compose.yml`, `README.md`, and `API_DOCUMENTATION.md`.

## Build, Test, and Development Commands

- `docker compose up --build -d`: run PostgreSQL, backend, and frontend.
- `cd backend && npm run start:dev`: run the NestJS API with watch mode.
- `cd backend && npm run build`: compile the API for production.
- `cd backend && npm run test`: run backend unit tests with Jest.
- `cd backend && npm run test:e2e`: run backend e2e tests.
- `cd frontend && npm run dev`: run the Next.js app locally.
- `cd frontend && npm run build`: build the frontend for production.

## Coding Style & Naming Conventions

Use TypeScript throughout. Follow NestJS conventions in the backend: `*.module.ts`, `*.controller.ts`, `*.service.ts`, DTOs under `dto/`, guards under `guards/`, and decorators under `decorators/`. Frontend code follows the Next.js App Router under `frontend/app`. Both packages use ESLint and Prettier; run `npm run lint` or `npm run format` in the package you change. Do not manually edit generated Prisma output.

## Testing Guidelines

Backend unit tests use Jest and should be named `*.spec.ts` near the code under test. E2e tests belong in `backend/test` and use `*.e2e-spec.ts`. Run `npm run test:cov` before larger backend changes. The frontend currently has no test runner configured; for UI changes, run `npm run lint` and `npm run build`.

## Commit & Pull Request Guidelines

Git history uses short Conventional Commit-style subjects such as `feat: add Docker support and setup instructions for backend and frontend`. Keep commits focused and use prefixes like `feat:`, `fix:`, `docs:`, or `chore:`. Pull requests should describe the change, list verification commands, link issues, and include screenshots for visible frontend changes.

## Security & Configuration Tips

Use `backend/.env.example` as the local backend template and do not commit secrets from `backend/.env`. Prefer Docker Compose for PostgreSQL. When changing Prisma models, commit both `backend/prisma/schema.prisma` and the generated migration.

## Agent-Specific Instructions

Read `frontend/AGENTS.md` before editing Next.js code. This project uses a newer Next.js version, so consult `frontend/node_modules/next/dist/docs/` when APIs are uncertain.
