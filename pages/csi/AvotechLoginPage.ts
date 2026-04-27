import { expect, type Page } from '@playwright/test';
import { CSI_LEGACY_LOGIN_PATH, CSI_LOGIN_PATH } from '../../config/csi';
import { BasePage } from '../BasePage';

/**
 * RCSI CSI Avotech OutSystems login (email step → password step).
 */
export class CsiAvotechLoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  readonly emailField = this.page.locator('#Input_email');
  readonly nextButton = this.page.getByRole('button', { name: 'Next' });
  readonly passwordField = this.page.locator('#Input_password');
  readonly loginButton = this.page.getByRole('button', { name: 'Log in' });

  async gotoLogin() {
    await this.page.goto(CSI_LOGIN_PATH);
    const visibleOnPrimary = await this.emailField
      .waitFor({ state: 'visible', timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    if (!visibleOnPrimary) {
      await this.page.goto(CSI_LEGACY_LOGIN_PATH);
      await this.emailField.waitFor({ state: 'visible', timeout: 10_000 });
    }
  }

  async enterEmail(email: string) {
    await this.emailField.fill(email);
  }

  async goToPasswordStep() {
    await expect(this.nextButton).toBeVisible();
    await this.nextButton.click();
  }

  async expectPasswordFieldVisible() {
    await expect(this.passwordField).toBeVisible();
  }

  async enterPassword(password: string) {
    await this.passwordField.fill(password);
  }

  async submitLogin() {
    await this.loginButton.click();
  }

  /**
   * Full two-step sign-in
   */
  async signInWithEmailAndPassword(email: string, password: string) {
    await this.enterEmail(email);
    await this.goToPasswordStep();
    await this.expectPasswordFieldVisible();
    await this.enterPassword(password);
    await this.submitLogin();
  }

  async expectOnHome() {
    await this.page.waitForURL('**/');
  }
}
