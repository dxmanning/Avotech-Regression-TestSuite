import { test as base } from '@playwright/test';
import { CsiAvotechLoginPage } from '../../pages/csi/AvotechLoginPage';
import { CsiSalesAndBillingPage } from '../../pages/csi/SalesAndBillingPage';

type CsiFixtures = {
  csiLoginPage: CsiAvotechLoginPage;
  csiSalesAndBillingPage: CsiSalesAndBillingPage;
};

export const test = base.extend<CsiFixtures>({
  csiLoginPage: async ({ page }, use) => {
    await use(new CsiAvotechLoginPage(page));
  },
  csiSalesAndBillingPage: async ({ page }, use) => {
    await use(new CsiSalesAndBillingPage(page));
  },
});

export { expect } from '@playwright/test';
