import { test, expect } from "../../src/fixtures/api-fixtures";
import { type ProductsApiResponse } from "../../src/types/api.types";
import { SEARCH_TERMS } from "../../src/data/test-data";

/**
 * API tests: Product Search endpoint
 *
 * Coverage:
 *  - POST /api/searchProduct with valid term   → 200, relevant results
 *  - POST /api/searchProduct missing parameter → 400 bad request
 *  - Multiple valid search terms (parametric)
 *  - Search term with no expected results (empty array is still a valid response)
 *
 * Tags: @smoke @regression
 */

test.describe("Search Product API", () => {
  test('POST searchProduct with "top" returns 200 and product list @smoke', async ({
    api,
  }) => {
    const response = await api.searchProduct("top");

    expect(response.status()).toBe(200);

    const body = (await response.json()) as ProductsApiResponse;
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);
  });

  test("POST searchProduct results contain the search term in product name or category @regression", async ({
    api,
  }) => {
    const term = "top";
    const response = await api.searchProduct(term);
    const body = (await response.json()) as ProductsApiResponse;

    // At least one result should relate to the searched term (case-insensitive)
    const relevant = body.products.some(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.category.toLowerCase().includes(term),
    );
    expect(relevant).toBe(true);
  });

  // Parametric: run the same structural assertions for multiple search terms
  for (const term of SEARCH_TERMS.valid) {
    test(`POST searchProduct with "${term}" returns products @regression`, async ({
      api,
    }) => {
      const response = await api.searchProduct(term);
      const body = (await response.json()) as ProductsApiResponse;

      expect(body.responseCode).toBe(200);
      expect(Array.isArray(body.products)).toBe(true);
      // We assert the array exists; we don't require results (term may be very specific)
    });
  }

  test("POST searchProduct without parameter returns 400 @smoke", async ({
    api,
  }) => {
    const response = await api.searchProductMissingParam();

    const body = (await response.json()) as {
      responseCode: number;
      message: string;
    };
    expect(body.responseCode).toBe(400);
    expect(body.message).toMatch(/missing/i);
  });

  test("POST searchProduct with obscure term returns 200 and empty or small list @regression", async ({
    api,
  }) => {
    const response = await api.searchProduct(SEARCH_TERMS.noResults);
    const body = (await response.json()) as ProductsApiResponse;

    // The API should still return 200; the list may simply be empty
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
  });
});
