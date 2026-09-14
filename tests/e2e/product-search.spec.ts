import { test } from "../../src/fixtures/e2e-fixtures";

/**
 * E2E tests: Product Search
 * Tags: @smoke @regression
 */

test.describe("Product Search", () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.navigate();
  });

  test("Products page loads and displays products @smoke", async ({
    productsPage,
  }) => {
    // Given I am on the products page
    await productsPage.expectOnProductsPage();

    // Then I should see a list of products
    await productsPage.expectProductsVisible();
  });

  test('Searching "dress" returns relevant results @smoke', async ({
    productsPage,
  }) => {
    // Given I am on the products page
    await productsPage.searchFor("dress");

    // Then I should see search results containing the term "dress"
    await productsPage.expectSearchHeading();
    await productsPage.expectProductsVisible();
    await productsPage.expectSearchResultsContain("dress");
  });

  test('Searching "tshirt" returns results @regression', async ({
    productsPage,
  }) => {
    // Given I am on the products page
    await productsPage.searchFor("tshirt");

    // Then I should see search results containing the term "tshirt"
    await productsPage.expectSearchHeading();
    await productsPage.expectProductsVisible();
  });

  test("Searching for a term with no results shows empty list @regression", async ({
    productsPage,
  }) => {
    // Given I am on the products pages
    await productsPage.searchFor("zzznonexistentproductxxx");

    // Then I should see a message indicating no results
    await productsPage.expectSearchHeading();
    await productsPage.expectNoSearchResults();
  });

  test("Product detail page opens from products list @regression", async ({
    productsPage,
  }) => {
    // Given I am on the products page
    await productsPage.clickFirstProductDetail();

    // Then I should be on the product detail page
    await productsPage.expectOnProductDetailPage();
  });
});
