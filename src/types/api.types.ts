/**
 * Shared TypeScript types that mirror the automationexercise.com API schema.
 * Keeping these co-located with tests (not imported from an external lib)
 * so the suite is self-contained and easy to run.
 */

// ─── API Response envelope ─────────────────────────────────────────────────

export interface ApiResponse {
  responseCode: number;
  message?: string;
}

// ─── Product ──────────────────────────────────────────────────────────────

export interface Category {
  usertype: { usertype: string };
  category: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: Category;
}

export interface ProductsApiResponse extends ApiResponse {
  products: Product[];
}

// ─── Brand ────────────────────────────────────────────────────────────────

export interface Brand {
  id: number;
  brand: string;
}

export interface BrandsApiResponse extends ApiResponse {
  brands: Brand[];
}

// ─── User ─────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  title: string;
  birth_day: string;
  birth_month: string;
  birth_year: string;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
}

export interface UserApiResponse extends ApiResponse {
  user: UserProfile;
}

// ─── Create / Update user request payload ─────────────────────────────────

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  title: 'Mr' | 'Mrs' | 'Miss';
  birth_date: string;
  birth_month: string;
  birth_year: string;
  firstname: string;
  lastname: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobile_number: string;
}
