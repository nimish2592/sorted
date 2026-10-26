/** Hard-coded Sorted admin — always has access and can manage people. */
export const ADMIN_EMAIL = 'vnslabsai@gmail.com';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return normalizeEmail(email) === ADMIN_EMAIL;
}
