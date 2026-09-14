import { test } from "../../src/fixtures/e2e-fixtures";

/**
 * E2E tests: Add to Cart
 * Tags: @smoke @regression
 */

test.describe("Add to Cart", () => {
  const productName = "Blue Top";

  test.beforeEach(async ({ productsPage }) => {
    await productsPage.navigate();
  });

  test("Adding a product shows confirmation modal @smoke", async ({
    productsPage,
  }) => {
    // Given I am on the products page
    await productsPage.addProductToCartByName(productName);

    // Then I should see a confirmation modal
    await productsPage.isCartModalVisible();
  });

  test("Item added to cart appears in cart page @smoke", async ({
    productsPage,
    cartPage,
  }) => {
    // Given I have added a product to the cart
    await productsPage.addProductToCartByName(productName);
    await productsPage.goToCartFromModal();

    // Then I should be on the cart page and see the product
    await cartPage.isOnCartPage();
    await cartPage.expectItemCount(1);
    await cartPage.expectProductInCart(productName);
  });

  test("Multiple products can be added to cart @regression", async ({
    productsPage,
    cartPage,
  }) => {
    // Given I have added multiple products to the cart
    await productsPage.addProductToCartByName(productName);
    await productsPage.continueShopping();

    // When I add another product to the cart
    await productsPage.addProductToCartByIndex(1);
    await productsPage.goToCartFromModal();

    // Then I should be on the cart page and see both products
    await cartPage.isOnCartPage();
    await cartPage.expectItemCount(2);
  });
});
