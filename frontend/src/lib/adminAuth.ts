// Admin auth - authentication bypassed, always authenticated
export const adminAuth = {
  isAuthenticated: () => true,
  createSession: () => {},
  clearSession: () => {},
};

export function getAdminCredentials() {
  return { username: '', password: '' };
}
