import { expect, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Account Info / Signup Form Page

 */
export class SignupPage extends BasePage {
  // ── Personal info ─────────────────────────────────────────────────────────
  readonly titleMr = this.page.getByLabel("Mr");
  readonly titleMrs = this.page.getByLabel("Mrs");
  readonly passwordField = this.page.locator('[data-qa="password"]');
  readonly daySelect = this.page.locator('[data-qa="days"]');
  readonly monthSelect = this.page.locator('[data-qa="months"]');
  readonly yearSelect = this.page.locator('[data-qa="years"]');

  // ── Address info ──────────────────────────────────────────────────────────
  readonly firstnameField = this.page.locator('[data-qa="first_name"]');
  readonly lastnameField = this.page.locator('[data-qa="last_name"]');
  readonly companyField = this.page.locator('[data-qa="company"]');
  readonly address1Field = this.page.locator('[data-qa="address"]');
  readonly address2Field = this.page.locator('[data-qa="address2"]');
  readonly countrySelect = this.page.locator('[data-qa="country"]');
  readonly stateField = this.page.locator('[data-qa="state"]');
  readonly cityField = this.page.locator('[data-qa="city"]');
  readonly zipcodeField = this.page.locator('[data-qa="zipcode"]');
  readonly mobileField = this.page.locator('[data-qa="mobile_number"]');
  readonly createAccountButton = this.page.locator(
    '[data-qa="create-account"]',
  );
  readonly accountCreatedHeading = this.page.locator(
    '[data-qa="account-created"]',
  );
  readonly continueButton = this.page.locator('[data-qa="continue-button"]');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Fills in the full signup form and submits it.
   */
  async fillAndSubmit(options: {
    password: string;
    day?: string;
    month?: string;
    year?: string;
    firstname: string;
    lastname: string;
    address1: string;
    country?: string;
    state: string;
    city: string;
    zipcode: string;
    mobile: string;
  }): Promise<void> {
    await this.titleMr.check();
    await this.passwordField.fill(options.password);

    if (options.day) await this.daySelect.selectOption(options.day);
    if (options.month) await this.monthSelect.selectOption(options.month);
    if (options.year) await this.yearSelect.selectOption(options.year);

    await this.firstnameField.fill(options.firstname);
    await this.lastnameField.fill(options.lastname);
    await this.address1Field.fill(options.address1);
    if (options.country) await this.countrySelect.selectOption(options.country);
    await this.stateField.fill(options.state);
    await this.cityField.fill(options.city);
    await this.zipcodeField.fill(options.zipcode);
    await this.mobileField.fill(options.mobile);

    await this.createAccountButton.click();
  }

  async isAccountCreated(): Promise<boolean> {
    return this.accountCreatedHeading.isVisible();
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }

  async expectOnSignupPage(): Promise<void> {
    await expect(this.page).toHaveURL(/signup/);
  }

  async expectAccountCreated(): Promise<void> {
    await expect(this.accountCreatedHeading).toBeVisible();
    await expect(this.accountCreatedHeading).toHaveText("Account Created!");
  }
}
