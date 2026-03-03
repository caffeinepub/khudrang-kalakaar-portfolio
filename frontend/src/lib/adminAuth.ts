// Admin authentication utilities using local session management
// Credentials: DeepakKumawat / Kinnu*0613

const SESSION_KEY = 'admin_session_token';
const SESSION_EXPIRY_KEY = 'admin_session_expiry';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Simple djb2-style hash matching the backend implementation
function hashPassword(password: string): string {
  let h = 5381;
  for (let i = 0; i < password.length; i++) {
    const code = password.charCodeAt(i);
    h = ((h * 33) + code) % 0xFFFFFFFFFFFFFFFF;
  }
  if (h === 0) return '0';
  let result = '';
  let remaining = h;
  while (remaining > 0) {
    const digit = remaining % 16;
    result = '0123456789abcdef'[digit] + result;
    remaining = Math.floor(remaining / 16);
  }
  return result;
}

const ADMIN_USERNAME = 'DeepakKumawat';
const ADMIN_PASSWORD = 'Kinnu*0613';
// Hash of "Kinnu*0613" using the same djb2 algorithm
const ADMIN_PASSWORD_HASH = hashPassword(ADMIN_PASSWORD);

export function validateAdminCredentials(username: string, password: string): boolean {
  return (
    username.trim() === ADMIN_USERNAME &&
    hashPassword(password) === ADMIN_PASSWORD_HASH
  );
}

export function createAdminSession(): void {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expiry = Date.now() + SESSION_DURATION_MS;
  localStorage.setItem(SESSION_KEY, token);
  localStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString());
}

export function isAdminSessionValid(): boolean {
  const token = localStorage.getItem(SESSION_KEY);
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  if (!token || !expiry) return false;
  return Date.now() < parseInt(expiry, 10);
}

export function clearAdminSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
}

/**
 * Returns the hardcoded admin credentials so the frontend can call
 * actor.loginWithPassword() to authenticate with the backend canister.
 */
export function getAdminCredentials(): { username: string; password: string } {
  return { username: ADMIN_USERNAME, password: ADMIN_PASSWORD };
}
