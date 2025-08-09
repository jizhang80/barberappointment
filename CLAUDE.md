# Barber Appointment SaaS Platform - System Design Document

## 1. Project Overview

### 1.1 Vision
A multi-tenant SaaS platform enabling barber shops to manage online appointments with their customers through web and mobile applications.

### 1.2 Key Features
- Multi-tenant architecture (multiple barber shops)
- User authentication & authorization (JWT-based)
- Real-time appointment scheduling with confirmation workflow
- Email notifications
- Responsive web application (mobile-first design)
- Future mobile app support (React Native ready)

## 2. Technical Stack

### 2.1 Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand or React Context + useReducer
- **Forms**: React Hook Form + Zod validation
- **Calendar**: react-big-calendar or custom implementation
- **HTTP Client**: Axios or native fetch with interceptors
- **Real-time**: Socket.io-client (for live updates)

### 2.2 Backend
- **Runtime**: Node.js (v20 LTS)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (primary choice)
- **Authentication**: JWT (access + refresh tokens)
- **Email Service**: Nodemailer with SendGrid/AWS SES
- **Real-time**: Socket.io
- **Validation**: Zod or Joi
- **API Documentation**: Swagger/OpenAPI

### 2.3 Infrastructure & DevOps
- **Development**: Docker Compose for local development
- **Message Queue**: Redis + Bull (for email jobs and future scaling)
- **Caching**: Redis
- **File Storage**: AWS S3 or Cloudinary (for profile images)
- **Deployment**: Docker + Railway/Render/AWS ECS
- **Monitoring**: Winston for logging, Sentry for error tracking

## 3. Database Design

### 3.1 Why PostgreSQL over MongoDB
- **Strong relationships**: User-Shop-Appointment relationships are inherently relational
- **ACID compliance**: Critical for appointment booking (no double bookings)
- **Complex queries**: Time slot availability calculations benefit from SQL
- **Data consistency**: Important for multi-tenant SaaS

### 3.2 Database Schema

```prisma
// schema.prisma

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  password      String
  firstName     String
  lastName      String
  phone         String?
  role          Role           @default(CUSTOMER)
  emailVerified Boolean        @default(false)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  // Relations
  ownedShop     Shop?          @relation("ShopOwner")
  appointments  Appointment[]
  notifications Notification[]
}

model Shop {
  id          String     @id @default(uuid())
  name        String
  slug        String     @unique
  description String?
  address     String?
  phone       String?
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  // Relations
  ownerId     String     @unique
  owner       User       @relation("ShopOwner", fields: [ownerId], references: [id])
  services    Service[]
  schedules   Schedule[]
  appointments Appointment[]
}

model Service {
  id          String   @id @default(uuid())
  shopId      String
  name        String
  duration    Int      // in minutes
  price       Decimal  @db.Decimal(10, 2)
  description String?
  isActive    Boolean  @default(true)
  
  // Relations
  shop        Shop     @relation(fields: [shopId], references: [id])
  appointments Appointment[]
  
  @@index([shopId])
}

model Schedule {
  id         String   @id @default(uuid())
  shopId     String
  dayOfWeek  Int      // 0-6 (Sunday-Saturday)
  openTime   String   // "10:00"
  closeTime  String   // "20:00"
  isActive   Boolean  @default(true)
  
  // Relations
  shop       Shop     @relation(fields: [shopId], references: [id])
  
  @@unique([shopId, dayOfWeek])
  @@index([shopId])
}

model Appointment {
  id          String   @id @default(uuid())
  shopId      String
  customerId  String
  serviceId   String
  startTime   DateTime
  endTime     DateTime
  status      AppointmentStatus @default(PENDING)
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  shop        Shop     @relation(fields: [shopId], references: [id])
  customer    User     @relation(fields: [customerId], references: [id])
  service     Service  @relation(fields: [serviceId], references: [id])
  
  @@index([shopId, startTime])
  @@index([customerId])
  @@index([status])
}

model Notification {
  id          String   @id @default(uuid())
  userId      String
  type        NotificationType
  title       String
  message     String
  isRead      Boolean  @default(false)
  metadata    Json?
  createdAt   DateTime @default(now())
  
  // Relations
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([userId, isRead])
}

enum Role {
  CUSTOMER
  BARBER
  ADMIN
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  RESCHEDULED
  CANCELLED
  COMPLETED
  NO_SHOW
}

enum NotificationType {
  APPOINTMENT_CREATED
  APPOINTMENT_CONFIRMED
  APPOINTMENT_RESCHEDULED
  APPOINTMENT_CANCELLED
  APPOINTMENT_REMINDER
}
```

## 4. API Design

### 4.1 Authentication Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### 4.2 Shop Management (Barber)
```
POST   /api/shops                 # Create shop
GET    /api/shops/:slug            # Get shop details
PUT    /api/shops/:id              # Update shop
DELETE /api/shops/:id              # Delete shop

# Services
POST   /api/shops/:shopId/services
GET    /api/shops/:shopId/services
PUT    /api/shops/:shopId/services/:id
DELETE /api/shops/:shopId/services/:id

# Schedule
POST   /api/shops/:shopId/schedules
GET    /api/shops/:shopId/schedules
PUT    /api/shops/:shopId/schedules/:id
DELETE /api/shops/:shopId/schedules/:id
```

### 4.3 Appointment Management
```
# Customer endpoints
POST   /api/appointments                    # Create appointment request
GET    /api/appointments                    # List user's appointments
GET    /api/appointments/:id                # Get appointment details
PUT    /api/appointments/:id/cancel         # Cancel appointment

# Barber endpoints
GET    /api/shops/:shopId/appointments      # List shop appointments
PUT    /api/appointments/:id/confirm        # Confirm appointment
PUT    /api/appointments/:id/reschedule     # Propose new time
PUT    /api/appointments/:id/complete       # Mark as completed

# Availability
GET    /api/shops/:shopId/availability      # Get available time slots
```

### 4.4 User Management
```
GET    /api/users/profile
PUT    /api/users/profile
PUT    /api/users/change-password
GET    /api/users/appointments
```

## 5. Time Slot Algorithm

### 5.1 Availability Calculation Logic

```typescript
interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

class AvailabilityService {
  async getAvailableSlots(
    shopId: string,
    serviceId: string,
    date: Date
  ): Promise<TimeSlot[]> {
    // 1. Get shop's schedule for the day
    const daySchedule = await this.getShopSchedule(shopId, date);
    
    // 2. Get service duration
    const service = await this.getService(serviceId);
    const duration = service.duration;
    
    // 3. Get existing appointments for the day
    const appointments = await this.getAppointments(shopId, date);
    
    // 4. Generate all possible time slots
    const slots = this.generateTimeSlots(
      daySchedule.openTime,
      daySchedule.closeTime,
      duration
    );
    
    // 5. Mark unavailable slots based on existing appointments
    return this.markUnavailableSlots(slots, appointments);
  }
  
  private generateTimeSlots(
    openTime: string,
    closeTime: string,
    duration: number,
    interval: number = 15 // 15-minute intervals
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    let current = parseTime(openTime);
    const end = parseTime(closeTime);
    
    while (current.plus(duration) <= end) {
      slots.push({
        startTime: current,
        endTime: current.plus(duration),
        available: true
      });
      current = current.plus(interval);
    }
    
    return slots;
  }
}
```

### 5.2 Appointment Confirmation Flow

```mermaid
sequenceDiagram
    Customer->>API: Request Appointment
    API->>DB: Check Availability
    API->>DB: Create Pending Appointment
    API->>Queue: Send Notification to Barber
    Queue->>Barber: Email/Push Notification
    Barber->>API: Confirm/Reschedule
    alt Confirmed
        API->>DB: Update Status to CONFIRMED
        API->>Queue: Send Confirmation to Customer
        Queue->>Customer: Email Confirmation
    else Rescheduled
        API->>Customer: Propose New Time
        Customer->>API: Accept/Reject
    end
```

## 6. Project Structure

### 6.1 Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── env.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── shop.controller.ts
│   │   ├── appointment.controller.ts
│   │   └── user.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── shop.service.ts
│   │   ├── appointment.service.ts
│   │   ├── availability.service.ts
│   │   └── email.service.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── shop.routes.ts
│   │   └── appointment.routes.ts
│   ├── utils/
│   │   ├── jwt.utils.ts
│   │   ├── date.utils.ts
│   │   └── validation.schemas.ts
│   ├── jobs/
│   │   ├── email.job.ts
│   │   └── reminder.job.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── app.ts
├── tests/
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

### 6.2 Frontend Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── barber/
│   │   │   │   ├── shop/page.tsx
│   │   │   │   ├── appointments/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   ├── customer/
│   │   │   │   ├── shops/page.tsx
│   │   │   │   ├── appointments/page.tsx
│   │   │   │   └── profile/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── calendar/
│   │   ├── appointments/
│   │   └── shared/
│   ├── lib/
│   │   ├── api/
│   │   ├── utils/
│   │   └── hooks/
│   ├── stores/
│   │   ├── auth.store.ts
│   │   └── appointment.store.ts
│   └── types/
├── public/
├── .env.local.example
├── next.config.js
├── package.json
└── tsconfig.json
```

## 7. Security Considerations

### 7.1 Authentication & Authorization
- JWT with access (15min) and refresh tokens (7 days)
- Role-based access control (RBAC)
- Email verification required
- Rate limiting on auth endpoints
- Password hashing with bcrypt (10+ rounds)

### 7.2 Data Protection
- Input validation with Zod schemas
- SQL injection prevention via Prisma ORM
- XSS protection with proper React escaping
- CORS configuration for API
- HTTPS only in production
- Environment variables for secrets

### 7.3 Multi-tenancy Isolation
- Row-level security with shopId checks
- Middleware to verify shop ownership
- Separate data contexts per shop

## 8. Scalability Strategy

### 8.1 Initial Setup (MVP)
- Single server deployment
- PostgreSQL with connection pooling
- Redis for session storage and basic caching
- Background jobs with Bull queue

### 8.2 Growth Phase
- Horizontal scaling with load balancer
- Read replicas for database
- CDN for static assets
- Elasticsearch for shop search
- Separate microservice for notifications

### 8.3 Scale Considerations
- Database indexing on frequently queried fields
- Pagination for all list endpoints
- Lazy loading for frontend components
- Image optimization and CDN delivery
- API rate limiting per user/shop

## 9. Development Workflow

### 9.1 Local Development Setup
```bash
# Clone repository
git clone <repo-url>

# Backend setup
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev

# Frontend setup
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### 9.2 Docker Compose for Development
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: barber_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/barber_app
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

## 10. MVP Implementation Plan

### Phase 1: Foundation (Week 1-2)
1. Setup project structure and development environment
2. Implement authentication system (register, login, JWT)
3. Create basic database schema with Prisma
4. Setup Docker compose for local development

### Phase 2: Core Features (Week 3-4)
1. Shop creation and management for barbers
2. Service management (CRUD operations)
3. Schedule configuration
4. Basic shop listing for customers

### Phase 3: Appointment System (Week 5-6)
1. Availability calculation algorithm
2. Appointment booking flow
3. Confirmation/rescheduling mechanism
4. Email notifications with Bull queue

### Phase 4: UI/UX (Week 7-8)
1. Responsive calendar component
2. Dashboard for barbers
3. Customer booking interface
4. Mobile-responsive design

### Phase 5: Testing & Deployment (Week 9-10)
1. Unit and integration tests
2. Performance optimization
3. Security audit
4. Deployment setup
5. Documentation

## 11. Testing Strategy

### 11.1 Backend Testing
- Unit tests for services and utilities
- Integration tests for API endpoints
- Database transaction tests
- Queue job testing

### 11.2 Frontend Testing
- Component testing with React Testing Library
- E2E testing with Playwright
- Visual regression testing
- Performance testing with Lighthouse

## 12. Monitoring & Analytics

### 12.1 Application Monitoring
- Error tracking with Sentry
- Performance monitoring
- API response time tracking
- Database query performance

### 12.2 Business Analytics
- Appointment booking rates
- Popular time slots
- Service popularity
- Customer retention metrics

## 13. Future Enhancements

### 13.1 Short-term (3-6 months)
- Mobile app with React Native
- Payment integration (Stripe)
- SMS notifications
- Barber availability calendar
- Customer reviews and ratings

### 13.2 Long-term (6-12 months)
- Multi-language support
- Barber marketplace
- Advanced analytics dashboard
- Loyalty programs
- AI-powered scheduling optimization
- Video consultations

## 14. Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/barber_app"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
FROM_EMAIL="noreply@barberapp.com"

# App
PORT=3001
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 15. Claude Code Integration Guide

### 15.1 Getting Started with Claude Code
```bash
# Initialize the project
claude-code init barber-appointment-app

# Generate backend boilerplate
claude-code generate backend --template express-prisma-typescript

# Generate frontend boilerplate
claude-code generate frontend --template nextjs-typescript-tailwind

# Setup database schema
claude-code db:schema --from ./CLAUDE.md

# Generate API routes
claude-code api:generate --from ./CLAUDE.md
```

### 15.2 Development Commands
```bash
# Run development environment
claude-code dev

# Run tests
claude-code test

# Build for production
claude-code build

# Deploy
claude-code deploy --platform railway
```

## 16. Conclusion

This design provides a solid foundation for building a scalable barber appointment SaaS platform. The architecture is designed to be:

- **Scalable**: Can grow from single shop to thousands
- **Maintainable**: Clear separation of concerns
- **Secure**: Industry-standard security practices
- **User-friendly**: Intuitive booking flow
- **Flexible**: Easy to add new features

Start with the MVP implementation plan and iterate based on user feedback. The modular architecture allows for easy modifications and extensions as the business grows.
