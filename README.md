# Team Task Manager

A full-stack, premium Team Task Manager application built with Next.js 16, Node.js (Express), and Prisma. It features a responsive Kanban board with drag-and-drop functionality, robust Role-Based Access Control (RBAC) authentication, and admin-only project management controls.

## Features

- **Responsive Kanban Board**: Intuitive drag-and-drop interface for managing tasks across different statuses.
- **Role-Based Access Control (RBAC)**: Secure authentication system distinguishing between Admin and standard User roles.
- **Admin Project Management**: Admins have exclusive controls to create, edit, and delete projects.
- **Premium UI/UX**: Designed with a sleek, glassmorphic UI using Tailwind CSS and dynamic micro-animations.
- **Full-Stack Architecture**: Clean separation of concerns with a Next.js frontend and an Express REST API backend.

## Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) & [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Icons & UI Utilities**: [Lucide React](https://lucide.dev/), Radix UI, clsx, tailwind-merge

### Backend
- **Framework**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM / Database**: [Prisma](https://www.prisma.io/)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs

## Project Structure

The repository is organized into two main workspaces:

- `frontend/` - Contains the Next.js application, React components, and frontend API routes.
- `backend/` - Contains the Node.js Express server, business logic, and Prisma database schema.

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm or yarn or pnpm

### 1. Installation

Clone the repository, then install dependencies for both the frontend and backend:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Variables

Create `.env` files in both the `frontend` and `backend` directories.

**Backend (`backend/.env`)**
```env
DATABASE_URL="your_database_url_here"
JWT_SECRET="your_jwt_secret"
PORT=5000
```

**Frontend (`frontend/.env` or `.env.local`)**
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

### 3. Database Setup

Ensure your database is running and the `DATABASE_URL` is set correctly. Then, initialize the database schema and seed the initial data:

```bash
# From the backend directory (or frontend depending on where the primary schema is located)
npm run db:push
npm run db:seed
```

### 4. Running Locally

You will need to run both the backend server and the frontend development server concurrently.

**Start the Backend Server:**
```bash
cd backend
npm run dev
```

**Start the Frontend Development Server:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Development Commands

Both `frontend` and `backend` directories support the following Prisma commands:
- `npm run db:push`: Pushes the Prisma schema state to the database.
- `npm run db:seed`: Seeds the database with initial data.
- `npm run db:studio`: Opens Prisma Studio to view and edit database records visually.

## License

This project is licensed under the MIT License.
