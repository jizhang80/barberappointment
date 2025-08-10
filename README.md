# Barber Appointment SaaS Platform

A modern, full-stack SaaS platform that enables barber shops to manage online appointments with their customers through web and mobile applications.

## 🚀 Features

- **Multi-tenant Architecture**: Support for multiple barber shops
- **JWT Authentication**: Secure user authentication with access and refresh tokens
- **Real-time Scheduling**: Live appointment booking with confirmation workflow
- **Role-based Access**: Different interfaces for customers, barbers, and admins
- **Responsive Design**: Mobile-first design approach
- **Email Notifications**: Automated email notifications for appointments
- **Modern Tech Stack**: Next.js 14+, Express.js, PostgreSQL, Redis, Prisma

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v20 LTS or higher)
- PostgreSQL (v15 or higher)
- Redis (v7 or higher)
- Docker and Docker Compose (optional but recommended)

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js v20 LTS
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (access + refresh tokens)
- **Caching**: Redis
- **Email**: Nodemailer with SendGrid/AWS SES
- **Real-time**: Socket.io
- **Validation**: Joi
- **Logging**: Winston

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors

## 🚀 Quick Start

### Method 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibe
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**
   ```bash
   docker exec -it barber_backend npx prisma migrate dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database UI (Prisma Studio): Run `npm run db:studio`

### Method 2: Local Development

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd vibe
   npm run setup
   ```

2. **Set up environment variables**
   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   # Frontend environment
   cp frontend/.env.local.example frontend/.env.local
   ```

3. **Start PostgreSQL and Redis** (if not using Docker)
   ```bash
   # Using Docker for databases only
   docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15-alpine
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   ```

4. **Generate Prisma client and run migrations**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/health

## 📁 Project Structure

```
vibe/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # Database, Redis, environment config
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic services
│   │   ├── middlewares/    # Express middlewares
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── app.ts          # Express application
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── logs/               # Application logs
│   └── package.json
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js app directory
│   │   ├── components/     # React components
│   │   ├── lib/            # Utility libraries
│   │   ├── stores/         # Zustand stores
│   │   └── types/          # TypeScript types
│   └── package.json
├── docker-compose.yml      # Docker services
└── package.json           # Root package.json with scripts
```

## 🗄️ Database Schema

The application uses the following main entities:
- **Users**: Customers, barbers, and admins
- **Shops**: Barber shop information and settings  
- **Services**: Services offered by each shop
- **Schedules**: Shop operating hours by day of week
- **Appointments**: Booking records with status tracking
- **Notifications**: In-app notifications for users

## 🔐 Authentication Flow

1. User registers/logs in and receives JWT access + refresh tokens
2. Access token (15min expiry) is used for API requests
3. Refresh token (7 days expiry) is used to obtain new access tokens
4. Tokens are stored in localStorage and managed by Zustand store
5. Axios interceptors handle automatic token refresh

## 🛡️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Future Endpoints (To be implemented)
- Shop Management (`/api/shops`)
- Service Management (`/api/shops/:shopId/services`)
- Appointment Management (`/api/appointments`)
- Availability (`/api/shops/:shopId/availability`)

## 🧪 Development Commands

```bash
# Root level commands
npm run dev              # Start both frontend and backend
npm run build           # Build both applications
npm run start           # Start both applications in production
npm run setup           # Install all dependencies

# Backend specific
npm run backend:dev     # Start backend in development
npm run backend:build   # Build backend
npm run backend:start   # Start backend in production

# Frontend specific  
npm run frontend:dev    # Start frontend in development
npm run frontend:build  # Build frontend
npm run frontend:start  # Start frontend in production

# Database commands
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio

# Docker commands
npm run docker:up       # Start all services with Docker
npm run docker:down     # Stop all Docker services
npm run docker:build    # Build Docker images
```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/barber_app
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000
PORT=3001
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 Deployment

The application is designed to be deployed using Docker containers. You can deploy to:
- Railway
- Render
- AWS ECS
- Google Cloud Run
- Any Docker-compatible platform

## 🧩 Next Steps

The current implementation provides a solid foundation with:
✅ Complete authentication system
✅ Database schema and migrations
✅ Basic frontend structure
✅ Docker development setup

**Coming next:**
- Shop management (create, edit, manage shops)
- Service management (add/edit services and pricing)
- Schedule management (set operating hours)
- Appointment booking system
- Real-time notifications
- Email integration
- Advanced dashboard features
- Mobile responsive improvements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :3001
   # Kill the process
   kill -9 <PID>
   ```

2. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in backend/.env
   - Run `npm run db:migrate` to apply migrations

3. **Redis connection errors**
   - Ensure Redis is running
   - Check REDIS_URL in backend/.env

4. **Frontend build errors**
   - Clear Next.js cache: `rm -rf frontend/.next`
   - Reinstall dependencies: `cd frontend && rm -rf node_modules && npm install`

5. **Prisma issues**
   ```bash
   # Reset database (development only)
   cd backend
   npx prisma migrate reset
   npx prisma generate
   ```

For more help, please check the [Issues](https://github.com/your-repo/issues) section or create a new issue.
