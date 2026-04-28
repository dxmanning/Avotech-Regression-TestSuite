import { test } from '../../../fixtures/csi/testSetup';
import { csiTestEmail, csiTestPassword } from '../../../utils/csi/credentials';
import {
  csiPackageDescription,
  csiPackagePricePerModule,
  csiSalesOrderDuration,
  csiSalesOrderUnitsPerModule,
  csiUniquePackageName,
} from '../../../utils/csi/salesAndBillingTestData';

test.describe('CSI · Sales and Billing', () => {
  test.describe.configure({ timeout: 120_000 });

  test.beforeEach(async ({ csiLoginPage }) => {
    if (!process.env.CSI_TEST_PASSWORD?.length) {
      test.skip();
      return;
    }

    const email = csiTestEmail();
    const password = csiTestPassword();

    await csiLoginPage.gotoLogin();
    await csiLoginPage.signInWithEmailAndPassword(email, password);
    await csiLoginPage.expectOnHome();
  });

  test('Navigate to Package Management and create package', async ({
    csiSalesAndBillingPage,
  }) => {
    const packageName = csiUniquePackageName('Package-');
    const packageDescription = csiPackageDescription();
    const unitPrice = csiPackagePricePerModule();

    await csiSalesAndBillingPage.openSalesAndBilling();
    await csiSalesAndBillingPage.openPackageManagement();
    await csiSalesAndBillingPage.clickAddPackage();
    await csiSalesAndBillingPage.fillPackageDetails(packageName, packageDescription);
    await csiSalesAndBillingPage.selectSalesPartnerAvotech();
    await csiSalesAndBillingPage.selectAllModulesAndSetUnitPrice(unitPrice);
    await csiSalesAndBillingPage.submitPackage();
    await csiSalesAndBillingPage.expectPackageCreated(packageName);
  });

  test('Navigate to Sales Order and create sales order', async ({
    csiSalesAndBillingPage,
  }) => {
    const duration = csiSalesOrderDuration();
    const unitsPerModule = csiSalesOrderUnitsPerModule();

    await csiSalesAndBillingPage.openSalesAndBilling();
    await csiSalesAndBillingPage.openSalesOrder();
    await csiSalesAndBillingPage.clickAddSalesOrder();

    // Comments in SB-046 specify selecting the first option for these dropdowns.
    await csiSalesAndBillingPage.selectFirstOptionByTriggerText('Select Client');
    await csiSalesAndBillingPage.selectFirstOptionByTriggerText('Select Sales Partner');
    await csiSalesAndBillingPage.selectFirstOptionByTriggerText('Select Billing Partner');
    await csiSalesAndBillingPage.selectFirstOptionByTriggerText('Select Package Type');

    // SB-046 requires selecting today's date for every run.
    await csiSalesAndBillingPage.pickTodaySalesStartDate();
    await csiSalesAndBillingPage.fillSalesOrderDuration(duration);
    await csiSalesAndBillingPage.selectFirstBillingMode();
    await csiSalesAndBillingPage.selectAllSalesOrderModulesAndSetUnits(unitsPerModule);
    await csiSalesAndBillingPage.continueSalesOrderToReview();
    await csiSalesAndBillingPage.submitPackage();
    await csiSalesAndBillingPage.expectSalesOrderCreated();
  });
});
