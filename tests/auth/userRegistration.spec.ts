import { test, expect } from "@playwright/test";
import {
	PASSWORD,
	TEXT,
	VALIDATION_MESSAGES,
	AUTH_STATIC_TEXT,
} from "@/utils/constants";
import { UserRole } from "@/db/schema/enums";
import {
	generateRandomEmail,
	generateRandomUsername,
} from "../__utils__/test-helpers";

test.describe("User Registration", () => {
	test.beforeEach(async ({ page }) => {
		// Follow real application flow - visit home page
		await page.goto("/");
		await page.waitForLoadState("networkidle");
	});

	test("REG-001: Register new user with valid email and password", async ({
		page,
	}) => {
		// Follow real user flow
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.LOGIN}")`);
		await page.waitForSelector('[role="dialog"]');
		await page.waitForSelector(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL_OR_USERNAME}"]`,
		);
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`);
		await page.waitForSelector(`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`);

		// Use helper functions for test data
		const userData = {
			name: "Test User",
			email: generateRandomEmail(),
			password: "ValidPassword123!",
		};

		// Fill form using constants
		await page.fill(
			`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`,
			userData.name,
		);
		await page.fill(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL}"]`,
			userData.email,
		);
		await page.fill(`input[placeholder="${PASSWORD}"]`, userData.password);

		// Submit form
		await page.click(
			`button[type="submit"]:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`,
		);

		// Wait for email verification modal
		await page.waitForSelector(
			`text=${AUTH_STATIC_TEXT.VERIFY_EMAIL_ADDRESS}`,
			{
				timeout: 10000,
			},
		);

		// Verify email verification modal content
		await expect(
			page.locator(`text=${AUTH_STATIC_TEXT.VERIFY_EMAIL_ADDRESS}`),
		).toBeVisible();
		await expect(
			page.locator(`text=${AUTH_STATIC_TEXT.VERIFICATION_EMAIL_SENT}`),
		).toBeVisible();
	});

	test("REG-002: Register with invalid email format", async ({ page }) => {
		// Follow real user flow
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.LOGIN}")`);
		await page.waitForSelector('[role="dialog"]');
		await page.waitForSelector(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL_OR_USERNAME}"]`,
		);
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`);
		await page.waitForSelector(`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`);

		// Fill form with invalid email
		await page.fill(
			`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`,
			"Test User",
		);
		await page.fill(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL}"]`,
			"invalid-email",
		);
		await page.fill(`input[placeholder="${PASSWORD}"]`, "ValidPassword123!");

		// Submit form
		await page.click(
			`button[type="submit"]:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`,
		);

		// Verify email validation error using constants
		await expect(
			page.locator(`text=${VALIDATION_MESSAGES.EMAIL_INVALID}`),
		).toBeVisible();
	});

	test("REG-003: Register with weak password", async ({ page }) => {
		// Follow real user flow
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.LOGIN}")`);
		await page.waitForSelector('[role="dialog"]');
		await page.waitForSelector(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL_OR_USERNAME}"]`,
		);
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`);
		await page.waitForSelector(`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`);

		// Fill form with weak password
		await page.fill(
			`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`,
			"Test User",
		);
		await page.fill(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL}"]`,
			generateRandomEmail(),
		);
		await page.fill(`input[placeholder="${PASSWORD}"]`, "123");

		// Submit form
		await page.click(
			`button[type="submit"]:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`,
		);

		// Verify password validation error using constants
		await expect(
			page.locator(`text=${VALIDATION_MESSAGES.PASSWORD_SPECIAL_CHAR}`),
		).toBeVisible();
	});

	test("REG-004: Register with existing email", async ({ page }) => {
		// First, register a user
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.LOGIN}")`);
		await page.waitForSelector('[role="dialog"]');
		await page.waitForSelector(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL_OR_USERNAME}"]`,
		);
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`);
		await page.waitForSelector(`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`);

		const existingEmail = "existing@example.com";
		await page.fill(
			`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`,
			"Existing User",
		);
		await page.fill(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL}"]`,
			existingEmail,
		);
		await page.fill(`input[placeholder="${PASSWORD}"]`, "ValidPassword123!");
		await page.click(
			`button[type="submit"]:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`,
		);

		// Wait for email verification
		await page.waitForSelector(
			`text=${AUTH_STATIC_TEXT.VERIFY_EMAIL_ADDRESS}`,
			{
				timeout: 10000,
			},
		);

		// Close the modal and try to register with the same email
		await page.click(`button[aria-label="${AUTH_STATIC_TEXT.CLOSE}"]`);
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.LOGIN}")`);
		await page.waitForSelector('[role="dialog"]');
		await page.waitForSelector(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL_OR_USERNAME}"]`,
		);
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`);
		await page.waitForSelector(`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`);

		await page.fill(
			`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`,
			"Duplicate User",
		);
		await page.fill(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL}"]`,
			existingEmail,
		);
		await page.fill(`input[placeholder="${PASSWORD}"]`, "AnotherPassword123!");
		await page.click(
			`button[type="submit"]:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`,
		);

		// Verify error message
		await expect(
			page.locator(`text=${AUTH_STATIC_TEXT.EMAIL_ALREADY_EXISTS}`),
		).toBeVisible();
	});

	test("REG-005: Register with short name", async ({ page }) => {
		// Follow real user flow
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.LOGIN}")`);
		await page.waitForSelector('[role="dialog"]');
		await page.waitForSelector(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL_OR_USERNAME}"]`,
		);
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`);
		await page.waitForSelector(`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`);

		// Fill form with short name
		await page.fill(`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`, "A");
		await page.fill(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL}"]`,
			generateRandomEmail(),
		);
		await page.fill(`input[placeholder="${PASSWORD}"]`, "ValidPassword123!");

		// Submit form
		await page.click(
			`button[type="submit"]:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`,
		);

		// Verify name validation error using constants
		await expect(
			page.locator(`text=${VALIDATION_MESSAGES.NAME_MIN_LENGTH}`),
		).toBeVisible();
	});

	test("REG-006: Password strength indicator", async ({ page }) => {
		// Follow real user flow
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.LOGIN}")`);
		await page.waitForSelector('[role="dialog"]');
		await page.waitForSelector(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL_OR_USERNAME}"]`,
		);
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`);
		await page.waitForSelector(`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`);

		// Fill name and email
		await page.fill(
			`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`,
			"Test User",
		);
		await page.fill(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL}"]`,
			generateRandomEmail(),
		);

		// Test weak password
		await page.fill(`input[placeholder="${PASSWORD}"]`, "123");
		await expect(
			page.locator(`text=${AUTH_STATIC_TEXT.WEAK_PASSWORD}`),
		).toBeVisible();

		// Test medium password
		await page.fill(`input[placeholder="${PASSWORD}"]`, "Password123");
		await expect(
			page.locator(`text=${AUTH_STATIC_TEXT.MEDIUM_PASSWORD}`),
		).toBeVisible();

		// Test strong password
		await page.fill(`input[placeholder="${PASSWORD}"]`, "ValidPassword123!");
		await expect(
			page.locator(`text=${AUTH_STATIC_TEXT.STRONG_PASSWORD}`),
		).toBeVisible();
	});

	test("REG-007: Password visibility toggle", async ({ page }) => {
		// Follow real user flow
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.LOGIN}")`);
		await page.waitForSelector('[role="dialog"]');
		await page.waitForSelector(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL_OR_USERNAME}"]`,
		);
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`);
		await page.waitForSelector(`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`);

		// Fill the password field
		await page.fill(`input[placeholder="${PASSWORD}"]`, "ValidPassword123!");

		// Initially password should be hidden (type should be "Password")
		await expect(
			page.locator(`input[placeholder="${PASSWORD}"]`),
		).toHaveAttribute("type", PASSWORD);

		// Click the eye button to show password
		await page.click('button[type="button"]:has([data-lucide="eye"])');

		// Password should now be visible
		await expect(
			page.locator(`input[placeholder="${PASSWORD}"]`),
		).toHaveAttribute("type", TEXT);

		// Click again to hide password
		await page.click('button[type="button"]:has([data-lucide="eye-off"])');

		// Password should be hidden again
		await expect(
			page.locator(`input[placeholder="${PASSWORD}"]`),
		).toHaveAttribute("type", PASSWORD);
	});

	test("REG-008: Form validation - empty fields", async ({ page }) => {
		// Follow real user flow
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.LOGIN}")`);
		await page.waitForSelector('[role="dialog"]');
		await page.waitForSelector(
			`input[placeholder="${AUTH_STATIC_TEXT.EMAIL_OR_USERNAME}"]`,
		);
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`);
		await page.waitForSelector(`input[placeholder="${AUTH_STATIC_TEXT.NAME}"]`);

		// Try to submit empty form
		await page.click(
			`button[type="submit"]:has-text("${AUTH_STATIC_TEXT.SIGN_UP}")`,
		);

		// Verify validation errors using constants
		await expect(
			page.locator(`text=${VALIDATION_MESSAGES.NAME_MIN_LENGTH}`),
		).toBeVisible();
		await expect(
			page.locator(`text=${VALIDATION_MESSAGES.EMAIL_INVALID}`),
		).toBeVisible();
		await expect(
			page.locator(`text=${VALIDATION_MESSAGES.PASSWORD_SPECIAL_CHAR}`),
		).toBeVisible();
	});

	test("REG-009: Modal accessibility", async ({ page }) => {
		// Follow real user flow
		await page.click(`button:has-text("${AUTH_STATIC_TEXT.LOGIN}")`);
		await page.waitForSelector('[role="dialog"]');

		// Verify modal has proper ARIA attributes
		await expect(page.locator('[role="dialog"]')).toBeVisible();

		// Test keyboard navigation
		await page.keyboard.press("Tab");
		await expect(
			page.locator(
				`input[placeholder="${AUTH_STATIC_TEXT.EMAIL_OR_USERNAME}"]`,
			),
		).toBeFocused();

		// Test escape key closes modal
		await page.keyboard.press("Escape");
		await expect(page.locator('[role="dialog"]')).not.toBeVisible();
	});

	test("REG-010: Social login buttons (if implemented)", async ({ page }) => {
		// Follow real user flow
		await page.click('button:has-text("Login")');
		await page.waitForSelector('[role="dialog"]');

		// Check if social login buttons are present
		const googleButton = page.locator('button:has-text("Google")');
		const githubButton = page.locator('button:has-text("GitHub")');

		// If social buttons exist, test them
		if (await googleButton.isVisible()) {
			await googleButton.click();
			// Verify redirect to Google OAuth
			await expect(page).toHaveURL(/accounts\.google\.com/);
		}

		if (await githubButton.isVisible()) {
			await githubButton.click();
			// Verify redirect to GitHub OAuth
			await expect(page).toHaveURL(/github\.com/);
		}
	});

	test("REG-011: Email verification flow", async ({ page }) => {
		// Follow real user flow
		await page.click('button:has-text("Login")');
		await page.waitForSelector('[role="dialog"]');
		await page.waitForSelector('input[placeholder="Email or Username"]');
		await page.click('button:has-text("sign up")');
		await page.waitForSelector('input[placeholder="Name"]');

		// Use helper functions for test data
		const userData = {
			name: "Test User",
			email: generateRandomEmail(),
			password: "ValidPassword123!",
		};

		// Fill form using constants
		await page.fill('input[placeholder="Name"]', userData.name);
		await page.fill('input[placeholder="Email"]', userData.email);
		await page.fill(`input[placeholder="${PASSWORD}"]`, userData.password);
		await page.click('button[type="submit"]:has-text("sign up")');

		// Wait for email verification modal
		await page.waitForSelector("text=Verify your email address", {
			timeout: 10000,
		});

		// Verify email verification modal content
		await expect(page.locator("text=Verify your email address")).toBeVisible();
		await expect(page.locator(`text=${userData.email}`)).toBeVisible();

		// Test resend email functionality (if implemented)
		const resendButton = page.locator(
			'button:has-text("Resend Verification Email")',
		);
		if (await resendButton.isVisible()) {
			await resendButton.click();
			await expect(page.locator("text=Email sent successfully")).toBeVisible();
		}
	});

	test("REG-012: Form switching between login and signup", async ({ page }) => {
		// Follow real user flow
		await page.click('button:has-text("Login")');
		await page.waitForSelector('[role="dialog"]');

		// Initially should be on login form
		await expect(
			page.locator('input[placeholder="Email or Username"]'),
		).toBeVisible();
		await expect(
			page.locator(`input[placeholder="${PASSWORD}"]`),
		).toBeVisible();

		// Switch to signup form
		await page.click('button:has-text("sign up")');

		// Should now show signup form fields
		await expect(page.locator('input[placeholder="Name"]')).toBeVisible();
		await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
		await expect(
			page.locator(`input[placeholder="${PASSWORD}"]`),
		).toBeVisible();

		// Switch back to login form
		await page.click('button:has-text("Sign in")');

		// Should be back to login form
		await expect(
			page.locator('input[placeholder="Email or Username"]'),
		).toBeVisible();
		await expect(
			page.locator(`input[placeholder="${PASSWORD}"]`),
		).toBeVisible();
		await expect(page.locator('input[placeholder="Name"]')).not.toBeVisible();
	});
});
