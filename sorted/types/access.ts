export type AccessRole = 'admin' | 'member' | 'ca';

export type AccessUser = {
  id: string;
  name: string;
  email: string;
  role: AccessRole;
  /** bcrypt hash; optional if they only use Google Sign-In */
  passwordHash?: string;
  created_at: string;
  created_by?: string;
};

export type PublicAccessUser = Omit<AccessUser, 'passwordHash'>;
