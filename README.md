# Academy LMS Platform

A modern Learning Management System built with Next.js, TypeScript, and Prisma. Designed for admins to create courses and agents (students) to learn.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
Create `.env.local` file:
```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

Generate secret:
```bash
openssl rand -base64 32
```

### 3. Set Up Database
```bash
npm run db:generate
npm run db:push
npm run db:seed-admin
```

### 4. Start Development Server
```bash
npm run dev
```

Open: http://localhost:3000

---

## 📋 Default Admin Login

After running `npm run db:seed-admin`:
- **Email**: `admin@example.com`
- **Password**: `admin123`

⚠️ Change password after first login!

---

## 🎯 Key Features

### For Admins
- ✅ Dashboard for course management
- ✅ Create and edit courses
- ✅ Add lessons with videos (S3Bubble, YouTube, Vimeo)
- ✅ Create quizzes and assignments
- ✅ Organize by categories and countries
- ✅ Publish/draft courses

### For Agents (Students)
- ✅ Browse courses
- ✅ Watch videos
- ✅ Take quizzes
- ✅ Submit assignments
- ✅ Track progress

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js

---

## 📁 Project Structure

```
academy/
├── app/              # Next.js pages and API routes
│   ├── dashboard/   # Admin dashboard
│   ├── courses/     # Public course pages
│   ├── login/       # Login page
│   └── api/         # API endpoints
├── components/      # React components
├── lib/             # Utilities (Prisma, auth)
├── prisma/          # Database schema and migrations
└── public/          # Static assets
```

---

## 🗄️ Database Commands

```bash
npm run db:generate    # Generate Prisma Client
npm run db:push        # Push schema to database
npm run db:studio      # Open database browser (http://localhost:5555)
npm run db:seed        # Seed sample data
npm run db:seed-admin  # Create admin user
```

---

## 🎥 Video Support

Supports multiple video sources:
- **S3Bubble**: Use embed URL from S3Bubble
- **YouTube**: Paste YouTube URL (auto-converts)
- **Vimeo**: Paste Vimeo URL (auto-converts)

**For testing locally, use YouTube URLs:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

---

## 🔐 Authentication

### Admin Login
- Access dashboard at `/dashboard`
- Create and manage courses
- Admin only - not available to agents

### Agent Login
- Access courses at `/courses`
- Currently uses database (API integration ready)
- Future: Will connect to external API

---

## 📝 Common Tasks

### Create a Course
1. Login as admin
2. Go to Dashboard → Create New Course
3. Fill in details
4. Add lessons with videos
5. Publish when ready

### Add a Lesson
1. Edit course
2. Click "+ Add Lesson"
3. Add title, video URL, content
4. Save

### View Database
```bash
npm run db:studio
```
Opens at: http://localhost:5555

---

## 🐛 Troubleshooting

### Database Locked
Stop dev server, then run `npm run db:push`

### Port 3000 in Use
```bash
npm run dev -- -p 3001
```

### Authentication Error
Check `.env.local` has `NEXTAUTH_SECRET` set

### Video 403 Error
Use YouTube URLs for testing, or configure S3Bubble embedding

---

## 🚀 Production Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed deployment instructions.

**Quick Steps:**
1. Push code to GitHub
2. Connect to Vercel
3. Configure environment variables
4. Deploy!

**For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## 📊 Scalability

- ✅ Handles thousands of courses
- ✅ Pagination for large lists
- ✅ Database indexes for performance
- ✅ Ready for PostgreSQL migration

---

## 🔗 Important URLs

- **Home**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard (admin only)
- **Courses**: http://localhost:3000/courses
- **Database**: http://localhost:5555 (Prisma Studio)

---

## 📞 Support

For issues:
1. Check troubleshooting section
2. Review error messages
3. Check database with Prisma Studio
4. Verify environment variables

---

**Built with Next.js 14, TypeScript, and Prisma** 🚀
