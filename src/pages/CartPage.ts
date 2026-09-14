import { expect, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Cart Page
 */
export class CartPage extends BasePage {
  // ── Cart items table ──────────────────────────────────────────────────────
  readonly cartRows = this.page.locator("tbody tr");
  readonly productNames = this.page.locator(".cart_description h4 a");
  readonly productPrices = this.page.locator(".cart_price p");
  readonly productQuantities = this.page.locator(".cart_quantity button");
  readonly productTotals = this.page.locator(".cart_total p");
  readonly proceedToCheckoutButton = this.page.getByText("Proceed To Checkout");
  readonly guestCheckoutModal = this.page.locator(
    '.modal-body a[href="/login"]',
  );

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/view_cart");
  }

  async getCartItemCount(): Promise<number> {
    return this.cartRows.count();
  }

  async getProductNames(): Promise<string[]> {
    return this.productNames.allTextContents();
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton.click();
  }

  async isEmpty(): Promise<boolean> {
    const count = await this.cartRows.count();
    return count === 0;
  }

  async expectItemCount(atLeast: number): Promise<void> {
    const count = await this.cartRows.count();
    expect(count).toBeGreaterThanOrEqual(atLeast);
  }

  async expectProductInCart(name: string): Promise<void> {
    const names = await this.getProductNames();
    expect(names.some((n) => n.includes(name))).toBe(true);
  }

  async isOnCartPage(): Promise<void> {
    await expect(this.page).toHaveURL(/view_cart/);
  }

  async expectGuestCheckoutModal(): Promise<void> {
    await expect(this.guestCheckoutModal).toBeVisible();
  }
}
