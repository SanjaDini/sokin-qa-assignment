import { test } from "../../src/fixtures/e2e-fixtures";
import { EXISTING_USER } from "../../src/data/test-data";

/**
 * E2E tests: Login / Logout
 * Tags: @smoke @regression
 */

test.describe("Login / Logout", () => {
  test("User can log in with valid credentials @smoke", async ({
    homePage,
    loginPage,
  }) => {
    // Given I am on the login page
    await loginPage.navigate();
    await loginPage.login(EXISTING_USER.email, EXISTING_USER.password);

    // Then I should be logged in and see the home page
    await homePage.expectOnHomePage();
    await homePage.expectLoggedIn(EXISTING_USER.name);
  });

  test("Login with invalid password shows error message @regression", async ({
    loginPage,
  }) => {
    // Given I am on the login page
    await loginPage.navigate();
    await loginPage.login(EXISTING_USER.email, "WrongPassword!");

    // Then I should see an error message indicating invalid credentials
    await loginPage.expectLoginError();
  });

  test("Login with non-existent email shows error message @regression", async ({
    loginPage,
  }) => {
    // Given I am on the login pageS
    await loginPage.navigate();
    await loginPage.login("nobody@doesnotexist.invalid", "SomePass!");

    // Then I should see an error message indicating invalid credentials
    await loginPage.expectLoginError();
  });

  test("Logged-in user can log out @smoke", async ({ homePage, loginPage }) => {
    // Given I am a logged-in userS
    await loginPage.navigate();
    await loginPage.login(EXISTING_USER.email, EXISTING_USER.password);
    await homePage.expectLoggedIn();

    // When I log out
    await homePage.logout();

    // Then I should be logged out and see the home page
    await homePage.expectLoggedOut();
  });
});
