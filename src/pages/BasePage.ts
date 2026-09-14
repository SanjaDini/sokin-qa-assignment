import { type Page, type Locator } from "@playwright/test";

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = "/"): Promise<void> {
    await this.page.goto(path);
  }

  async scrollAndClick(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
    await locator.click();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
