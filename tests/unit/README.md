# Unit Tests

This directory contains unit tests for the FLY-pg application.

## Structure

- `api/` - API route tests
- `components/` - React component tests
- `lib/` - Utility function tests
- `auth/` - Authentication helper tests

## Running Tests

```bash
# Run all unit tests
pnpm test:unit

# Run specific test file
pnpm test:unit -- tests/unit/api/payments.test.ts

# Run tests in watch mode
pnpm test:unit --watch
```

## Test Categories

### HIGH Priority
- API route tests (authentication, validation, error handling)
- Authentication helper tests
- Critical business logic tests

### MEDIUM Priority
- UI component tests
- Form validation tests
- State management tests

### LOW Priority
- Utility function tests
- Helper function tests
- Non-critical component tests
