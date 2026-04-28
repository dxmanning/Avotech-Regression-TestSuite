import { expect, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class CsiSalesAndBillingPage extends BasePage {
  readonly salesOrderLink = this.page.getByRole('link', { name: 'Sales Order' });
  readonly addSalesOrderButton = this.page.getByRole('button', { name: 'Add Sales Order' });
  readonly salesAndBillingNav = this.page.locator('#b3-Sales_Billing2').getByText('Sales & Billing');
  readonly packageManagementLink = this.page.getByRole('link', { name: 'Package Management' });
  readonly addPackageButton = this.page.getByRole('button', { name: 'Add Package' });

  readonly packageNameInput = this.page.getByRole('textbox', { name: 'Package Name*' });
  readonly packageDescriptionInput = this.page.getByRole('textbox', { name: /description/i });

  readonly salesPartnerDropdown = this.page.getByText('Select Sales Partner');
  readonly avotechSalesPartnerOption = this.page.getByRole('option', { name: 'Avotech' });

  readonly moduleTableRows = this.page.locator('table[role="grid"] tbody tr.table-row');
  readonly submitButton = this.page.getByRole('button', { name: 'Submit' });
  readonly continueToReviewButton = this.page.getByRole('button', { name: 'Continue to Review' });
  /** First field on Add Sales Order form (SB-046); used to confirm screen finished loading. */
  readonly addSalesOrderFormReady = this.page.getByText('Select Client', { exact: true });

  /** Avoid throwing if the test/browser has already shut down (e.g. after global timeout). */
  private async safeSleep(ms: number) {
    if (this.page.isClosed()) {
      return;
    }
    await this.page.waitForTimeout(ms).catch(() => {});
  }

  async openSalesAndBilling() {
    // After login complete and Sales & Billing is visible.
    await this.waitForElement(this.salesAndBillingNav);
    await this.salesAndBillingNav.click();
  }

  async openPackageManagement() {
    // After Package Management is visible.
    await this.waitForElement(this.packageManagementLink);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await this.packageManagementLink.click({ force: true });
      const loaded = await this.addPackageButton
        .isVisible({ timeout: 5_000 })
        .catch(() => false);
      if (loaded) {
        return;
      }
    }

    await this.waitForElement(this.addPackageButton, 10_000);
  }

  async clickAddPackage() {
    // After page loads and Add Package is visible.
    await this.waitForElement(this.addPackageButton);
    await this.addPackageButton.click();
  }

  async openSalesOrder() {
    // After Sales Order is visible.
    await this.waitForElement(this.salesOrderLink);
    await this.salesOrderLink.click();
  }

  async clickAddSalesOrder() {
    // After page loads and Add Sales Order is visible.
    await this.waitForElement(this.addSalesOrderButton);
    await this.addSalesOrderButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    // Brief settle so OutSystems / widgets finish rendering before dropdown interactions.
    await this.safeSleep(2_000);
    await this.waitForElement(this.addSalesOrderFormReady, 30_000);
  }

  async fillPackageDetails(name: string, description: string) {
    await this.waitForElement(this.packageNameInput);
    await this.packageNameInput.fill(name);

    // Some tenants do not render a description field in Add Package.
    if (await this.packageDescriptionInput.isVisible().catch(() => false)) {
      await this.packageDescriptionInput.fill(description);
    }
  }

  async selectSalesPartnerAvotech() {
    await this.salesPartnerDropdown.click();
    await this.waitForElement(this.avotechSalesPartnerOption);
    await this.avotechSalesPartnerOption.click();
  }

  /**
   * Clicks the first usable option in an open dropdown (VirtualSelect often keeps
   * off-screen options in the DOM as `hidden`; `.first()` is then wrong).
   */
  private async clickFirstDropdownOption() {
    const roleOptions = this.page.getByRole('option');
    await expect(roleOptions.first()).toBeAttached({ timeout: 12_000 });

    const count = await roleOptions.count();
    for (let i = 0; i < count; i += 1) {
      const opt = roleOptions.nth(i);
      if (await opt.isVisible().catch(() => false)) {
        await opt.click();
        return;
      }
    }

    // VirtualSelect marks the rendered row with data-visible-index; others stay `hidden` in DOM.
    const vsRenderedRow = this.page.locator('[role="option"][data-visible-index="0"]');
    if ((await vsRenderedRow.count()) > 0) {
      await vsRenderedRow.first().click({ force: true });
      return;
    }

    // Last resort: first attached option (may be hidden to Playwright but still clickable).
    const first = roleOptions.first();
    await first.scrollIntoViewIfNeeded().catch(() => {});
    await first.click({ force: true });
  }

  /**
   * Clicks the last option in an open VirtualSelect-style list (SB-046: combobox has
   * `aria-controls` → dropbox; options use `data-index`). Scrolls the list to the end
   * then picks the greatest `data-index` in the panel.
   */
  private async clickLastDropdownOption() {
    const expandedCombo = this.page.locator('[role="combobox"][aria-expanded="true"]').first();
    await expect(expandedCombo).toBeVisible({ timeout: 12_000 });

    const controlsId = await expandedCombo.getAttribute('aria-controls');
    if (controlsId?.length) {
      const dropbox = this.page.locator(`[id=${JSON.stringify(controlsId)}]`);
      await expect(dropbox).toBeAttached({ timeout: 8_000 });

      const scrollArea = dropbox.locator('.vscomp-options').first();
      if ((await scrollArea.count()) > 0) {
        for (let pass = 0; pass < 6; pass += 1) {
          await scrollArea
            .evaluate((el) => {
              const node = el as { scrollTop: number; scrollHeight: number };
              node.scrollTop = node.scrollHeight;
            })
            .catch(() => {});
          await this.safeSleep(120);
        }
      }

      const optionsInDropbox = dropbox.locator('[role="option"]');
      await expect(optionsInDropbox.first()).toBeAttached({ timeout: 8_000 });
      const n = await optionsInDropbox.count();
      expect(n).toBeGreaterThan(0);

      let bestIdx = -1;
      let bestLoc: Locator | null = null;
      for (let i = 0; i < n; i += 1) {
        const opt = optionsInDropbox.nth(i);
        const raw = await opt.getAttribute('data-index');
        const v = raw !== null ? Number.parseInt(raw, 10) : Number.NaN;
        if (!Number.isNaN(v) && v >= bestIdx) {
          bestIdx = v;
          bestLoc = opt;
        }
      }
      if (bestLoc && bestIdx >= 0) {
        await bestLoc.scrollIntoViewIfNeeded().catch(() => {});
        await bestLoc.click({ force: true });
        return;
      }

      for (let i = n - 1; i >= 0; i -= 1) {
        const opt = optionsInDropbox.nth(i);
        if (await opt.isVisible().catch(() => false)) {
          await opt.click();
          return;
        }
      }

      const lastInBox = optionsInDropbox.nth(n - 1);
      await lastInBox.scrollIntoViewIfNeeded().catch(() => {});
      await lastInBox.click({ force: true });
      return;
    }

    const roleOptions = this.page.getByRole('option');
    await expect(roleOptions.first()).toBeAttached({ timeout: 8_000 });
    const count = await roleOptions.count();
    expect(count).toBeGreaterThan(0);

    for (let i = count - 1; i >= 0; i -= 1) {
      const opt = roleOptions.nth(i);
      if (await opt.isVisible().catch(() => false)) {
        await opt.click();
        return;
      }
    }

    const last = roleOptions.nth(count - 1);
    await last.scrollIntoViewIfNeeded().catch(() => {});
    await last.click({ force: true });
  }

  /**
   * Opens a dropdown by its trigger label and selects the first option.
   * @param maxAttempts When greater than 1, retries clicking the trigger if the first option does not
   *   become visible in time (e.g. sales order form). Use `4` for one try plus three retries.
   */
  async selectFirstOptionByTriggerText(triggerText: string, maxAttempts = 1) {
    const trigger = this.page.getByText(triggerText, { exact: true });
    await this.waitForElement(trigger);

    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await trigger.click();

      try {
        await this.clickFirstDropdownOption();
        return;
      } catch (error) {
        lastError = error;
        if (attempt === maxAttempts - 1) {
          throw lastError;
        }
        await this.page.keyboard.press('Escape').catch(() => {});
        await this.safeSleep(500);
      }
    }
  }

  /**
   * Opens a dropdown by its trigger label and selects the last option in the list.
   * @param maxAttempts Same retry semantics as {@link selectFirstOptionByTriggerText}.
   */
  async selectLastOptionByTriggerText(triggerText: string, maxAttempts = 1) {
    const trigger = this.page.getByText(triggerText, { exact: true });
    await this.waitForElement(trigger);

    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await trigger.click();

      try {
        await this.clickLastDropdownOption();
        return;
      } catch (error) {
        lastError = error;
        if (attempt === maxAttempts - 1) {
          throw lastError;
        }
        await this.page.keyboard.press('Escape').catch(() => {});
        await this.safeSleep(500);
      }
    }
  }

  /**
   * SB-046 Billing Partner field uses DropdownSearch under #BillingPartner.
   */
  async selectFirstBillingPartnerOption(maxAttempts = 1) {
    const billingPartnerCombobox = this.page.locator('#BillingPartner [role="combobox"]').first();
    await this.waitForElement(billingPartnerCombobox);

    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await billingPartnerCombobox.click();

      try {
        await this.clickFirstDropdownOption();
        return;
      } catch (error) {
        lastError = error;
        if (attempt === maxAttempts - 1) {
          throw lastError;
        }
        await this.page.keyboard.press('Escape').catch(() => {});
        await this.safeSleep(500);
      }
    }
  }

  async selectAllModulesAndSetUnitPrice(unitPrice: number) {
    const rowCount = await this.moduleTableRows.count();
    expect(rowCount).toBeGreaterThan(0);
    for (let i = 0; i < rowCount; i += 1) {
      const row = this.moduleTableRows.nth(i);
      const checkbox = row.locator('input[type="checkbox"]');
      const unitPriceInput = row.getByRole('spinbutton');

      await this.waitForElement(checkbox);
      await checkbox.check();

      await expect(unitPriceInput).toBeEnabled();
      await unitPriceInput.fill(String(unitPrice));
    }
  }

  private async clickTodayInOpenDatepicker() {
    const calendar = this.page.locator('.flatpickr-calendar.open[role="dialog"]');
    await this.waitForElement(calendar);

    // SB-046 datepicker structure uses flatpickr-day with role="button".
    const todayCell = calendar.locator('.flatpickr-day.today[role="button"]').first();
    if (await todayCell.isVisible().catch(() => false)) {
      await todayCell.click();
      return;
    }

    // Fallback: target today's aria-label (e.g. "April 28, 2026").
    const today = new Date();
    const fullDateLabel = today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const labelCell = calendar.locator(`.flatpickr-day[role="button"][aria-label="${fullDateLabel}"]`);
    await this.waitForElement(labelCell.first());
    await labelCell.first().click();
  }

  async pickTodaySalesStartDate(maxAttempts = 1) {
    // SB-046 Effective Start Date field is a datepicker with aria-label "Select a date".
    const dateCombobox = this.page
      .locator('div')
      .filter({ has: this.page.getByText('Effective Start Date', { exact: true }) })
      .getByRole('combobox', { name: 'Select a date' })
      .first();
    await this.waitForElement(dateCombobox);

    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        await dateCombobox.click();
        await this.clickTodayInOpenDatepicker();
        return;
      } catch (error) {
        lastError = error;
        if (attempt === maxAttempts - 1) {
          throw lastError;
        }
        await this.page.keyboard.press('Escape').catch(() => {});
        await this.safeSleep(500);
      }
    }
  }

  async fillSalesOrderDuration(duration: number) {
    // SB-046 Duration field input id is Input_DurationName.
    const durationInput = this.page.locator('#Input_DurationName');
    await this.waitForElement(durationInput);
    await durationInput.fill(String(duration));
  }

  async selectFirstBillingMode() {
    await this.page.getByLabel('Billing Mode').selectOption('0');
  }

  async selectAllSalesOrderModulesAndSetUnits(unitCount: number) {
    const rowCount = await this.moduleTableRows.count();
    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i += 1) {
      const row = this.moduleTableRows.nth(i);
      const checkbox = row.locator('input[type="checkbox"]');
      const unitsInput = row.getByPlaceholder('Enter Number of Units');

      await this.waitForElement(checkbox);
      await checkbox.check();

      await expect(unitsInput).toBeEnabled();
      await unitsInput.fill(String(unitCount));
    }
  }

  async continueSalesOrderToReview() {
    await this.waitForElement(this.continueToReviewButton);
    await this.continueToReviewButton.click();
  }

  async submitPackage() {
    await this.waitForElement(this.submitButton);
    await this.submitButton.click();
  }

  async expectPackageCreated(packageName: string) {
    await this.page.waitForURL(/\/PackageList/, { timeout: 60000 });
    const packageCell = this.page.getByRole('gridcell', { name: packageName });
    await this.waitForElement(packageCell, 60_000);
  }

  async expectSalesOrderCreated() {
    const successMessage = this.page
      .locator('div')
      .filter({ hasText: 'You have successfully added' })
      .first();
    await this.waitForElement(successMessage, 60_000);
    await this.page.waitForURL(/\/SalesOrderList/, { timeout: 60000 });
  }
}
