import { test as base } from "@playwright/test";
import { ApiClient } from "../helpers/api-client";

type ApiFixtures = {
  api: ApiClient;
};

export const test = base.extend<ApiFixtures>({
  api: async ({ request }, use) => {
    const client = new ApiClient(request);
    await use(client);
  },
});

export { expect } from "@playwright/test";
