import { test, expect } from '../../src/fixtures/api-fixtures';
import { type ProductsApiResponse, type BrandsApiResponse } from '../../src/types/api.types';

/**
 * API tests: Products & Brands catalogue endpoints
 *
 * Coverage:
 *  - GET /api/productsList  → 200, well-formed product list
 *  - POST /api/productsList → 405 (method not supported)
 *  - GET /api/brandsList    → 200, well-formed brand list
 *  - PUT /api/brandsList    → 405 (method not supported)
 *
 * Tags: @smoke @regression
 */

test.describe('Products API', () => {
  test('GET productsList returns 200 with non-empty product array @smoke', async ({ api }) => {
    const response = await api.getProducts();

    expect(response.status()).toBe(200);

    const body = await response.json() as ProductsApiResponse;
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);
  });

  test('GET productsList product objects have required fields @regression', async ({ api }) => {
    const response = await api.getProducts();
    const body = await response.json() as ProductsApiResponse;

    // Spot-check the first few products for schema conformance
    const sample = body.products.slice(0, 5);
    for (const product of sample) {
      expect(typeof product.id).toBe('number');
      expect(typeof product.name).toBe('string');
      expect(product.name.length).toBeGreaterThan(0);
      expect(typeof product.price).toBe('string');
      expect(typeof product.brand).toBe('string');
      expect(product.category).toBeDefined();
      expect(typeof product.category.category).toBe('string');
      expect(product.category.usertype?.usertype).toBeDefined();
    }
  });

  test('POST to productsList returns 405 method not supported @regression', async ({ api }) => {
    const response = await api.postToProducts();

    // HTTP transport returns 200 but the API signals the error in the body
    const body = await response.json() as { responseCode: number; message: string };
    expect(body.responseCode).toBe(405);
    expect(body.message).toMatch(/not supported/i);
  });
});

test.describe('Brands API', () => {
  test('GET brandsList returns 200 with non-empty brand array @smoke', async ({ api }) => {
    const response = await api.getBrands();

    expect(response.status()).toBe(200);

    const body = await response.json() as BrandsApiResponse;
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.brands)).toBe(true);
    expect(body.brands.length).toBeGreaterThan(0);
  });

  test('GET brandsList brand objects have required fields @regression', async ({ api }) => {
    const response = await api.getBrands();
    const body = await response.json() as BrandsApiResponse;

    const sample = body.brands.slice(0, 5);
    for (const brand of sample) {
      expect(typeof brand.id).toBe('number');
      expect(typeof brand.brand).toBe('string');
      expect(brand.brand.length).toBeGreaterThan(0);
    }
  });

  test('PUT to brandsList returns 405 method not supported @regression', async ({ api }) => {
    const response = await api.putToBrands();

    const body = await response.json() as { responseCode: number; message: string };
    expect(body.responseCode).toBe(405);
    expect(body.message).toMatch(/not supported/i);
  });
});
