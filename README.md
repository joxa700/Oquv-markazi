# Nur Ta'lim Learning Center

A production-oriented multilingual website and admin panel for a learning center. The public site supports Uzbek, Russian and English content, course discovery, schedules, teacher profiles, testimonials, FAQ, favorites and enrollment/contact forms. The admin panel provides authentication and full CRUD for the site content plus application and message management.

## Stack

- **Frontend:** React 18, Vite 8, React Router 7, Redux Toolkit + redux-persist, i18next, lucide-react, plain CSS design system
- **Backend:** Node.js, Express 4, Prisma 6, SQLite (PostgreSQL-ready schema considerations), Zod 4
- **Auth/security:** bcrypt password hashes, JWT in an httpOnly cookie, protected admin routes, rate limiting, Helmet, CORS allow-list, upload validation
- **Testing:** Vitest + Testing Library, Supertest API tests, Playwright E2E

## Quick start

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env
npx prisma generate --schema server/prisma/schema.prisma
npx prisma migrate deploy --schema server/prisma/schema.prisma
npm run db:seed
npm run dev
```

Open `http://localhost:5173`. The API runs on `http://localhost:4000`.

If `npm install` fails while compiling `bcrypt` on Windows, use `npm install --ignore-scripts` followed by `npm rebuild bcrypt`, then continue with the commands above.

Seeded admin credentials (change in `.env` before seeding for real deployments):

- Email: `admin@nurtalim.uz`
- Password: `NurTalim!2026`

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run API and Vite dev server together |
| `npm run dev:web` | Vite only |
| `npm run dev:server` | Express only (watch mode) |
| `npm run build` | Generate `public/sitemap.xml` and build to `dist/` |
| `npm start` | Serve the production API and built frontend |
| `npm run lint` | ESLint |
| `npm test` | Unit and component tests |
| `npm run test:api` | Reset an isolated SQLite test DB and run API tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run db:seed` | Re-run seed data |
| `npm run db:reset` | Reset the development database |
| `npm run sitemap` | Regenerate the static sitemap |

## Environment

Key variables are documented in `.env.example`.

- `DATABASE_URL` — SQLite file locally. Change the provider and URL in `server/prisma/schema.prisma` for PostgreSQL in production.
- `JWT_SECRET` — at least 32 random characters. Never use the example value in production.
- `PUBLIC_SITE_URL` — canonical URL used for SEO metadata and sitemap output.
- `CLIENT_URL` / `ALLOWED_ORIGINS` — CORS allow-list; comma-separate multiple origins.
- `COOKIE_SAMESITE` — use `lax` for same-site deployments. Use `none` only with HTTPS for cross-site cookies.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credentials created by the seed.
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` — optional new-application notifications.
- `VITE_API_URL` / `VITE_UPLOADS_URL` — only needed when the frontend and API are served from different origins.

## Routes

Public site (language is part of the URL):

- `/:lang` — home
- `/:lang/courses` — searchable/filterable course catalog
- `/:lang/courses/:slug` — course detail, groups and enrollment
- `/:lang/teachers`, `/:lang/schedule`, `/:lang/contact`, `/:lang/faq`
- `/:lang/favorites`, `/:lang/privacy`
- `/` and unknown routes redirect to the persisted language

Admin:

- `/:lang/admin/login`
- `/:lang/admin` — dashboard
- `/:lang/admin/courses`, `teachers`, `groups`, `applications`, `testimonials`, `faq`, `messages`
- `/:lang/admin/applications/:id` — application detail and status workflow

## API overview

Public:

- `GET /api/courses`, `GET /api/courses/:slug`
- `GET /api/teachers`, `GET /api/teachers/:id`
- `GET /api/groups`, `GET /api/testimonials`, `GET /api/faq`, `GET /api/stats`
- `POST /api/applications`, `POST /api/messages`
- `GET /api/health`, `GET /sitemap.xml`

Auth/admin (cookie required):

- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/admin/stats`
- CRUD under `/api/admin/courses`, `/teachers`, `/groups`, `/testimonials`, `/faq`
- Applications: list/detail/status update/delete
- Messages: list/read state/delete
- `POST /api/admin/upload` — validated image upload

Public responses return localized text fields. Admin write payloads use `name_uz`/`name_ru`/`name_en`-style keys, while operational fields remain camelCase.

## Data model

Prisma models: `Course`, `Teacher`, `Group`, `Application`, `Admin`, `Testimonial`, `FaqItem`, `ContactMessage`.

- Courses and teachers have many-to-many relations.
- Groups belong to a course and optionally to a teacher.
- Applications optionally select a group. Seat availability is `capacity - enrolledCount - nonRejectedApplications`.
- Translation fields are stored per language in separate columns.

## Project structure

```
src/                 React application
  admin/             Admin pages, forms and shared admin components
  components/        Public/shared UI components
  features/          Redux slices
  hooks/             Language, theme, toasts, admin resource helpers
  layouts/           Public and admin layouts
  locales/           uz/ru/en JSON dictionaries
  pages/             Public pages
  styles/            base, components, layout, public, admin CSS
  utils/             Formatting, validation and localization helpers
server/              Express app, routes, middleware, Prisma schema/seed
shared/              Language and phone helpers shared by client and server
scripts/             Placeholder asset and sitemap generators
tests/               Unit, component and API tests
e2e/                 Playwright smoke tests
public/              Static assets and generated sitemap
```

## Quality checks

```bash
npm run lint
npm test
npm run test:api
npm run build
```

API tests use a separate `test.db` and reset it before each run. They do not touch the development database.

## Deployment notes

1. Set strong `JWT_SECRET`, production `DATABASE_URL`, `PUBLIC_SITE_URL` and `CLIENT_URL`/`ALLOWED_ORIGINS`.
2. Run `npm ci`, `npx prisma migrate deploy --schema server/prisma/schema.prisma`, then `npm run build`.
3. Start with `NODE_ENV=production npm start`. Express serves `dist/` and the API from the same origin.
4. Put the app behind HTTPS. Use `COOKIE_SAMESITE=none` only when the API and frontend are on different sites.
5. Uploaded files live in `server/uploads`; use persistent storage or object storage for production.
6. For PostgreSQL, change the Prisma datasource provider and create a new migration. Review SQLite-specific assumptions before migrating.
7. Change the seeded admin password and rotate the JWT secret before going live.
