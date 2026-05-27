This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Admin Management & Dashboard

This project includes a complete **Admin Dashboard & Basic Statistics** module alongside the **Admin User Management** and **Role Management** modules.

### Admin Routes

- `/admin`: Landing page containing the system-wide overview statistics, document status distribution charts, documents by subject/grade metrics, and lists of recent documents/users.
- `/admin/users`: Users list with search, role filters, sorting, and pagination.
- `/admin/users/new`: Create a new user form.
- `/admin/users/[id]`: User details view displaying user profile, documents count, and a list of their recent documents.
- `/admin/users/[id]/edit`: Edit user information.
- `/admin/documents`: Manage all educational documents in the system.

### Admin Dashboard Features

- **Summary Cards**: Displays Total Users, Total Documents, Published Documents, and Draft Documents.
- **Visualizations (Charts)**:
  - Documents by Status (DRAFT, PUBLISHED, ARCHIVED) doughnut/pie chart.
  - Documents by Subject bar chart.
  - Documents by Grade Level horizontal bar chart.
  - Users by Role summary block.
- **Recent Activity Tables**: Live list of the 5 newest documents and newly registered users.
- **State Control**: Real-time refetching via the Refresh CTA, skeleton loaders, and localized empty/error fallbacks.
- **API Dependency**: `GET /admin/stats`.

### Credentials

- To test admin features, use the default admin credentials seeded in the system:
  - **Email**: `admin@edupub.test`
  - **Password**: `Admin@123456`

### Role Protection

- Route access is restricted to authenticated users with the `ADMIN` role.
- Unauthenticated users trying to access any `/admin*` route will be redirected to `/login`.
- Authenticated users with the `USER` role attempting to access `/admin*` will be redirected to `/documents`.

## Document Uploads

Document Management includes optional upload UI for cover images and document files on the create and edit forms.

- Cover images upload through `POST /uploads/image`.
- Document files upload through `POST /uploads/file`.
- Both upload requests use `multipart/form-data` field `file` and require the backend JWT auth token.
- Successful uploads return a public URL that is saved into `coverImageUrl` or `fileUrl` when the document form is submitted.
- The document create/update request remains JSON-only; binary files are uploaded before submit.

Supported cover image types:

- JPG/JPEG
- PNG
- WEBP
- GIF

Cover image max size: `20MB`.

Supported document file types:

- PDF
- Word: DOC, DOCX
- Excel: XLS, XLSX
- PowerPoint: PPT, PPTX
- TXT

Document file max size: `20MB`.

The backend API must be available at `NEXT_PUBLIC_API_URL` or `http://localhost:3001` by default.

### Testing

We use Playwright for end-to-end (E2E) testing. To run all E2E tests:

```bash
npx playwright test
```

To run specific E2E test suites:

```bash
# Admin Users Management E2E Flow
npx playwright test e2e/admin-users.spec.ts

# Admin Dashboard E2E Flow
npx playwright test e2e/admin-dashboard.spec.ts
```
