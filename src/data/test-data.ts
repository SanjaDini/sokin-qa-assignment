/// <reference types="node" />
import { type CreateUserPayload } from "../types/api.types";

/**
 * Test data module.
 */

// ─── API base URL ─────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.API_BASE_URL ?? "https://automationexercise.com";

// A pre-registered account that is never deleted.
export const EXISTING_USER = {
  email: "sokin.qa.test@mailcather.com",
  password: "SokinQA2026!",
  name: "Sokin QA",
} as const;

/**
 * Generates a fresh user payload every call.
 * The timestamp suffix ensures uniqueness across parallel runs.
 */
export function buildUserPayload(
  overrides?: Partial<CreateUserPayload>,
): CreateUserPayload {
  const ts = Date.now();
  return {
    name: `Test User ${ts}`,
    email: `qa.test.${ts}@mailcatcher.com`,
    password: "TestPass123!",
    title: "Mr",
    birth_date: "15",
    birth_month: "6",
    birth_year: "1990",
    firstname: "Test",
    lastname: `User${ts}`,
    company: "Sokin QA",
    address1: "123 Test Street",
    address2: "Suite 4",
    country: "Canada",
    zipcode: "EC1A 1BB",
    state: "England",
    city: "London",
    mobile_number: "+447700900000",
    ...overrides,
  };
}

// Test card

export const TEST_CARD = {
  name: "Test User",
  cardNumber: "4111111111111111",
  cvc: "123",
  month: "12",
  year: "2030",
} as const;

// Product search terms

export const SEARCH_TERMS = {
  valid: ["top", "tshirt", "jean", "dress"],
  empty: "",
  noResults: "zzznonexistentproductxxx",
} as const;
