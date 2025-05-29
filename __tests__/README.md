# Test Suite Documentation

This document provides an overview of the comprehensive test suite for the LMS×LINE AI Support System.

## Test Structure

```
__tests__/
├── utils/                    # Test utilities and helpers
│   ├── test-utils.tsx       # Custom render functions and mocks
│   ├── mock-handlers.ts     # MSW request handlers
│   └── setup-msw.ts         # MSW server setup
├── unit/                    # Unit tests
│   ├── components/          # Component tests
│   │   ├── ui/             # UI component tests
│   │   ├── auth/           # Authentication component tests
│   │   └── sections/       # Section component tests
│   ├── hooks/              # Hook tests
│   ├── contexts/           # Context tests
│   ├── lib/               # Utility function tests
│   └── api/               # API route tests
├── integration/            # Integration tests
│   ├── auth-flow.test.tsx  # Authentication flow tests
│   └── api-endpoints.test.ts # API endpoint integration tests
└── e2e/                   # End-to-end tests
    ├── auth.spec.ts       # Authentication E2E tests
    ├── dashboard.spec.ts  # Dashboard E2E tests
    ├── global-setup.ts   # E2E test setup
    └── global-teardown.ts # E2E test cleanup
```

## Test Coverage

### Unit Tests (70+ tests)

#### UI Components
- **Button Component** (`button.test.tsx`)
  - Variant rendering (default, destructive, outline, secondary, ghost, link)
  - Size variations (default, sm, lg, icon)
  - Event handling and interactions
  - Accessibility features
  - Ref forwarding
  - asChild functionality

- **Input Component** (`input.test.tsx`)
  - Different input types (email, password, number)
  - Controlled and uncontrolled inputs
  - Validation states
  - Accessibility features
  - Event handling

- **Card Components** (`card.test.tsx`)
  - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
  - Proper nesting and structure
  - Custom className handling
  - Ref forwarding

#### Authentication Components
- **LoginForm** (`login-form.test.tsx`)
  - Form rendering and validation
  - Email/password authentication flow
  - Google sign-in functionality
  - Password visibility toggle
  - Error handling
  - Loading states
  - Navigation links

- **RegisterForm** (`register-form.test.tsx`)
  - Registration form validation
  - Password confirmation matching
  - User creation flow
  - Error handling
  - Loading states

#### Hooks and Context
- **useAuth Hook** (`useAuth.test.tsx`)
  - Hook functionality and exports
  - Context integration

- **AuthContext** (`auth-context.test.tsx`)
  - Authentication state management
  - Sign in/up/out functionality
  - Firebase integration
  - Database synchronization
  - Error handling
  - Toast notifications

#### API Routes
- **Auth Sync Endpoint** (`auth/sync.test.ts`)
  - User creation and updates
  - Firebase token verification
  - Authorization handling
  - Error scenarios

- **Auth User Endpoint** (`auth/user.test.ts`)
  - User data retrieval
  - Authentication verification
  - Error handling

#### Utility Functions
- **Utils** (`lib/utils.test.ts`)
  - className merging (cn function)
  - Price formatting (Japanese Yen)
  - Date formatting (Japanese locale)
  - Relative time formatting
  - Text truncation

### Integration Tests (20+ tests)

#### Authentication Flow (`auth-flow.test.tsx`)
- Complete login process with database sync
- Registration flow with profile creation
- Logout functionality
- Error handling across the full stack
- User journey from registration to logout

#### API Endpoints (`api-endpoints.test.ts`)
- User registration and data retrieval workflow
- Login with user data updates
- Authentication error scenarios
- Database error handling
- Data consistency between endpoints

### End-to-End Tests (25+ tests)

#### Authentication Flow (`auth.spec.ts`)
- Login page functionality
- Registration page functionality
- Form validation
- Password visibility toggle
- Navigation between auth pages
- Responsive design on mobile
- Accessibility features

#### Dashboard (`dashboard.spec.ts`)
- Unauthenticated access protection
- Dashboard display when authenticated
- Course listing
- User navigation
- Responsive design
- Error handling
- Accessibility compliance

#### Performance and Quality
- Page load times
- Console error detection
- Navigation functionality
- Mobile responsiveness

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Next.js integration
- TypeScript support
- Module path mapping
- Coverage reporting
- Custom test environment setup

### Jest Setup (`jest.setup.js`)
- Testing Library DOM matchers
- Firebase mocking
- Prisma mocking
- Next.js router mocking
- Environment variables
- Global utilities (IntersectionObserver, ResizeObserver, matchMedia)

### Playwright Configuration (`playwright.config.ts`)
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile device testing
- Screenshot and video recording
- Test parallelization
- Development server integration

## Running Tests

### Unit and Integration Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests in CI mode
npm run test:ci
```

### End-to-End Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Test Utilities

### Custom Render Function (`test-utils.tsx`)
- Provides context providers (Auth, QueryClient)
- Mock user data and API responses
- Helper functions for testing

### MSW (Mock Service Worker)
- API request mocking
- Error scenario simulation
- Consistent test data

### Mock Data
- User profiles and authentication states
- Course data
- API responses
- Form data helpers

## Coverage Goals

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Best Practices

1. **Test Structure**: Arrange-Act-Assert pattern
2. **Mocking**: Mock external dependencies (Firebase, Prisma, Next.js)
3. **User-Centric**: Test from user perspective using Testing Library
4. **Accessibility**: Include accessibility testing in components
5. **Error Scenarios**: Test both success and failure paths
6. **Responsive Design**: Test mobile and desktop layouts
7. **Performance**: Monitor page load times and console errors

## Continuous Integration

Tests are designed to run in CI environments with:
- Deterministic test execution
- Proper cleanup and teardown
- Error reporting and artifacts
- Coverage reporting
- Cross-browser compatibility

## Adding New Tests

When adding new features:
1. Write unit tests for individual components/functions
2. Add integration tests for feature workflows
3. Include E2E tests for critical user journeys
4. Update test documentation
5. Ensure coverage thresholds are maintained

## Debugging Tests

- Use `screen.debug()` to inspect rendered DOM
- Use `--verbose` flag for detailed test output
- Check test artifacts (screenshots, videos) for E2E failures
- Use browser dev tools in headed mode for E2E tests