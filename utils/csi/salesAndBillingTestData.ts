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
