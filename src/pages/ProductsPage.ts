import { expect, type Page, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Products Catalogue Page
 */
export class ProductsPage extends BasePage {
  // ── Search ────────────────────────────────────────────────────────────────
  readonly searchInput = this.page.locator("#search_product");
  readonly searchButton = this.page.locator("#submit_search");
  readonly searchedProductsHeading = this.page.getByRole("heading", {
    name: /Searched Products/i,
  });

  // ── Product grid ──────────────────────────────────────────────────────────
  readonly productCards = this.page.locator(
    ".features_items .product-image-wrapper",
  );
  readonly productNames = this.page.locator(".features_items .productinfo p");

  // ── "View product" detail links ───────────────────────────────────────────
  readonly viewProductLinks = this.page.locator(".choose a");

  // ── Product detail page ───────────────────────────────────────────────────
  readonly productDetailHeading = this.page.locator(".product-information h2");

  // ── "Add to cart" overlay buttons on hover ────────────────────────────────
  readonly addToCartButtons = this.page.locator(
    ".product-overlay .add-to-cart",
  );

  // ── Modal after adding to cart ────────────────────────────────────────────
  readonly cartModal = this.page.locator(".modal-content");
  readonly cartModalHeading = this.page.locator(".modal-header h4");
  readonly viewCartModalButton = this.page.locator(
    ".modal-body a[href='/view_cart']",
  );
  readonly continueShoppingButton = this.page.getByRole("button", {
    name: "Continue Shopping",
  });

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto("/products");
  }

  async searchFor(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async getProductNames(): Promise<string[]> {
    return this.productNames.allTextContents();
  }

  private async clickAddToCartButton(card: Locator): Promise<void> {
    await card.hover();
    await card.locator(".add-to-cart").first().click();
  }

  async addProductToCartByIndex(index: number): Promise<void> {
    const card = this.productCards.nth(index);
    await this.clickAddToCartButton(card);
  }

  async addProductToCartByName(name: string): Promise<void> {
    const card = this.page
      .locator(".features_items .productinfo p")
      .filter({ hasText: name })
      .first()
      .locator("../..");

    await this.clickAddToCartButton(card);
  }

  async isCartModalVisible(): Promise<void> {
    await expect(this.cartModal).toBeVisible();
    await expect(this.cartModalHeading).toContainText("Added!");
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async goToCartFromModal(): Promise<void> {
    await this.viewCartModalButton.click();
  }

  async clickFirstProductDetail(): Promise<void> {
    await this.viewProductLinks.first().click();
  }

  async expectOnProductsPage(): Promise<void> {
    await expect(this.page).toHaveURL(/products/);
  }

  async expectProductsVisible(): Promise<void> {
    const count = await this.productCards.count();
    expect(count).toBeGreaterThan(0);
  }

  async expectSearchHeading(): Promise<void> {
    await expect(this.searchedProductsHeading).toContainText(
      "Searched Products",
    );
  }

  async expectSearchResultsContain(term: string): Promise<void> {
    const names = await this.getProductNames();
    expect(
      names.some((n) => n.toLowerCase().includes(term.toLowerCase())),
    ).toBe(true);
  }

  async expectNoSearchResults(): Promise<void> {
    const count = await this.productCards.count();
    expect(count).toBe(0);
  }

  async expectOnProductDetailPage(): Promise<void> {
    await expect(this.page).toHaveURL(/product_details/);
    await expect(this.productDetailHeading).toBeVisible();
  }
}
