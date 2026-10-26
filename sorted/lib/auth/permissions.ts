import type { AccessRole } from '@/types/access';

/** Paths a CA may open. Everything else is VNS Labs (admin/member) only. */
export const CA_ALLOWED_PREFIXES = ['/bills', '/invoices', '/documents'] as const;

export const CA_HOME = '/bills';

export function isVnsLabsRole(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'member';
}

export function isCaRole(role: string | null | undefined): boolean {
  return role === 'ca';
}

export function canAccessPath(
  role: string | null | undefined,
  pathname: string
): boolean {
  // APIs: CA may only hit drive/docs-related and their own session; enforce below
  if (pathname.startsWith('/api/')) {
    return canAccessApi(role, pathname);
  }

  if (isVnsLabsRole(role) || role === 'admin') return true;
  if (!isCaRole(role)) return false;

  return CA_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function canAccessApi(
  role: string | null | undefined,
  pathname: string
): boolean {
  if (isVnsLabsRole(role)) return true;
  if (!isCaRole(role)) return false;

  // CA: documents from Drive + auth session only (no access admin APIs)
  const caApis = ['/api/drive', '/api/auth'];
  return caApis.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function navItemAllowed(
  role: string | null | undefined,
  href: string
): boolean {
  if (isVnsLabsRole(role)) return true;
  if (!isCaRole(role)) return false;
  return CA_ALLOWED_PREFIXES.some(
    (prefix) => href === prefix || href.startsWith(`${prefix}/`)
  );
}

export function roleLabel(role: AccessRole | string | null | undefined): string {
  if (role === 'ca') return 'CA';
  if (role === 'admin') return 'Admin';
  if (role === 'member') return 'VNS Labs';
  return 'User';
}
