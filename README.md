# Online Examination System (Next.js + Supabase)

Professional examination system built with Next.js App Router and Supabase.

## Features
- **Admin Dashboard**: Create tests, add questions (Radio, Checkbox, Text), assign tests to students, and monitor results.
- **Student Dashboard**: View assigned tests and attempt exams.
- **Exam Engine**: Real-time timer, auto-submit, progress tracking, and secure submission.
- **Authentication**: Role-based authentication using Supabase Auth.
- **Security**: Row Level Security (RLS) to protect data access.

## Tech Stack
- **Frontend**: Next.js 15+, Tailwind CSS, Lucide Icons.
- **Backend**: Supabase (Auth, PostgreSQL, RLS).

## Setup Instructions

### 1. Supabase Project
- Create a new project on [Supabase](https://supabase.com).
- Go to the **SQL Editor** and paste the contents of `supabase_schema.sql` to set up your database tables, RLS policies, and triggers.

### 2. Environment Variables
- Create a `.env.local` file in the root directory.
- Copy your Supabase URL and Anon Key from the Supabase Project Settings (API tab) and paste them into `.env.local`:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
  ```

### 3. Installation
```bash
npm install
```

### 4. Run the App
```bash
npm run dev
```

## Folder Structure
- `/app`: Next.js App Router pages and layouts.
- `/components`: Reusable UI components.
- `/lib`: Supabase client and server configuration.
- `/types`: TypeScript definitions.
- `/utils`: Helper functions.
