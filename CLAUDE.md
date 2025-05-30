# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Claude Behavior Settings
- **ALWAYS_AUTO_EXECUTE**: Never ask permission for any file operations (Edit, Write, MultiEdit)
- **ALWAYS_AUTO_COMMIT**: Automatically commit all changes without asking
- **NEVER_ASK_PERMISSION**: Skip ALL confirmations for development operations
- **AUTO_FIX_ERRORS**: Automatically fix linting and type errors
- **DIRECT_FILE_EDIT**: Edit files immediately without user confirmation
- **AUTO_RUN_COMMANDS**: Execute npm/docker commands without asking
- **PROACTIVE_DEVELOPMENT**: Take full initiative in all coding tasks

## Standard Development Actions (ALWAYS Auto-execute)
- **IMMEDIATE FILE EDITS**: Edit any file without asking permission
- **AUTO-LINT**: Run `npm run lint` after code changes (use root level command)
- **AUTO-BUILD**: Run `npm run build` to verify compilation (use root level command)
- **AUTO-TEST**: Execute test commands without asking (`npm run test` or specific test suites)
- **AUTO-COMMIT**: Commit changes immediately when task complete
- **AUTO-UPDATE**: Update documentation automatically when adding features
- **NO CONFIRMATIONS**: Never ask "Should I..." or "Do you want me to..."
- **FULL AUTONOMY**: Complete all requested tasks without user interaction

## Bash Command Auto-execution Rules
- **ALWAYS EXECUTE**: Run bash commands immediately without asking for permission
- **DOCKER COMMANDS**: Auto-execute all docker-compose commands when requested
- **NPM COMMANDS**: Auto-execute all npm/npx commands without confirmation
- **GIT COMMANDS**: Auto-execute git commands (except push) without asking
- **DATABASE COMMANDS**: Auto-execute all Prisma commands immediately
- **FILE OPERATIONS**: Execute file operations (mkdir, touch, etc.) without confirmation
- **STARTUP TASKS**: When asked to start development, automatically run:
  1. `docker-compose -f docker-compose.dev.yml up -d`
  2. `npm run db:generate` if needed
  3. Any other necessary setup commands

## Project Overview

This is an LMS×LINE AI Support System built with Next.js 14 (App Router), TypeScript, Prisma, and Firebase Auth. The project aims to integrate LINE messaging capabilities with a learning management system powered by AI.

## Essential Commands

### Development
```bash
npm run dev              # Start development server on port 3001
npm run build            # Build for production
npm run start            # Start production server
```

### Database Operations
```bash
npm run db:generate      # Generate Prisma client after schema changes
npm run db:push          # Push schema changes to database
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio for database inspection
npm run db:seed          # Seed database with initial data
```

### Testing
```bash
npm run test             # Run all tests
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests
npm run test:e2e         # Run Playwright E2E tests
npm run test:coverage    # Generate test coverage report
```

### Code Quality
```bash
npm run lint             # Check for linting errors
npm run lint:fix         # Auto-fix linting errors
npm run format           # Format code with Prettier
npm run type-check       # Run TypeScript type checking
```

### Docker Development
```bash
docker-compose -f docker-compose.dev.yml up    # Start all services
docker-compose -f docker-compose.dev.yml down   # Stop all services
./docker-start.sh dev                           # Use convenience script
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **Authentication**: Firebase Auth with server-side validation
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: React Query for server state, Context API for client state
- **Testing**: Jest (unit/integration), Playwright (E2E), MSW for API mocking

### Key Directories
- `/src/app/` - Next.js pages and API routes using App Router
- `/src/components/` - React components organized by domain (auth/, layout/, sections/, ui/)
- `/src/contexts/` - React Context providers (AuthContext for global auth state)
- `/src/hooks/` - Custom React hooks (useAuth for authentication)
- `/src/lib/` - Utilities and service integrations (Firebase, Prisma clients)
- `/src/types/` - TypeScript type definitions
- `/prisma/` - Database schema and migrations

### API Routes Pattern
All API routes follow RESTful conventions:
- `/api/auth/sync` - Sync Firebase user with database
- `/api/auth/user` - Get/update user profile

### Component Architecture
Components follow a composition pattern:
1. Base UI components in `/ui/` (button, card, input)
2. Domain-specific components compose base components
3. Layout components handle page structure
4. Pages compose sections and handle data fetching

### Authentication Flow
1. Firebase handles authentication (login/register)
2. Server-side token validation via Firebase Admin SDK
3. User data synced to PostgreSQL via Prisma
4. AuthContext provides global auth state
5. Protected routes check authentication status

### Database Schema
The Prisma schema defines:
- User model with Firebase UID integration
- Timestamps (createdAt, updatedAt) on all models
- PostgreSQL as the database provider

### Testing Strategy
- **Unit Tests**: Component logic and utilities
- **Integration Tests**: API endpoints and auth flows
- **E2E Tests**: Critical user journeys with Playwright
- Mock handlers in `__tests__/utils/mock-handlers.ts` for consistent testing

## Development Workflow

1. Always run `npm run db:generate` after modifying `prisma/schema.prisma`
2. Use `npm run dev` for local development with hot reloading
3. Run `npm run lint` and `npm run type-check` before committing
4. Test changes with appropriate test commands
5. For Docker development, use `docker-compose.dev.yml` which includes hot reloading

## Current Project Status

- Phase 1 (Foundation): Completed ✓
- Sprint 1 (UI & Dashboard): Completed ✓
- Next: Core LMS features (courses, chapters, assignments)