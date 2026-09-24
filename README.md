# AlgoRhythm Club - Website & CMS

A complete production-quality full-stack website and content management system for the AlgoRhythm Club of GVPIHLR.

## 🚀 Features

- **Public Website**: Modern, responsive, dark luxury-tech theme featuring Home, About, Team, Events, and Magazines.
- **Admin Panel (CMS)**: Secure backend dashboard to manage all website content.
- **Authentication**: Role-based access control (Super Admin, Content Admin) using NextAuth.
- **File Uploads**: Local file storage abstraction for images and PDFs.
- **Dynamic Content**: Event registrations via Google Forms, categorized team members, and PDF magazine viewer.

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion, shadcn/ui, Lucide Icons
- **Database ORM**: Prisma
- **Database**: SQLite (Configured for frictionless local development. Easily switchable to PostgreSQL).
- **Auth**: NextAuth.js (Auth.js) with bcrypt password hashing

## 📂 Project Structure

- `/src/app/(public)`: All public-facing routes (Home, Events, Team, etc.)
- `/src/app/admin`: Secure admin dashboard and CRUD forms
- `/src/app/api`: API routes including NextAuth and file upload handler
- `/src/app/actions`: Server Actions for database mutations
- `/src/components`: Reusable UI components (shadcn)
- `/src/lib`: Utilities (prisma client, auth config)
- `/prisma`: Database schema and seed script
- `/public/uploads`: Directory where local files (images, PDFs) are saved

## 💻 Local Development Setup

Follow these steps to run the application entirely locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file (or copy from `.env.example`):
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-super-secret-auth-key-for-development"
```
*(Note: To use PostgreSQL, change the DB URL to a postgres connection string and update `provider = "postgresql"` in `prisma/schema.prisma`)*

### 3. Database Migration
```bash
npx prisma db push
```

### 4. Seed the Database
Populates the database with the admin user and sample data.
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to view the public website.

## 🔐 Admin Login

Navigate to `http://localhost:3000/admin/login`

**Credentials** (created by the seed script):
- **Email**: `admin@algorhythm.com`
- **Password**: `admin123`

## 📦 File Storage

Currently, the application uses local file storage:
- Files are uploaded via `/api/upload`
- Stored physically in `/public/uploads/...`
- **Future Cloud Integration**: To integrate AWS S3, Cloudinary, or Supabase Storage, modify the POST logic inside `src/app/api/upload/route.ts` to push the buffer to your cloud provider and return the cloud URL. The database only stores the returned URL string, meaning no schema changes are required for cloud storage migration.

## 🚀 Deployment Recommendations

When deploying to production (e.g., Vercel, Railway, Render):
1. Change `provider` in `schema.prisma` from `"sqlite"` to `"postgresql"`.
2. Run `npx prisma migrate dev` to generate postgres migrations.
3. Replace the `DATABASE_URL` with your production Postgres URL.
4. Replace `AUTH_SECRET` with a strong cryptographic string.
5. Implement a cloud storage provider (Vercel does not support persistent local storage in `public/` directory).
