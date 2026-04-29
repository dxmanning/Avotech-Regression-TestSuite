import { expect } from '@playwright/test';
import { CSI_BASE_URL } from '../../config/csi';
import { BasePage } from '../BasePage';

/** OutSystems `#bNN-Input_*` ids for Add Sales Partner → email template step (fragile if module is republished). */
const SALES_PARTNER_EMAIL_TEMPLATE_ROW_IDS = [
  'b38',
  'b39',
  'b40',
  'b41',
  'b42',
  'b44',
  'b45',
  'b47',
  'b49',
  'b50',
  'b51',
  'b52',
  'b53',
  'b55',
  'b56',
  'b58',
] as const;

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

  readonly addSalesPartnerButton = this.page.getByRole('button', { name: 'Add Sales Partner' });
  readonly salesPartnerPartnerNameInput = this.page.getByRole('textbox', { name: 'Partner Name*' });
  readonly salesPartnerDomainInput = this.page.getByRole('textbox', { name: 'Domain*' });
  readonly salesPartnerS3BucketNameInput = this.page.getByRole('textbox', { name: 'S3 Bucket Name*' });
  readonly salesPartnerS3BucketUrlInput = this.page.getByRole('textbox', { name: 'S3 Bucket URL*' });
  readonly salesPartnerSendgridSenderNameInput = this.page.getByRole('textbox', {
    name: 'Sendgrid Sender Name*',
  });
  readonly salesPartnerSendgridReplyToInput = this.page.getByRole('textbox', {
    name: 'Sendgrid Reply To Email*',
  });
  readonly salesPartnerContactEmailInput = this.page.getByRole('textbox', {
    name: 'Sales Partner Contact Email*',
  });
  readonly salesPartnerSubdomainExampleInput = this.page.getByRole('textbox', { name: 'ex: google.com' });
  readonly nextButton = this.page.getByRole('button', { name: 'Next' });

  async openSalesAndBilling() {
    await expect(this.salesAndBillingNav).toBeVisible();
    await this.salesAndBillingNav.click();
  }

  async openPackageManagement() {
    await expect(this.packageManagementLink).toBeVisible();
    // First click sometimes does not leave the hub; retry until Package Management UI is up.
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
    await expect(this.addPackageButton).toBeVisible({ timeout: 15_000 });
    await this.addPackageButton.click();
  }

  async fillPackageDetails(name: string, description: string) {
    await expect(this.packageNameInput).toBeVisible();
    await this.packageNameInput.fill(name);

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

  async openSalesPartnerList() {
    await this.page.goto(`${CSI_BASE_URL}/SalesPartnerList`);
    await expect(this.addSalesPartnerButton).toBeVisible({ timeout: 30_000 });
  }

  async clickAddSalesPartner() {
    await expect(this.addSalesPartnerButton).toBeVisible();
    await this.addSalesPartnerButton.click();
    await expect(this.salesPartnerPartnerNameInput).toBeVisible({ timeout: 30_000 });
  }

  async fillSalesPartnerBasicInformation(params: {
    partnerName: string;
    domain: string;
    s3BucketName: string;
    s3BucketUrl: string;
    sendgridSenderName: string;
    sendgridReplyToEmail: string;
    salesPartnerContactEmail: string;
    subdomainExampleHost: string;
  }) {
    await expect(this.salesPartnerPartnerNameInput).toBeVisible();
    await this.salesPartnerPartnerNameInput.click();
    await this.salesPartnerPartnerNameInput.fill(params.partnerName);

    await this.salesPartnerDomainInput.click();
    await this.salesPartnerDomainInput.fill(params.domain);

    await this.salesPartnerS3BucketNameInput.click();
    await this.salesPartnerS3BucketNameInput.fill(params.s3BucketName);

    await this.salesPartnerS3BucketUrlInput.click();
    await this.salesPartnerS3BucketUrlInput.fill(params.s3BucketUrl);

    await this.salesPartnerSendgridSenderNameInput.click();
    await this.salesPartnerSendgridSenderNameInput.fill(params.sendgridSenderName);

    await this.salesPartnerSendgridReplyToInput.click();
    await this.salesPartnerSendgridReplyToInput.fill(params.sendgridReplyToEmail);

    await this.salesPartnerContactEmailInput.click();
    await this.salesPartnerContactEmailInput.fill(params.salesPartnerContactEmail);

    await this.salesPartnerSubdomainExampleInput.click();
    await this.salesPartnerSubdomainExampleInput.fill(params.subdomainExampleHost);
  }

  async clickNextOnAddSalesPartnerWizard() {
    await expect(this.nextButton).toBeVisible();
    await this.nextButton.click();
  }

  async fillSalesPartnerEmailTemplateStep(uniqueSuffix: string) {
    const firstCategory = this.page.locator(`#${SALES_PARTNER_EMAIL_TEMPLATE_ROW_IDS[0]}-Input_Category`);
    await expect(firstCategory).toBeVisible({ timeout: 30_000 });

    const categoryValue = `test-category-${uniqueSuffix}`;
    const templateIdValue = `test-temp-id-${uniqueSuffix}`;

    for (const rowId of SALES_PARTNER_EMAIL_TEMPLATE_ROW_IDS) {
      const categoryInput = this.page.locator(`#${rowId}-Input_Category`);
      await expect(categoryInput).toBeVisible();
      await categoryInput.click();
      await categoryInput.fill(categoryValue);
    }
    for (const rowId of SALES_PARTNER_EMAIL_TEMPLATE_ROW_IDS) {
      const templateIdInput = this.page.locator(`#${rowId}-Input_TemplateId`);
      await expect(templateIdInput).toBeVisible();
      await templateIdInput.click();
      await templateIdInput.fill(templateIdValue);
    }
  }

  async submitAddSalesPartnerWizard() {
    await expect(this.submitButton).toBeVisible({ timeout: 30_000 });
    await this.submitButton.click();
  }

  async expectSalesPartnerCreated(partnerName: string) {
    await expect(this.page.getByText('You have successfully added')).toBeVisible({ timeout: 60_000 });
    await this.page.waitForURL(/\/SalesPartnerList/, { timeout: 60_000 });
    await expect(this.page.getByRole('gridcell', { name: partnerName })).toBeVisible();
  }
}
