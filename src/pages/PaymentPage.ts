import { expect, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TEST_CARD } from "../data/test-data";

/**
 * Payment Page
 */
export class PaymentPage extends BasePage {
  // ── Payment form ──────────────────────────────────────────────────────────
  readonly nameOnCard = this.page.locator('[data-qa="name-on-card"]');
  readonly cardNumber = this.page.locator('[data-qa="card-number"]');
  readonly cvc = this.page.locator('[data-qa="cvc"]');
  readonly expiryMonth = this.page.locator('[data-qa="expiry-month"]');
  readonly expiryYear = this.page.locator('[data-qa="expiry-year"]');
  readonly payButton = this.page.locator('[data-qa="pay-button"]');

  // ── Order confirmation ────────────────────────────────────────────────────
  readonly orderSuccessHeading = this.page.locator('[data-qa="order-placed"]');
  readonly orderSuccessMessage = this.page.getByText(
    "Your order has been confirmed",
  );

  constructor(page: Page) {
    super(page);
  }

  async fillPaymentDetails(
    options: {
      name?: string;
      cardNumber?: string;
      cvc?: string;
      month?: string;
      year?: string;
    } = {},
  ): Promise<void> {
    const card = { ...TEST_CARD, ...options };
    await this.nameOnCard.fill(card.name);
    await this.cardNumber.fill(card.cardNumber);
    await this.cvc.fill(card.cvc);
    await this.expiryMonth.fill(card.month);
    await this.expiryYear.fill(card.year);
  }

  async submitPayment(): Promise<void> {
    await this.payButton.click();
  }

  async isOnPaymentPage(): Promise<void> {
    await expect(this.page).toHaveURL(/payment/);
  }

  async expectOrderPlaced(): Promise<void> {
    await expect(this.orderSuccessHeading).toBeVisible({ timeout: 15_000 });
    await expect(this.orderSuccessMessage).toBeVisible();
  }
}
