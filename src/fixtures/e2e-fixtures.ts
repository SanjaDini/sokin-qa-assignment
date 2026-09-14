import { test as base } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { ProductsPage } from "../pages/ProductsPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { PaymentPage } from "../pages/PaymentPage";

/**
 * Ad/tracking domains whose requests are aborted before they reach the browser.
 * Blocking these prevents Google Ads overlays from rendering and intercepting clicks.
 */
const BLOCKED_DOMAINS = [
  "googlesyndication.com",
  "doubleclick.net",
  "googletagmanager.com",
  "googletagservices.com",
  "google-analytics.com",
  "adservice.google.com",
];

type E2EFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  paymentPage: PaymentPage;
};

export const test = base.extend<E2EFixtures>({
  page: async ({ page }, use) => {
    await page.route(
      (url) => BLOCKED_DOMAINS.some((domain) => url.hostname.includes(domain)),
      (route) => route.abort(),
    );
    await use(page);
  },

  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  paymentPage: async ({ page }, use) => use(new PaymentPage(page)),
});

export { expect } from "@playwright/test";
