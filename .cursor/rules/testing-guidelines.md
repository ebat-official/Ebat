# Testing Guidelines for WebCrafterHub

## Core Principles

### 1. Use Existing Constants and Enums
**ALWAYS** use constants and enums from the codebase instead of hardcoded values:

```typescript
// ✅ CORRECT - Use existing constants
import { PASSWORD, TEXT, VALIDATION_MESSAGES } from '@/utils/constants';
import { UserRole, PostType, Difficulty } from '@/db/schema/enums';

// ❌ WRONG - Don't hardcode values
await page.fill('input[placeholder="Password"]', 'test123');
await expect(page.locator('text=Invalid email')).toBeVisible();
```

### 2. Follow Application Flow
**ALWAYS** follow the actual application user flow:

```typescript
// ✅ CORRECT - Follow real user journey
await page.goto('/'); // Visit home page
await page.click('button:has-text("Login")'); // Click login button
await page.waitForSelector('[role="dialog"]'); // Wait for modal
await page.click('button:has-text("sign up")'); // Switch to signup
await page.waitForSelector('input[placeholder="Name"]'); // Wait for form
```

### 3. Use Proper Selectors
**ALWAYS** use robust selectors that match the actual DOM structure:

```typescript
// ✅ CORRECT - Use actual selectors
await page.fill(`input[placeholder="${PASSWORD}"]`, password);
await page.click('button[type="submit"]:has-text("sign up")');
await expect(page.locator(`text=${VALIDATION_MESSAGES.PASSWORD_SPECIAL_CHAR}`)).toBeVisible();

// ❌ WRONG - Don't assume selectors
await page.fill('[data-testid="password"]', password);
await page.click('#submit-btn');
```

### 4. Import and Use Constants
**ALWAYS** import and use the same constants used in the actual components:

```typescript
// ✅ CORRECT - Import from same files as components
import { PASSWORD, TEXT, VALIDATION_MESSAGES } from '@/utils/constants';
import { UserRole, PostType } from '@/db/schema/enums';
import { generateRandomEmail } from '../__utils__/test-helpers';

// Use in tests
await page.fill(`input[placeholder="${PASSWORD}"]`, 'ValidPassword123!');
await expect(page.locator(`text=${VALIDATION_MESSAGES.EMAIL_INVALID}`)).toBeVisible();
```

## Test Structure Guidelines

### 1. Test File Organization
```typescript
import { test, expect } from '@playwright/test';
import { PASSWORD, TEXT, VALIDATION_MESSAGES } from '@/utils/constants';
import { UserRole, PostType } from '@/db/schema/enums';
import { generateRandomEmail, generateRandomUsername } from '../__utils__/test-helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Visit home page and navigate to feature
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

### 2. Wait Strategies
**ALWAYS** use proper wait strategies:

```typescript
// ✅ CORRECT - Wait for elements to be ready
await page.waitForSelector('[role="dialog"]');
await page.waitForSelector('input[placeholder="Name"]');
await page.waitForLoadState('networkidle');

// ❌ WRONG - Don't use arbitrary delays
await page.waitForTimeout(2000);
```

### 3. Error Message Validation
**ALWAYS** use the exact error messages from the validation schemas:

```typescript
// ✅ CORRECT - Use validation message constants
await expect(page.locator(`text=${VALIDATION_MESSAGES.PASSWORD_SPECIAL_CHAR}`)).toBeVisible();
await expect(page.locator(`text=${VALIDATION_MESSAGES.NAME_MIN_LENGTH}`)).toBeVisible();
await expect(page.locator(`text=${VALIDATION_MESSAGES.EMAIL_INVALID}`)).toBeVisible();
```

## Component-Specific Guidelines

### 1. Authentication Components
- **LoginModal**: Always start with login form, then switch to signup
- **SignupForm**: Use `VALIDATION_MESSAGES` constants for error messages
- **Password fields**: Use `PASSWORD` constant for placeholder
- **Form types**: Use `TEXT` vs `PASSWORD` for visibility toggle

### 2. Database Enums
**ALWAYS** use enums from `@/db/schema/enums`:

```typescript
// ✅ CORRECT - Use database enums
import { UserRole, PostType, Difficulty, PostCategory } from '@/db/schema/enums';

const testData = {
  role: UserRole.USER,
  postType: PostType.QUESTION,
  difficulty: Difficulty.MEDIUM,
  category: PostCategory.FRONTEND
};
```

### 3. API Testing
**ALWAYS** use the same API patterns as the application:

```typescript
// ✅ CORRECT - Use same API structure
const { data, error } = await authClient.signUp.email({
  email: userData.email,
  password: userData.password,
  name: userData.name,
});
```

## Validation Rules

### 1. Form Validation
**ALWAYS** test with the exact validation rules from the schemas:

```typescript
// ✅ CORRECT - Test actual validation rules
// Name: min 2 characters
await page.fill('input[placeholder="Name"]', 'A');
await expect(page.locator(`text=${VALIDATION_MESSAGES.NAME_MIN_LENGTH}`)).toBeVisible();

// Email: must be valid format
await page.fill('input[placeholder="Email"]', 'invalid-email');
await expect(page.locator(`text=${VALIDATION_MESSAGES.EMAIL_INVALID}`)).toBeVisible();

// Password: must contain special character
await page.fill(`input[placeholder="${PASSWORD}"]`, '123');
await expect(page.locator(`text=${VALIDATION_MESSAGES.PASSWORD_SPECIAL_CHAR}`)).toBeVisible();
```

### 2. Error Handling
**ALWAYS** test error scenarios with proper error messages:

```typescript
// ✅ CORRECT - Test actual error messages
await expect(page.locator('text=Email already exists')).toBeVisible();
await expect(page.locator('text=Invalid verification token')).toBeVisible();
```

## Accessibility Guidelines

### 1. ARIA Attributes
**ALWAYS** test accessibility features:

```typescript
// ✅ CORRECT - Test accessibility
await expect(page.locator('[role="dialog"]')).toBeVisible();
await expect(page.locator('input[placeholder="Email or Username"]')).toBeFocused();
```

### 2. Keyboard Navigation
**ALWAYS** test keyboard interactions:

```typescript
// ✅ CORRECT - Test keyboard navigation
await page.keyboard.press('Tab');
await expect(page.locator('input[placeholder="Email or Username"]')).toBeFocused();
await page.keyboard.press('Escape');
await expect(page.locator('[role="dialog"]')).not.toBeVisible();
```

## Performance Guidelines

### 1. Timeout Management
**ALWAYS** use appropriate timeouts:

```typescript
// ✅ CORRECT - Use reasonable timeouts
await page.waitForSelector('text=Verify your email address', { timeout: 10000 });
await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 });
```

### 2. Network State
**ALWAYS** wait for network idle when appropriate:

```typescript
// ✅ CORRECT - Wait for page to be ready
await page.goto('/');
await page.waitForLoadState('networkidle');
```

## Test Data Guidelines

### 1. Use Helper Functions
**ALWAYS** use helper functions for test data:

```typescript
// ✅ CORRECT - Use helper functions
import { generateRandomEmail, generateRandomUsername } from '../__utils__/test-helpers';

const userData = {
  name: 'Test User',
  email: generateRandomEmail(),
  password: 'ValidPassword123!'
};
```

### 2. Use Constants for Test Data
**ALWAYS** use constants for consistent test data:

```typescript
// ✅ CORRECT - Use constants for test data
const testUsers = {
  regular: {
    email: 'test@example.com',
    password: 'ValidPassword123!',
    role: UserRole.USER
  },
  admin: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    role: UserRole.ADMIN
  }
};
```

## File Organization

### 1. Test File Structure
```
tests/
├── auth/
│   ├── userRegistration.spec.ts
│   ├── userLogin.spec.ts
│   └── passwordManagement.spec.ts
├── content/
│   ├── postCreation.spec.ts
│   └── postViewing.spec.ts
├── challenges/
│   └── challengeSystem.spec.ts
└── __utils__/
    ├── test-helpers.ts
    ├── config/
    │   └── test-users.ts
    └── fixtures/
        └── test-data.ts
```

### 2. Import Organization
**ALWAYS** organize imports in this order:

```typescript
// 1. Playwright imports
import { test, expect } from '@playwright/test';

// 2. Application constants and enums
import { PASSWORD, TEXT, VALIDATION_MESSAGES } from '@/utils/constants';
import { UserRole, PostType } from '@/db/schema/enums';

// 3. Test utilities
import { generateRandomEmail } from '../__utils__/test-helpers';
import { testUsers } from '../__utils__/config/test-users';
```

## Common Patterns

### 1. Modal Testing
```typescript
// ✅ CORRECT - Modal testing pattern
await page.click('button:has-text("Login")');
await page.waitForSelector('[role="dialog"]');
await page.click('button:has-text("sign up")');
await page.waitForSelector('input[placeholder="Name"]');
```

### 2. Form Testing
```typescript
// ✅ CORRECT - Form testing pattern
await page.fill('input[placeholder="Name"]', userData.name);
await page.fill('input[placeholder="Email"]', userData.email);
await page.fill(`input[placeholder="${PASSWORD}"]`, userData.password);
await page.click('button[type="submit"]:has-text("sign up")');
```

### 3. Validation Testing
```typescript
// ✅ CORRECT - Validation testing pattern
await page.click('button[type="submit"]:has-text("sign up")');
await expect(page.locator(`text=${VALIDATION_MESSAGES.NAME_MIN_LENGTH}`)).toBeVisible();
await expect(page.locator(`text=${VALIDATION_MESSAGES.EMAIL_INVALID}`)).toBeVisible();
await expect(page.locator(`text=${VALIDATION_MESSAGES.PASSWORD_SPECIAL_CHAR}`)).toBeVisible();
```

## UI Text Constants Rule

### ALWAYS use a constant from `UI_TEXT` for any UI text (button, label, placeholder, etc)
- If a constant does not exist, add it to `src/utils/constants.ts` and use it in both code and tests.
- Example:
```typescript
// ✅ CORRECT
import { UI_TEXT } from '@/utils/constants';
await page.click(`button:has-text("${UI_TEXT.LOGIN}")`);
await page.fill(`input[placeholder="${UI_TEXT.EMAIL}"]`, email);
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

## Remember
- **ALWAYS** use constants from the codebase
- **ALWAYS** follow the actual user flow
- **ALWAYS** use proper selectors that match the DOM
- **ALWAYS** test with real validation messages
- **ALWAYS** include accessibility testing
- **ALWAYS** use helper functions for test data
- **NEVER** hardcode values that exist as constants
- **NEVER** assume selectors without checking the actual code 