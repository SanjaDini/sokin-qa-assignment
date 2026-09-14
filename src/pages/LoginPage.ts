import { expect, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Login / Signup Page
 */
export class LoginPage extends BasePage {
  // Login section
  readonly loginEmail = this.page.locator('[data-qa="login-email"]');
  readonly loginPassword = this.page.locator('[data-qa="login-password"]');
  readonly loginButton = this.page.locator('[data-qa="login-button"]');
  readonly loginError = this.page.getByText(
    "Your email or password is incorrect!",
  );

  // Signup section
  readonly signupName = this.page.locator('[data-qa="signup-name"]');
  readonly signupEmail = this.page.locator('[data-qa="signup-email"]');
  readonly signupButton = this.page.locator('[data-qa="signup-button"]');
  readonly signupError = this.page.getByText("Email Address already exist!");

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/login");
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginButton.click();
  }

  async startSignup(name: string, email: string): Promise<void> {
    await this.signupName.fill(name);
    await this.signupEmail.fill(email);
    await this.signupButton.click();
  }

  async isLoginErrorVisible(): Promise<boolean> {
    return this.loginError.isVisible();
  }

  async isSignupErrorVisible(): Promise<boolean> {
    return this.signupError.isVisible();
  }

  async expectLoginError(): Promise<void> {
    await expect(this.loginError).toBeVisible();
  }

  async expectSignupError(): Promise<void> {
    await expect(this.signupError).toBeVisible();
  }

  async expectOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/login/);
  }
}
