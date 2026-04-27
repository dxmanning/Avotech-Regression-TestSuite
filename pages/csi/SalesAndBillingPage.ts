import { expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export class CsiSalesAndBillingPage extends BasePage {
  readonly salesAndBillingNav = this.page.locator('#b3-Sales_Billing2').getByText('Sales & Billing');
  readonly packageManagementLink = this.page.getByRole('link', { name: 'Package Management' });
  readonly addPackageButton = this.page.getByRole('button', { name: 'Add Package' });

  readonly packageNameInput = this.page.getByRole('textbox', { name: 'Package Name*' });
  readonly packageDescriptionInput = this.page.getByRole('textbox', { name: /description/i });

  readonly salesPartnerDropdown = this.page.getByText('Select Sales Partner');
  readonly avotechSalesPartnerOption = this.page.getByRole('option', { name: 'Avotech' });

  readonly moduleTableRows = this.page.locator('table[role="grid"] tbody tr.table-row');
  readonly submitButton = this.page.getByRole('button', { name: 'Submit' });

  async openSalesAndBilling() {
    // After login complete and Sales & Billing is visible.
    await expect(this.salesAndBillingNav).toBeVisible();
    await this.salesAndBillingNav.click();
  }

  async openPackageManagement() {
    // After Package Management is visible.
    await expect(this.packageManagementLink).toBeVisible();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await this.packageManagementLink.click({ force: true });
      const loaded = await this.addPackageButton
        .isVisible({ timeout: 5_000 })
        .catch(() => false);
      if (loaded) {
        return;
      }
    }

    await expect(this.addPackageButton).toBeVisible({ timeout: 10_000 });
  }

  async clickAddPackage() {
    // After page loads and Add Package is visible.
    await expect(this.addPackageButton).toBeVisible({ timeout: 15_000 });
    await this.addPackageButton.click();
  }

  async fillPackageDetails(name: string, description: string) {
    await expect(this.packageNameInput).toBeVisible();
    await this.packageNameInput.fill(name);

    // Some tenants do not render a description field in Add Package.
    if (await this.packageDescriptionInput.isVisible().catch(() => false)) {
      await this.packageDescriptionInput.fill(description);
    }
  }

  async selectSalesPartnerAvotech() {
    await this.salesPartnerDropdown.click();
    await expect(this.avotechSalesPartnerOption).toBeVisible();
    await this.avotechSalesPartnerOption.click();
  }

  async selectAllModulesAndSetUnitPrice(unitPrice: number) {
    const rowCount = await this.moduleTableRows.count();
    expect(rowCount).toBeGreaterThan(0);
    for (let i = 0; i < rowCount; i += 1) {
      const row = this.moduleTableRows.nth(i);
      const checkbox = row.locator('input[type="checkbox"]');
      const unitPriceInput = row.getByRole('spinbutton');

      await expect(checkbox).toBeVisible();
      await checkbox.check();

      await expect(unitPriceInput).toBeEnabled();
      await unitPriceInput.fill(String(unitPrice));
    }
  }

  async submitPackage() {
    await this.submitButton.click();
  }

  async expectPackageCreated(packageName: string) {
    await this.page.waitForURL(/\/PackageList/, { timeout: 60000 });
    await expect(this.page.getByRole('gridcell', { name: packageName })).toBeVisible();
  }
}
