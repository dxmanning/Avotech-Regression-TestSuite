import { test as base } from '@playwright/test';
import { CsiAvotechLoginPage } from '../../pages/csi/AvotechLoginPage';

type CsiFixtures = {
  csiLoginPage: CsiAvotechLoginPage;
};

export const test = base.extend<CsiFixtures>({
  csiLoginPage: async ({ page }, use) => {
    await use(new CsiAvotechLoginPage(page));
  },
});

export { expect } from '@playwright/test';
