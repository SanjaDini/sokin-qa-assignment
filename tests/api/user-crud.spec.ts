import { test, expect } from '../../src/fixtures/api-fixtures';
import { buildUserPayload } from '../../src/data/test-data';
import { type UserApiResponse } from '../../src/types/api.types';

/**
 * API tests: User lifecycle (Create, Read, Update, Delete)
 *
 * Coverage:
 *  - POST /api/createAccount          → 201 "User created!"
 *  - POST /api/createAccount duplicate → 400 "Email already exists!"
 *  - GET  /api/getUserDetailByEmail   → 200 with correct user profile
 *  - PUT  /api/updateAccount          → 200 "User updated!"
 *  - DELETE /api/deleteAccount        → 200 "Account deleted!"
 *
 * Each test that modifies state cleans up after itself.
 * Tags: @smoke @regression
 */

test.describe('User CRUD API', () => {
  test('POST createAccount returns 201 and creates a user @smoke', async ({ api }) => {
    const payload = buildUserPayload();

    const response = await api.createUser(payload);
    expect(response.status()).toBe(200); // transport always 200 on this API

    const body = await response.json() as { responseCode: number; message: string };
    expect(body.responseCode).toBe(201);
    expect(body.message).toBe('User created!');

    // Cleanup
    await api.deleteUser(payload.email, payload.password);
  });

  test('POST createAccount with duplicate email returns 400 @regression', async ({ api }) => {
    const payload = buildUserPayload();

    // First registration
    await api.createUser(payload);

    // Attempt duplicate
    const response = await api.createUser(payload);
    const body = await response.json() as { responseCode: number; message: string };
    expect(body.responseCode).toBe(400);
    expect(body.message).toMatch(/exists/i);

    // Cleanup
    await api.deleteUser(payload.email, payload.password);
  });

  test('GET getUserDetailByEmail returns 200 with correct profile @smoke', async ({ api }) => {
    const payload = buildUserPayload();
    await api.createUser(payload);

    const response = await api.getUserByEmail(payload.email);
    expect(response.status()).toBe(200);

    const body = await response.json() as UserApiResponse;
    expect(body.responseCode).toBe(200);
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(payload.email);
    expect(body.user.first_name).toBe(payload.firstname);
    expect(body.user.last_name).toBe(payload.lastname);

    // Cleanup
    await api.deleteUser(payload.email, payload.password);
  });

  test('GET getUserDetailByEmail for unknown email returns 404 @regression', async ({ api }) => {
    const response = await api.getUserByEmail('nobody-at-all@invalid.test');

    const body = await response.json() as { responseCode: number; message: string };
    expect(body.responseCode).toBe(404);
    expect(body.message).toMatch(/not found/i);
  });

  test('GET getUserDetailByEmail without email param returns 400 @regression', async ({ api }) => {
    const response = await api.getUserDetailMissingParam();

    const body = await response.json() as { responseCode: number; message: string };
    expect(body.responseCode).toBe(400);
  });

  test('PUT updateAccount for non-existent user returns 404 @regression', async ({ api }) => {
    const payload = buildUserPayload({ email: `ghost.${Date.now()}@invalid.test` });
    const response = await api.updateUser(payload);

    const body = await response.json() as { responseCode: number; message: string };
    expect(body.responseCode).toBe(404);
    expect(body.message).toMatch(/not found/i);
  });

  test('POST createAccount with missing required fields returns 400 @regression', async ({ api }) => {
    // Send only email — name, password and address fields are all missing
    const response = await api.createUser({ email: `incomplete.${Date.now()}@test.com` } as never);

    const body = await response.json() as { responseCode: number; message: string };
    expect(body.responseCode).toBe(400);
  });

  test('PUT updateAccount returns 200 and updates the user @regression', async ({ api }) => {
    const payload = buildUserPayload();
    await api.createUser(payload);

    const updated = { ...payload, firstname: 'UpdatedFirst', company: 'Updated Co.' };
    const response = await api.updateUser(updated);
    const body = await response.json() as { responseCode: number; message: string };

    expect(body.responseCode).toBe(200);
    expect(body.message).toBe('User updated!');

    // Verify the change persisted
    const getResp = await api.getUserByEmail(payload.email);
    const getBody = await getResp.json() as UserApiResponse;
    expect(getBody.user.first_name).toBe('UpdatedFirst');
    expect(getBody.user.company).toBe('Updated Co.');

    // Cleanup
    await api.deleteUser(payload.email, payload.password);
  });

  test('DELETE deleteAccount returns 200 and removes the user @smoke', async ({ api }) => {
    const payload = buildUserPayload();
    await api.createUser(payload);

    const response = await api.deleteUser(payload.email, payload.password);
    const body = await response.json() as { responseCode: number; message: string };

    expect(body.responseCode).toBe(200);
    expect(body.message).toBe('Account deleted!');

    // Verify the account is gone
    const getResp = await api.getUserByEmail(payload.email);
    const getBody = await getResp.json() as { responseCode: number };
    expect(getBody.responseCode).toBe(404);
  });
});
