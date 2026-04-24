import { expect, type Page } from '@playwright/test';
import { CSI_HOME_PATH, CSI_LOGIN_PATH, isCsiLoginPageUrl } from '../../config/csi';
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

  async gotoFromRoot() {
    await this.page.goto(CSI_HOME_PATH);
    await this.page.waitForURL((url) => isCsiLoginPageUrl(url));
  }

  async gotoLogin() {
    await this.page.goto(CSI_LOGIN_PATH);
  }

  async enterEmail(email: string) {
    await this.emailField.fill(email);
  }

  async goToPasswordStep() {
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
