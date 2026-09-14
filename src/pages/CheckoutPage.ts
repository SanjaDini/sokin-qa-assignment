import { expect, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Checkout Page
 */
export class CheckoutPage extends BasePage {
  // Address sections
  readonly deliveryAddress = this.page.locator("#address_delivery");
  readonly billingAddress = this.page.locator("#address_invoice");

  // Order items
  readonly orderItems = this.page.locator("tbody tr");

  // Comment and Place Order
  readonly commentTextarea = this.page.locator('textarea[name="message"]');
  readonly placeOrderButton = this.page.getByText("Place Order");

  constructor(page: Page) {
    super(page);
  }

  async isOnCheckoutPage(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout/);
  }

  async fillComment(comment: string): Promise<void> {
    await this.commentTextarea.fill(comment);
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
  }

  async expectDeliveryAddressVisible(containsName?: string): Promise<void> {
    await expect(this.deliveryAddress).toBeVisible();
    if (containsName)
      await expect(this.deliveryAddress).toContainText(containsName);
  }

  async expectBillingAddressVisible(): Promise<void> {
    await expect(this.billingAddress).toBeVisible();
    const text = await this.billingAddress.innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  }

  async expectOrderItemsPresent(): Promise<void> {
    const count = await this.orderItems.count();
    expect(count).toBeGreaterThanOrEqual(1);
  }
}
