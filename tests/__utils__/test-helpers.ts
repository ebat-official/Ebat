import { Page, expect } from "@playwright/test";
import { TestUser } from "./config/test-users";

/**
 * Test helper functions for generating test data
 */

/**
 * Generate a random email address for testing
 */
export function generateRandomEmail(): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	return `test-${timestamp}-${random}@example.com`;
}

/**
 * Generate a random username for testing
 */
export function generateRandomUsername(): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	return `user_${timestamp}_${random}`;
}

/**
 * Generate a random string for testing
 */
export function generateRandomString(length = 10): string {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/**
 * Generate a random password that meets validation requirements
 */
export function generateValidPassword(): string {
	const specialChars = "!@#$%^&*";
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	const numbers = "0123456789";

	// Ensure at least one of each required character type
	let password = "";
	password += letters.charAt(Math.floor(Math.random() * letters.length)); // letter
	password += numbers.charAt(Math.floor(Math.random() * numbers.length)); // number
	password += specialChars.charAt(
		Math.floor(Math.random() * specialChars.length),
	); // special char

	// Fill the rest with random characters
	for (let i = 3; i < 12; i++) {
		const allChars = letters + numbers + specialChars;
		password += allChars.charAt(Math.floor(Math.random() * allChars.length));
	}

	// Shuffle the password
	return password
		.split("")
		.sort(() => Math.random() - 0.5)
		.join("");
}

/**
 * Generate a random name for testing
 */
export function generateRandomName(): string {
	const firstNames = [
		"John",
		"Jane",
		"Mike",
		"Sarah",
		"David",
		"Lisa",
		"Tom",
		"Emma",
	];
	const lastNames = [
		"Smith",
		"Johnson",
		"Williams",
		"Brown",
		"Jones",
		"Garcia",
		"Miller",
	];

	const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
	const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

	return `${firstName} ${lastName}`;
}

/**
 * Wait for a specific condition with timeout
 */
export async function waitForCondition(
	condition: () => Promise<boolean>,
	timeout = 5000,
	interval = 100,
): Promise<boolean> {
	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		if (await condition()) {
			return true;
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}

	return false;
}

/**
 * Generate test user data
 */
export function generateTestUser() {
	return {
		name: generateRandomName(),
		email: generateRandomEmail(),
		username: generateRandomUsername(),
		password: generateValidPassword(),
	};
}

/**
 * Generate multiple test users
 */
export function generateTestUsers(count = 3) {
	const users = [];
	for (let i = 0; i < count; i++) {
		users.push(generateTestUser());
	}
	return users;
}

// Wait utilities
export const waitForPageLoad = async (page: Page) => {
	await page.waitForLoadState("networkidle");
};

export const waitForElement = async (
	page: Page,
	selector: string,
	timeout = 5000,
) => {
	await page.waitForSelector(selector, { timeout });
};

export const waitForElementToBeVisible = async (
	page: Page,
	selector: string,
	timeout = 5000,
) => {
	await page.waitForSelector(selector, { state: "visible", timeout });
};

export const waitForElementToBeHidden = async (
	page: Page,
	selector: string,
	timeout = 5000,
) => {
	await page.waitForSelector(selector, { state: "hidden", timeout });
};

// Navigation utilities
export const navigateToHome = async (page: Page) => {
	await page.goto("/");
	await waitForPageLoad(page);
};

export const navigateToCategory = async (page: Page, category: string) => {
	await page.goto(`/${category}`);
	await waitForPageLoad(page);
};

export const navigateToSubCategory = async (
	page: Page,
	category: string,
	subCategory: string,
) => {
	await page.goto(`/${category}/${subCategory}`);
	await waitForPageLoad(page);
};

export const navigateToSettings = async (page: Page, section?: string) => {
	const url = section ? `/settings/${section}` : "/settings";
	await page.goto(url);
	await waitForPageLoad(page);
};

// Authentication utilities
export const loginUser = async (page: Page, user: TestUser) => {
	await page.goto("/login");

	// Fill login form
	await page.fill('[data-testid="email-input"]', user.email);
	await page.fill('[data-testid="password-input"]', user.password);

	// Submit form
	await page.click('[data-testid="login-button"]');

	// Wait for successful login
	await page.waitForURL("**/", { timeout: 10000 });
};

export const logoutUser = async (page: Page) => {
	// Click on user menu
	await page.click('[data-testid="user-menu"]');

	// Click logout
	await page.click('[data-testid="logout-button"]');

	// Wait for redirect to home
	await page.waitForURL("/");
};

export const registerUser = async (
	page: Page,
	userData: {
		email: string;
		password: string;
		username: string;
		displayName: string;
	},
) => {
	await page.goto("/login");

	// Click on register tab/link
	await page.click('[data-testid="register-tab"]');

	// Fill registration form
	await page.fill('[data-testid="email-input"]', userData.email);
	await page.fill('[data-testid="password-input"]', userData.password);
	await page.fill('[data-testid="username-input"]', userData.username);
	await page.fill('[data-testid="display-name-input"]', userData.displayName);

	// Submit form
	await page.click('[data-testid="register-button"]');

	// Wait for registration success or email verification page
	await page.waitForURL("**/verify**", { timeout: 10000 });
};

// Form utilities
export const fillForm = async (
	page: Page,
	formData: Record<string, string>,
) => {
	for (const [field, value] of Object.entries(formData)) {
		await page.fill(`[data-testid="${field}-input"]`, value);
	}
};

export const submitForm = async (
	page: Page,
	submitButtonTestId = "submit-button",
) => {
	await page.click(`[data-testid="${submitButtonTestId}"]`);
};

export const clearForm = async (page: Page, fields: string[]) => {
	for (const field of fields) {
		await page.fill(`[data-testid="${field}-input"]`, "");
	}
};

// Content creation utilities
export const createPost = async (
	page: Page,
	postData: {
		title: string;
		content: string;
		type: string;
		difficulty: string;
		category: string;
		subCategory: string;
		topics?: string[];
		companies?: string[];
	},
) => {
	// Navigate to create post page
	await page.goto("/create");

	// Fill post form
	await page.fill('[data-testid="title-input"]', postData.title);
	await page.fill('[data-testid="content-editor"]', postData.content);
	await page.selectOption('[data-testid="type-select"]', postData.type);
	await page.selectOption(
		'[data-testid="difficulty-select"]',
		postData.difficulty,
	);
	await page.selectOption('[data-testid="category-select"]', postData.category);
	await page.selectOption(
		'[data-testid="subcategory-select"]',
		postData.subCategory,
	);

	// Add topics if provided
	if (postData.topics) {
		for (const topic of postData.topics) {
			await page.fill('[data-testid="topics-input"]', topic);
			await page.press('[data-testid="topics-input"]', "Enter");
		}
	}

	// Add companies if provided
	if (postData.companies) {
		for (const company of postData.companies) {
			await page.fill('[data-testid="companies-input"]', company);
			await page.press('[data-testid="companies-input"]', "Enter");
		}
	}

	// Submit form
	await page.click('[data-testid="create-post-button"]');

	// Wait for post creation
	await page.waitForURL("**/preview**", { timeout: 10000 });
};

export const createComment = async (page: Page, content: string) => {
	await page.fill('[data-testid="comment-input"]', content);
	await page.click('[data-testid="submit-comment-button"]');

	// Wait for comment to appear
	await page.waitForSelector('[data-testid="comment-item"]', { timeout: 5000 });
};

// Search utilities
export const searchContent = async (page: Page, query: string) => {
	await page.fill('[data-testid="search-input"]', query);
	await page.press('[data-testid="search-input"]', "Enter");

	// Wait for search results
	await page.waitForSelector('[data-testid="search-results"]', {
		timeout: 5000,
	});
};

// Voting utilities
export const voteOnPost = async (page: Page, voteType: "up" | "down") => {
	const buttonSelector =
		voteType === "up"
			? '[data-testid="upvote-button"]'
			: '[data-testid="downvote-button"]';

	await page.click(buttonSelector);

	// Wait for vote to be registered
	await page.waitForTimeout(1000);
};

// Bookmark utilities
export const bookmarkPost = async (page: Page) => {
	await page.click('[data-testid="bookmark-button"]');

	// Wait for bookmark to be saved
	await page.waitForTimeout(1000);
};

export const removeBookmark = async (page: Page) => {
	await page.click('[data-testid="bookmark-button"]');

	// Wait for bookmark to be removed
	await page.waitForTimeout(1000);
};

// Follow utilities
export const followUser = async (page: Page) => {
	await page.click('[data-testid="follow-button"]');

	// Wait for follow action to complete
	await page.waitForTimeout(1000);
};

export const unfollowUser = async (page: Page) => {
	await page.click('[data-testid="unfollow-button"]');

	// Wait for unfollow action to complete
	await page.waitForTimeout(1000);
};

// IDE utilities
export const writeCode = async (
	page: Page,
	code: string,
	language = "javascript",
) => {
	// Switch to code editor if needed
	await page.click('[data-testid="code-editor-tab"]');

	// Clear existing code
	await page.click('[data-testid="code-editor"]');
	await page.keyboard.press("Control+a");
	await page.keyboard.press("Delete");

	// Type new code
	await page.type('[data-testid="code-editor"]', code);
};

export const runCode = async (page: Page) => {
	await page.click('[data-testid="run-button"]');

	// Wait for code execution
	await page.waitForSelector('[data-testid="output-panel"]', {
		timeout: 10000,
	});
};

// Validation utilities
export const expectElementToBeVisible = async (
	page: Page,
	selector: string,
) => {
	await expect(page.locator(selector)).toBeVisible();
};

export const expectElementToBeHidden = async (page: Page, selector: string) => {
	await expect(page.locator(selector)).toBeHidden();
};

export const expectElementToHaveText = async (
	page: Page,
	selector: string,
	text: string,
) => {
	await expect(page.locator(selector)).toHaveText(text);
};

export const expectElementToContainText = async (
	page: Page,
	selector: string,
	text: string,
) => {
	await expect(page.locator(selector)).toContainText(text);
};

export const expectElementToHaveValue = async (
	page: Page,
	selector: string,
	value: string,
) => {
	await expect(page.locator(selector)).toHaveValue(value);
};

export const expectElementToBeEnabled = async (
	page: Page,
	selector: string,
) => {
	await expect(page.locator(selector)).toBeEnabled();
};

export const expectElementToBeDisabled = async (
	page: Page,
	selector: string,
) => {
	await expect(page.locator(selector)).toBeDisabled();
};

// URL validation utilities
export const expectCurrentURL = async (page: Page, expectedURL: string) => {
	await expect(page).toHaveURL(expectedURL);
};

export const expectCurrentURLToContain = async (
	page: Page,
	expectedPath: string,
) => {
	await expect(page).toHaveURL(new RegExp(expectedPath));
};

// Screenshot utilities
export const takeScreenshot = async (page: Page, name: string) => {
	await page.screenshot({ path: `test-results/screenshots/${name}.png` });
};

export const takeFullPageScreenshot = async (page: Page, name: string) => {
	await page.screenshot({
		path: `test-results/screenshots/${name}.png`,
		fullPage: true,
	});
};

// Error handling utilities
export const handleError = async (page: Page, errorMessage: string) => {
	const errorElement = page.locator('[data-testid="error-message"]');
	await expect(errorElement).toBeVisible();
	await expect(errorElement).toContainText(errorMessage);
};

export const expectNoErrors = async (page: Page) => {
	const errorElement = page.locator('[data-testid="error-message"]');
	await expect(errorElement).toBeHidden();
};

// Performance utilities
export const measurePageLoadTime = async (page: Page, url: string) => {
	const startTime = Date.now();
	await page.goto(url);
	await page.waitForLoadState("networkidle");
	const endTime = Date.now();
	return endTime - startTime;
};

// Accessibility utilities
export const checkAccessibility = async (page: Page) => {
	// Check for proper heading structure
	const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
	expect(headings.length).toBeGreaterThan(0);

	// Check for alt text on images
	const images = await page.locator("img").all();
	for (const img of images) {
		const alt = await img.getAttribute("alt");
		expect(alt).toBeTruthy();
	}

	// Check for form labels
	const inputs = await page.locator("input, textarea, select").all();
	for (const input of inputs) {
		const id = await input.getAttribute("id");
		if (id) {
			const label = await page.locator(`label[for="${id}"]`).count();
			expect(label).toBeGreaterThan(0);
		}
	}
};

// Data cleanup utilities
export const cleanupTestData = async (page: Page) => {
	// This would typically involve API calls to clean up test data
	// For now, we'll just clear localStorage and sessionStorage
	await page.evaluate(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
};
