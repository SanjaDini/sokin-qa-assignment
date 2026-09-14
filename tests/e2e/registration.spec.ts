import { test } from "../../src/fixtures/e2e-fixtures";
import { buildUserPayload, EXISTING_USER } from "../../src/data/test-data";

/**
 * e2e tests: User Registration
 * Tags: @smoke @regression
 */

test.describe("User Registration", () => {
  const user = buildUserPayload();

  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test("User can register a new account successfully @smoke", async ({
    homePage,
    loginPage,
    signupPage,
  }) => {
    // Given I am on the login page
    await homePage.goToLoginPage();
    await loginPage.expectOnLoginPage();

    // When I register a new account
    await loginPage.startSignup(user.name, user.email);
    await signupPage.expectOnSignupPage();

    // Then I should be able to fill in the registration form and submit it
    await signupPage.fillAndSubmit({
      password: user.password,
      day: user.birth_date,
      month: user.birth_month,
      year: user.birth_year,
      firstname: user.firstname,
      lastname: user.lastname,
      address1: user.address1,
      country: user.country,
      state: user.state,
      city: user.city,
      zipcode: user.zipcode,
      mobile: user.mobile_number,
    });

    // And I should see a confirmation that the account was created and be logged in
    await signupPage.expectAccountCreated();
    await signupPage.clickContinue();
    await homePage.expectLoggedIn();

    // Cleanup
    await homePage.deleteAccountLink.click();
    await homePage.expectAccountDeleted();
  });

  test("Registration with existing email shows error @regression", async ({
    loginPage,
  }) => {
    // Given I am on the login page
    await loginPage.navigate();
    await loginPage.startSignup("Duplicate Test", EXISTING_USER.email);

    // Then I should see an error message indicating the email is already registered
    await loginPage.expectSignupError();
  });
});
