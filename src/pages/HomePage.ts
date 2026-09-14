import { expect, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Home Page
 */
export class HomePage extends BasePage {
  // Nav bar
  readonly signupLoginLink = this.page.locator('a[href="/login"]');
  readonly logoutLink = this.page.locator('a[href="/logout"]');
  readonly deleteAccountLink = this.page.locator('a[href="/delete_account"]');
  readonly cartLink = this.page.locator('a[href="/view_cart"]');
  readonly productsLink = this.page.locator('a[href="/products"]');
  readonly loggedInAs = this.page.getByText("Logged in as");

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/");
  }

  async isLoggedIn(): Promise<boolean> {
    return this.loggedInAs.isVisible();
  }

  async goToLoginPage(): Promise<void> {
    await this.signupLoginLink.click();
  }

  async goToProducts(): Promise<void> {
    await this.productsLink.click();
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }

  async expectLoggedIn(name?: string): Promise<void> {
    await expect(this.loggedInAs).toBeVisible();
    if (name) await expect(this.loggedInAs).toContainText(name);
  }

  async expectLoggedOut(): Promise<void> {
    await expect(this.page).toHaveURL(/login/);
    await expect(this.loggedInAs).not.toBeVisible();
  }

  async expectOnHomePage(): Promise<void> {
    await expect(this.page).toHaveURL("/");
  }

  async expectAccountDeleted(): Promise<void> {
    await expect(
      this.page.locator('[data-qa="account-deleted"]'),
    ).toBeVisible();
  }
}
