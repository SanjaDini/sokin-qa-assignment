import { type APIRequestContext } from "@playwright/test";
import { type CreateUserPayload } from "../types/api.types";
import { API_BASE_URL } from "../data/test-data";

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  // Products
  async getProducts() {
    return this.request.get(`${API_BASE_URL}/api/productsList`);
  }

  async postToProducts() {
    return this.request.post(`${API_BASE_URL}/api/productsList`);
  }

  // Brands
  async getBrands() {
    return this.request.get(`${API_BASE_URL}/api/brandsList`);
  }

  async putToBrands() {
    return this.request.put(`${API_BASE_URL}/api/brandsList`);
  }

  // Search
  async searchProduct(searchTerm: string) {
    return this.request.post(`${API_BASE_URL}/api/searchProduct`, {
      form: { search_product: searchTerm },
    });
  }

  async searchProductMissingParam() {
    return this.request.post(`${API_BASE_URL}/api/searchProduct`, {
      form: {},
    });
  }

  // Login / Verify
  async verifyLogin(email: string, password: string) {
    return this.request.post(`${API_BASE_URL}/api/verifyLogin`, {
      form: { email, password },
    });
  }

  async verifyLoginMissingEmail(password: string) {
    return this.request.post(`${API_BASE_URL}/api/verifyLogin`, {
      form: { password },
    });
  }

  async verifyLoginMissingPassword(email: string) {
    return this.request.post(`${API_BASE_URL}/api/verifyLogin`, {
      form: { email },
    });
  }

  async deleteVerifyLogin() {
    return this.request.delete(`${API_BASE_URL}/api/verifyLogin`);
  }

  // User CRUD
  async createUser(payload: CreateUserPayload) {
    return this.request.post(`${API_BASE_URL}/api/createAccount`, {
      form: payload as unknown as Record<string, string>,
    });
  }

  async getUserByEmail(email: string) {
    return this.request.get(`${API_BASE_URL}/api/getUserDetailByEmail`, {
      params: { email },
    });
  }

  async getUserDetailMissingParam() {
    return this.request.get(`${API_BASE_URL}/api/getUserDetailByEmail`);
  }

  async updateUser(payload: CreateUserPayload) {
    return this.request.put(`${API_BASE_URL}/api/updateAccount`, {
      form: payload as unknown as Record<string, string>,
    });
  }

  async deleteUser(email: string, password: string) {
    return this.request.delete(`${API_BASE_URL}/api/deleteAccount`, {
      form: { email, password },
    });
  }
}
