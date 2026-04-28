import salesAndBilling from '../../data/csi/salesAndBilling.json';

export function csiPackageDescription(): string {
  return salesAndBilling.packageDefaults.description;
}

export function csiPackagePricePerModule(): number {
  return salesAndBilling.packageDefaults.unitPricePerModule;
}

export function csiUniquePackageName(
  prefix = salesAndBilling.packageDefaults.namePrefix,
): string {
  const worker = process.env.TEST_WORKER_INDEX ?? 'w0';
  return `${prefix}${Date.now()}-${worker}`;
}

export function csiSalesOrderDuration(): number {
  return salesAndBilling.salesOrderDefaults.duration;
}

export function csiSalesOrderUnitsPerModule(): number {
  return salesAndBilling.salesOrderDefaults.unitsPerModule;
}
