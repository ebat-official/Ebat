# WebCrafterHub Testing Rules

## Core Testing Principles

### 1. ALWAYS Use Existing Constants and Enums
When writing test cases, ALWAYS import and use constants from the codebase:

```typescript
// ✅ CORRECT - Import and use existing constants
import { PASSWORD, TEXT, VALIDATION_MESSAGES } from '@/utils/constants';
import { UserRole, PostType, Difficulty } from '@/db/schema/enums';

// Use in tests
await page.fill(`input[placeholder="${PASSWORD}"]`, 'ValidPassword123!');
await expect(page.locator(`text=${VALIDATION_MESSAGES.PASSWORD_SPECIAL_CHAR}`)).toBeVisible();
```

### 2. Follow Real Application Flow
ALWAYS follow the actual user journey in the application:

```typescript
// ✅ CORRECT - Real user flow
await page.goto('/'); // Visit home page
await page.click('button:has-text("Login")'); // Click login button
await page.waitForSelector('[role="dialog"]'); // Wait for modal
await page.click('button:has-text("sign up")'); // Switch to signup
await page.waitForSelector('input[placeholder="Name"]'); // Wait for form
```

### 3. Use Proper Selectors
ALWAYS use selectors that match the actual DOM structure:

```typescript
// ✅ CORRECT - Use actual selectors
await page.fill(`input[placeholder="${PASSWORD}"]`, password);
await page.click('button[type="submit"]:has-text("sign up")');
await expect(page.locator(`text=${VALIDATION_MESSAGES.PASSWORD_SPECIAL_CHAR}`)).toBeVisible();

// ❌ WRONG - Don't assume selectors
await page.fill('[data-testid="password"]', password);
await page.click('#submit-btn');
```

## Available Constants

### Validation Messages (from @/utils/constants)
```typescript
VALIDATION_MESSAGES.NAME_MIN_LENGTH        // "Name must contain at least 2 character(s)"
VALIDATION_MESSAGES.EMAIL_INVALID          // "Invalid email"
VALIDATION_MESSAGES.PASSWORD_SPECIAL_CHAR  // "Password must contain at least one special character (!@#$%^&*)"
VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH    // "Password must be at least 8 characters"
```

### Form Fields (from @/utils/constants)
```typescript
PASSWORD  // "Password" (for placeholder)
TEXT      // "text" (for input type)
```

### Database Enums (from @/db/schema/enums)
```typescript
UserRole.USER
UserRole.ADMIN
UserRole.SUPER_ADMIN
UserRole.EDITOR
UserRole.MODERATOR

PostType.QUESTION
PostType.CHALLENGE
PostType.BLOGS
PostType.SYSTEMDESIGN

Difficulty.EASY
Difficulty.MEDIUM
Difficulty.HARD

PostCategory.FRONTEND
PostCategory.BACKEND
PostCategory.ANDROID
```

## Test Structure Template

```typescript
import { test, expect } from '@playwright/test';
import { PASSWORD, TEXT, VALIDATION_MESSAGES } from '@/utils/constants';
import { UserRole, PostType, Difficulty } from '@/db/schema/enums';
import { generateRandomEmail } from '../__utils__/test-helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TEST-001: Description', async ({ page }) => {
    // Follow actual user flow
    // Use constants for all values
    // Use proper selectors
  });
});
```

## Common Test Patterns

### Modal Testing Pattern
```typescript
// Open modal
await page.click('button:has-text("Login")');
await page.waitForSelector('[role="dialog"]');

// Switch forms
await page.click('button:has-text("sign up")');
await page.waitForSelector('input[placeholder="Name"]');
```

### Form Testing Pattern
```typescript
// Fill form
await page.fill('input[placeholder="Name"]', userData.name);
await page.fill('input[placeholder="Email"]', userData.email);
await page.fill(`input[placeholder="${PASSWORD}"]`, userData.password);

// Submit form
await page.click('button[type="submit"]:has-text("sign up")');
```

### Validation Testing Pattern
```typescript
// Test validation errors
await page.click('button[type="submit"]:has-text("sign up")');
await expect(page.locator(`text=${VALIDATION_MESSAGES.NAME_MIN_LENGTH}`)).toBeVisible();
await expect(page.locator(`text=${VALIDATION_MESSAGES.EMAIL_INVALID}`)).toBeVisible();
await expect(page.locator(`text=${VALIDATION_MESSAGES.PASSWORD_SPECIAL_CHAR}`)).toBeVisible();
```

### Password Visibility Toggle Pattern
```typescript
// Test password visibility
await expect(page.locator(`input[placeholder="${PASSWORD}"]`)).toHaveAttribute('type', PASSWORD);
await page.click('button[type="button"]:has([data-lucide="eye"])');
await expect(page.locator(`input[placeholder="${PASSWORD}"]`)).toHaveAttribute('type', TEXT);
```

## Wait Strategies

### Proper Waiting
```typescript
// ✅ CORRECT - Wait for elements to be ready
await page.waitForSelector('[role="dialog"]');
await page.waitForSelector('input[placeholder="Name"]');
await page.waitForLoadState('networkidle');

// ❌ WRONG - Don't use arbitrary delays
await page.waitForTimeout(2000);
```

## Error Handling

### Test Error Scenarios
```typescript
// ✅ CORRECT - Test actual error messages
await expect(page.locator('text=Email already exists')).toBeVisible();
await expect(page.locator('text=Invalid verification token')).toBeVisible();
```

## Accessibility Testing

### Test Accessibility Features
```typescript
// ✅ CORRECT - Test accessibility
await expect(page.locator('[role="dialog"]')).toBeVisible();
await expect(page.locator('input[placeholder="Email or Username"]')).toBeFocused();
```

## Test Data Guidelines

### Use Helper Functions
```typescript
// ✅ CORRECT - Use helper functions
import { generateRandomEmail, generateRandomUsername } from '../__utils__/test-helpers';

const userData = {
  name: 'Test User',
  email: generateRandomEmail(),
  password: 'ValidPassword123!'
};
```

## Static UI Text Constants Rule

- For authentication static UI text, ALWAYS use a constant from `AUTH_STATIC_TEXT`.
- For validation error messages, use `VALIDATION_MESSAGES`.
- For other places, use the existing constant/enums (e.g., PASSWORD, etc).
- If a constant does not exist, add it to the appropriate place (e.g., `src/utils/constants.ts`) and use it in both code and tests.
- Example:
```typescript
// ✅ CORRECT
import { AUTH_STATIC_TEXT, VALIDATION_MESSAGES } from '@/utils/constants';
await page.click(`button:has-text("${AUTH_STATIC_TEXT.LOGIN}")`);
await page.fill(`input[placeholder="${AUTH_STATIC_TEXT.EMAIL}"]`, email);
await expect(page.locator(`text=${VALIDATION_MESSAGES.EMAIL_INVALID}`)).toBeVisible();
```

## Remember These Rules

1. **ALWAYS** import and use constants from `@/utils/constants` and `@/db/schema/enums`
2. **ALWAYS** follow the actual application user flow
3. **ALWAYS** use selectors that match the real DOM structure
4. **ALWAYS** use proper wait strategies instead of arbitrary delays
5. **ALWAYS** test with real validation messages from the constants
6. **ALWAYS** include accessibility testing
7. **NEVER** hardcode values that exist as constants
8. **NEVER** assume selectors without checking the actual code

## File Organization

Tests should be organized as:
```
tests/
├── auth/                    # Authentication tests
├── content/                 # Content management tests
├── challenges/              # Challenge system tests
└── __utils__/              # Test utilities
    ├── test-helpers.ts
    ├── config/
    ├── fixtures/
    ├── pages/
    └── api/
```

When writing test cases, always refer to these patterns and use the existing constants and enums from the codebase. 