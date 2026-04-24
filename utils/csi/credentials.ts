import csi from '../../data/csi/testData.json';

// Test password must never be committed; set CSI_TEST_PASSWORD in .env
export function csiTestPassword(): string {
  const p = process.env.CSI_TEST_PASSWORD;
  if (p == null || p.length === 0) {
    throw new Error('Set CSI_TEST_PASSWORD in the environment (see .env.example).');
  }
  return p;
}

export function csiTestEmail(): string {
  return process.env.CSI_TEST_EMAIL?.trim() || csi.validUser.email;
}
