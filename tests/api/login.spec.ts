import { test, expect } from '../../src/fixtures/api-fixtures';
import { EXISTING_USER, buildUserPayload } from '../../src/data/test-data';

/**
 * API tests: Login / Verify endpoint
 *
 * Coverage:
 *  - POST /api/verifyLogin valid credentials       → 200 "User exists!"
 *  - POST /api/verifyLogin invalid credentials     → 404 "User not found!"
 *  - POST /api/verifyLogin missing email param     → 400 bad request
 *  - DELETE /api/verifyLogin                       → 405 method not supported
 *  - Newly created user can verify login
 *
 * Tags: @smoke @regression
 */

test.describe('Verify Login API', () => {
  test('POST verifyLogin with valid credentials returns 200 @smoke', async ({ api }) => {
    const response = await api.verifyLogin(EXISTING_USER.email, EXISTING_USER.password);

    expect(response.status()).toBe(200);

    const body = await response.json() as { responseCode: number; message: string };
    expect(body.responseCode).toBe(200);
    expect(body.message).toBe('User exists!');
  });

  test('POST verifyLogin with invalid credentials returns 404 @regression', async ({ api }) => {
    const response = await api.verifyLogin('nobody@nowhere.invalid', 'WrongPass999!');

    const body = await response.json() as { responseCode: number; message: string };
    expect(body.responseCode).toBe(404);
    expect(body.message).toMatch(/not found/i);
  });

  test('POST verifyLogin with wrong password returns 404 @regression', async ({ api }) => {
    const response = await api.verifyLogin(EXISTING_USER.email, 'DefinitelyWrong!');

    const body = await response.json() as { responseCode: number; message: string };
    expect(body.responseCode).toBe(404);
  });

  test('POST verifyLogin missing email param returns 400 @regression', async ({ api }) => {
    const response = await api.verifyLoginMissingEmail(EXISTING_USER.password);

    const body = await response.json() as { responseCode: number; message: string };
    expect(body.responseCode).toBe(400);
    expect(body.message).toMatch(/missing/i);
  });

  test('DELETE verifyLogin returns 405 method not supported @regression', async ({ api }) => {
    const response = await api.deleteVerifyLogin();

    const body = await response.json() as { responseCode: number; message: string };
    expect(body.responseCode).toBe(405);
    expect(body.message).toMatch(/not supported/i);
  });

  test('Newly created user can verify login @regression', async ({ api }) => {
    const payload = buildUserPayload();

    // Create the user first
    const createResp = await api.createUser(payload);
    const createBody = await createResp.json() as { responseCode: number };
    expect(createBody.responseCode).toBe(201);

    // Verify login succeeds
    const loginResp = await api.verifyLogin(payload.email, payload.password);
    const loginBody = await loginResp.json() as { responseCode: number; message: string };
    expect(loginBody.responseCode).toBe(200);
    expect(loginBody.message).toBe('User exists!');

    // Cleanup: delete the user
    await api.deleteUser(payload.email, payload.password);
  });
});
