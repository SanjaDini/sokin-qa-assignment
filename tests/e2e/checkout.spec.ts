import { test } from "../../src/fixtures/e2e-fixtures";
import { EXISTING_USER } from "../../src/data/test-data";

/**
 * E2E tests: Full Checkout Flow
 * Tags: @smoke @regression
 */
const productName = "Blue Top";

test.describe("Checkout Flow", () => {
  test("Logged-in user can complete a purchase @smoke", async ({
    loginPage,
    homePage,
    productsPage,
    cartPage,
    checkoutPage,
    paymentPage,
  }) => {
    // Given I am a logged-in user
    await loginPage.navigate();
    await loginPage.login(EXISTING_USER.email, EXISTING_USER.password);
    await homePage.expectLoggedIn();

    // When I add a product to the cart and proceed to checkout
    await productsPage.navigate();
    await productsPage.addProductToCartByName(productName);
    await productsPage.goToCartFromModal();

    await cartPage.isOnCartPage();
    await cartPage.expectItemCount(1);

    await cartPage.proceedToCheckout();
    await checkoutPage.isOnCheckoutPage();

    // Then I should see the delivery address section and be able to place an order
    await checkoutPage.expectDeliveryAddressVisible();
    await checkoutPage.fillComment("Please deliver before 5pm. Thank you.");
    await checkoutPage.placeOrder();

    // And I should be redirected to the payment page and be able to complete the payment
    await paymentPage.isOnPaymentPage();
    await paymentPage.fillPaymentDetails();
    await paymentPage.submitPayment();

    // And I should see an order confirmation message
    await paymentPage.expectOrderPlaced();
  });

  test("Guest user is prompted to log in when checking out @regression", async ({
    productsPage,
    cartPage,
  }) => {
    // Given I am a guest user
    await productsPage.navigate();

    // When I add a product to the cart
    await productsPage.addProductToCartByName(productName);
    await productsPage.goToCartFromModal();

    // Then I should be prompted to log in when I try to proceed to checkout
    await cartPage.proceedToCheckout();
    await cartPage.expectGuestCheckoutModal();
  });

  test("Checkout address section is populated for logged-in user @regression", async ({
    loginPage,
    homePage,
    productsPage,
    cartPage,
    checkoutPage,
  }) => {
    // Given I am a logged-in user
    await loginPage.navigate();
    await loginPage.login(EXISTING_USER.email, EXISTING_USER.password);
    await homePage.expectLoggedIn();

    // When I add a product to the cart and proceed to checkout
    await productsPage.navigate();
    await productsPage.addProductToCartByName(productName);
    await productsPage.goToCartFromModal();

    // Then the checkout address section should be populated with the user's saved addresses
    await cartPage.proceedToCheckout();
    await checkoutPage.isOnCheckoutPage();

    // And I should see the delivery and billing addresses pre-filled with the user's saved information
    await checkoutPage.expectDeliveryAddressVisible(EXISTING_USER.name);
    await checkoutPage.expectBillingAddressVisible();
    await checkoutPage.expectOrderItemsPresent();
  });
});
