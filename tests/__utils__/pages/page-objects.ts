import { Page, Locator, expect } from "@playwright/test";

// Base Page Object class
export abstract class BasePage {
	protected page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	// Common navigation methods
	async goto(path: string) {
		await this.page.goto(path);
		await this.page.waitForLoadState("networkidle");
	}

	async waitForPageLoad() {
		await this.page.waitForLoadState("networkidle");
	}

	// Common element getters
	get loadingSpinner(): Locator {
		return this.page.locator('[data-testid="loading-spinner"]');
	}

	get errorMessage(): Locator {
		return this.page.locator('[data-testid="error-message"]');
	}

	get successMessage(): Locator {
		return this.page.locator('[data-testid="success-message"]');
	}

	// Common actions
	async waitForLoadingToComplete() {
		await this.loadingSpinner.waitFor({ state: "hidden", timeout: 10000 });
	}

	async expectNoErrors() {
		await expect(this.errorMessage).toBeHidden();
	}

	async expectSuccessMessage(message: string) {
		await expect(this.successMessage).toBeVisible();
		await expect(this.successMessage).toContainText(message);
	}
}

// Register Page Object
export class RegisterPage extends BasePage {
	get emailInput(): Locator {
		return this.page.locator('[data-testid="email-input"]');
	}

	get passwordInput(): Locator {
		return this.page.locator('[data-testid="password-input"]');
	}

	get usernameInput(): Locator {
		return this.page.locator('[data-testid="username-input"]');
	}

	get displayNameInput(): Locator {
		return this.page.locator('[data-testid="display-name-input"]');
	}

	get registerButton(): Locator {
		return this.page.locator('[data-testid="register-button"]');
	}

	get termsCheckbox(): Locator {
		return this.page.locator('[data-testid="terms-checkbox"]');
	}

	get registerTab(): Locator {
		return this.page.locator('[data-testid="register-tab"]');
	}

	async register(userData: {
		email: string;
		password: string;
		username: string;
		displayName: string;
		acceptTerms?: boolean;
	}) {
		await this.emailInput.fill(userData.email);
		await this.passwordInput.fill(userData.password);
		await this.usernameInput.fill(userData.username);
		await this.displayNameInput.fill(userData.displayName);

		if (userData.acceptTerms) {
			await this.termsCheckbox.check();
		}

		await this.registerButton.click();
	}

	async clickRegisterTab() {
		await this.registerTab.click();
	}

	async expectRegistrationFormToBeVisible() {
		await expect(this.emailInput).toBeVisible();
		await expect(this.passwordInput).toBeVisible();
		await expect(this.usernameInput).toBeVisible();
		await expect(this.displayNameInput).toBeVisible();
	}
}

// Login Page Object
export class LoginPage extends BasePage {
	get emailInput(): Locator {
		return this.page.locator('[data-testid="email-input"]');
	}

	get passwordInput(): Locator {
		return this.page.locator('[data-testid="password-input"]');
	}

	get loginButton(): Locator {
		return this.page.locator('[data-testid="login-button"]');
	}

	get registerTab(): Locator {
		return this.page.locator('[data-testid="register-tab"]');
	}

	get forgotPasswordLink(): Locator {
		return this.page.locator('[data-testid="forgot-password-link"]');
	}

	get socialLoginButtons(): Locator {
		return this.page.locator('[data-testid="social-login-button"]');
	}

	async login(email: string, password: string) {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.loginButton.click();
	}

	async clickRegisterTab() {
		await this.registerTab.click();
	}

	async clickForgotPassword() {
		await this.forgotPasswordLink.click();
	}

	async expectLoginFormToBeVisible() {
		await expect(this.emailInput).toBeVisible();
		await expect(this.passwordInput).toBeVisible();
		await expect(this.loginButton).toBeVisible();
	}

	async expectValidationError(message: string) {
		await expect(
			this.page.locator('[data-testid="validation-error"]'),
		).toContainText(message);
	}
}

// Home Page Object
export class HomePage extends BasePage {
	get navigationMenu(): Locator {
		return this.page.locator('[data-testid="navigation-menu"]');
	}

	get searchInput(): Locator {
		return this.page.locator('[data-testid="search-input"]');
	}

	get categoryCards(): Locator {
		return this.page.locator('[data-testid="category-card"]');
	}

	get featuredPosts(): Locator {
		return this.page.locator('[data-testid="featured-post"]');
	}

	async search(query: string) {
		await this.searchInput.fill(query);
		await this.searchInput.press("Enter");
	}

	async clickCategory(categoryName: string) {
		await this.page.locator(`[data-testid="category-${categoryName}"]`).click();
	}

	async expectToBeOnHomePage() {
		await expect(this.page).toHaveURL("/");
	}
}

// Category Page Object
export class CategoryPage extends BasePage {
	get categoryTitle(): Locator {
		return this.page.locator('[data-testid="category-title"]');
	}

	get subcategoryTabs(): Locator {
		return this.page.locator('[data-testid="subcategory-tab"]');
	}

	get postCards(): Locator {
		return this.page.locator('[data-testid="post-card"]');
	}

	get filterDropdown(): Locator {
		return this.page.locator('[data-testid="filter-dropdown"]');
	}

	get sortDropdown(): Locator {
		return this.page.locator('[data-testid="sort-dropdown"]');
	}

	async clickSubcategory(subcategoryName: string) {
		await this.page
			.locator(`[data-testid="subcategory-${subcategoryName}"]`)
			.click();
	}

	async filterByDifficulty(difficulty: string) {
		await this.filterDropdown.click();
		await this.page.locator(`[data-testid="filter-${difficulty}"]`).click();
	}

	async sortBy(sortOption: string) {
		await this.sortDropdown.click();
		await this.page.locator(`[data-testid="sort-${sortOption}"]`).click();
	}

	async clickPostCard(postIndex: number) {
		await this.postCards.nth(postIndex).click();
	}

	async expectCategoryTitle(title: string) {
		await expect(this.categoryTitle).toHaveText(title);
	}
}

// Post Detail Page Object
export class PostDetailPage extends BasePage {
	get postTitle(): Locator {
		return this.page.locator('[data-testid="post-title"]');
	}

	get postContent(): Locator {
		return this.page.locator('[data-testid="post-content"]');
	}

	get authorInfo(): Locator {
		return this.page.locator('[data-testid="author-info"]');
	}

	get upvoteButton(): Locator {
		return this.page.locator('[data-testid="upvote-button"]');
	}

	get downvoteButton(): Locator {
		return this.page.locator('[data-testid="downvote-button"]');
	}

	get bookmarkButton(): Locator {
		return this.page.locator('[data-testid="bookmark-button"]');
	}

	get shareButton(): Locator {
		return this.page.locator('[data-testid="share-button"]');
	}

	get commentSection(): Locator {
		return this.page.locator('[data-testid="comment-section"]');
	}

	get commentInput(): Locator {
		return this.page.locator('[data-testid="comment-input"]');
	}

	get submitCommentButton(): Locator {
		return this.page.locator('[data-testid="submit-comment-button"]');
	}

	get comments(): Locator {
		return this.page.locator('[data-testid="comment-item"]');
	}

	async vote(voteType: "up" | "down") {
		if (voteType === "up") {
			await this.upvoteButton.click();
		} else {
			await this.downvoteButton.click();
		}
	}

	async bookmark() {
		await this.bookmarkButton.click();
	}

	async share() {
		await this.shareButton.click();
	}

	async addComment(content: string) {
		await this.commentInput.fill(content);
		await this.submitCommentButton.click();
	}

	async expectPostTitle(title: string) {
		await expect(this.postTitle).toHaveText(title);
	}

	async expectCommentToBeVisible(content: string) {
		await expect(this.comments.filter({ hasText: content })).toBeVisible();
	}
}

// Create Post Page Object
export class CreatePostPage extends BasePage {
	get titleInput(): Locator {
		return this.page.locator('[data-testid="title-input"]');
	}

	get contentEditor(): Locator {
		return this.page.locator('[data-testid="content-editor"]');
	}

	get typeSelect(): Locator {
		return this.page.locator('[data-testid="type-select"]');
	}

	get difficultySelect(): Locator {
		return this.page.locator('[data-testid="difficulty-select"]');
	}

	get categorySelect(): Locator {
		return this.page.locator('[data-testid="category-select"]');
	}

	get subcategorySelect(): Locator {
		return this.page.locator('[data-testid="subcategory-select"]');
	}

	get topicsInput(): Locator {
		return this.page.locator('[data-testid="topics-input"]');
	}

	get companiesInput(): Locator {
		return this.page.locator('[data-testid="companies-input"]');
	}

	get createButton(): Locator {
		return this.page.locator('[data-testid="create-post-button"]');
	}

	get saveDraftButton(): Locator {
		return this.page.locator('[data-testid="save-draft-button"]');
	}

	get previewButton(): Locator {
		return this.page.locator('[data-testid="preview-button"]');
	}

	async createPost(postData: {
		title: string;
		content: string;
		type: string;
		difficulty: string;
		category: string;
		subCategory: string;
		topics?: string[];
		companies?: string[];
	}) {
		await this.titleInput.fill(postData.title);
		await this.contentEditor.fill(postData.content);
		await this.typeSelect.selectOption(postData.type);
		await this.difficultySelect.selectOption(postData.difficulty);
		await this.categorySelect.selectOption(postData.category);
		await this.subcategorySelect.selectOption(postData.subCategory);

		if (postData.topics) {
			for (const topic of postData.topics) {
				await this.topicsInput.fill(topic);
				await this.topicsInput.press("Enter");
			}
		}

		if (postData.companies) {
			for (const company of postData.companies) {
				await this.companiesInput.fill(company);
				await this.companiesInput.press("Enter");
			}
		}

		await this.createButton.click();
	}

	async saveDraft() {
		await this.saveDraftButton.click();
	}

	async preview() {
		await this.previewButton.click();
	}

	async expectFormToBeVisible() {
		await expect(this.titleInput).toBeVisible();
		await expect(this.contentEditor).toBeVisible();
		await expect(this.typeSelect).toBeVisible();
	}
}

// Settings Page Object
export class SettingsPage extends BasePage {
	get profileTab(): Locator {
		return this.page.locator('[data-testid="settings-profile-tab"]');
	}

	get accountTab(): Locator {
		return this.page.locator('[data-testid="settings-account-tab"]');
	}

	get notificationsTab(): Locator {
		return this.page.locator('[data-testid="settings-notifications-tab"]');
	}

	get appearanceTab(): Locator {
		return this.page.locator('[data-testid="settings-appearance-tab"]');
	}

	get saveButton(): Locator {
		return this.page.locator('[data-testid="save-button"]');
	}

	async clickTab(tabName: string) {
		await this.page.locator(`[data-testid="settings-${tabName}-tab"]`).click();
	}

	async saveChanges() {
		await this.saveButton.click();
	}

	async expectSettingsPageToBeVisible() {
		await expect(this.profileTab).toBeVisible();
		await expect(this.accountTab).toBeVisible();
	}
}

// Profile Settings Page Object
export class ProfileSettingsPage extends SettingsPage {
	get displayNameInput(): Locator {
		return this.page.locator('[data-testid="display-name-input"]');
	}

	get bioTextarea(): Locator {
		return this.page.locator('[data-testid="bio-textarea"]');
	}

	get jobTitleInput(): Locator {
		return this.page.locator('[data-testid="job-title-input"]');
	}

	get companyInput(): Locator {
		return this.page.locator('[data-testid="company-input"]');
	}

	get locationInput(): Locator {
		return this.page.locator('[data-testid="location-input"]');
	}

	get profileImageUpload(): Locator {
		return this.page.locator('[data-testid="profile-image-upload"]');
	}

	async updateProfile(profileData: {
		displayName?: string;
		bio?: string;
		jobTitle?: string;
		company?: string;
		location?: string;
	}) {
		if (profileData.displayName) {
			await this.displayNameInput.fill(profileData.displayName);
		}
		if (profileData.bio) {
			await this.bioTextarea.fill(profileData.bio);
		}
		if (profileData.jobTitle) {
			await this.jobTitleInput.fill(profileData.jobTitle);
		}
		if (profileData.company) {
			await this.companyInput.fill(profileData.company);
		}
		if (profileData.location) {
			await this.locationInput.fill(profileData.location);
		}

		await this.saveChanges();
	}

	async uploadProfileImage(filePath: string) {
		await this.profileImageUpload.setInputFiles(filePath);
	}
}

// Challenge Page Object
export class ChallengePage extends BasePage {
	get challengeTitle(): Locator {
		return this.page.locator('[data-testid="challenge-title"]');
	}

	get challengeDescription(): Locator {
		return this.page.locator('[data-testid="challenge-description"]');
	}

	get startChallengeButton(): Locator {
		return this.page.locator('[data-testid="start-challenge-button"]');
	}

	get codeEditor(): Locator {
		return this.page.locator('[data-testid="code-editor"]');
	}

	get runButton(): Locator {
		return this.page.locator('[data-testid="run-button"]');
	}

	get submitButton(): Locator {
		return this.page.locator('[data-testid="submit-button"]');
	}

	get outputPanel(): Locator {
		return this.page.locator('[data-testid="output-panel"]');
	}

	get languageSelector(): Locator {
		return this.page.locator('[data-testid="language-selector"]');
	}

	async startChallenge() {
		await this.startChallengeButton.click();
	}

	async writeCode(code: string) {
		await this.codeEditor.fill(code);
	}

	async runCode() {
		await this.runButton.click();
	}

	async submitSolution() {
		await this.submitButton.click();
	}

	async selectLanguage(language: string) {
		await this.languageSelector.selectOption(language);
	}

	async expectChallengeToBeVisible() {
		await expect(this.challengeTitle).toBeVisible();
		await expect(this.challengeDescription).toBeVisible();
	}

	async expectOutputToContain(text: string) {
		await expect(this.outputPanel).toContainText(text);
	}
}

// Admin Panel Page Object
export class AdminPanelPage extends BasePage {
	get usersTab(): Locator {
		return this.page.locator('[data-testid="admin-users-tab"]');
	}

	get postsTab(): Locator {
		return this.page.locator('[data-testid="admin-posts-tab"]');
	}

	get reportsTab(): Locator {
		return this.page.locator('[data-testid="admin-reports-tab"]');
	}

	get userRows(): Locator {
		return this.page.locator('[data-testid="user-row"]');
	}

	get postRows(): Locator {
		return this.page.locator('[data-testid="post-row"]');
	}

	get banUserButton(): Locator {
		return this.page.locator('[data-testid="ban-user-button"]');
	}

	get approvePostButton(): Locator {
		return this.page.locator('[data-testid="approve-post-button"]');
	}

	get rejectPostButton(): Locator {
		return this.page.locator('[data-testid="reject-post-button"]');
	}

	async clickTab(tabName: string) {
		await this.page.locator(`[data-testid="admin-${tabName}-tab"]`).click();
	}

	async banUser(userIndex: number) {
		await this.userRows
			.nth(userIndex)
			.locator('[data-testid="ban-user-button"]')
			.click();
	}

	async approvePost(postIndex: number) {
		await this.postRows
			.nth(postIndex)
			.locator('[data-testid="approve-post-button"]')
			.click();
	}

	async rejectPost(postIndex: number) {
		await this.postRows
			.nth(postIndex)
			.locator('[data-testid="reject-post-button"]')
			.click();
	}

	async expectAdminPanelToBeVisible() {
		await expect(this.usersTab).toBeVisible();
		await expect(this.postsTab).toBeVisible();
		await expect(this.reportsTab).toBeVisible();
	}
}
