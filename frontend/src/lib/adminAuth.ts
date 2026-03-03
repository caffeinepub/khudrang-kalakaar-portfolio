// Admin authentication utility
// Credentials are validated against the backend via loginWithPassword.
// Client-side session is stored in sessionStorage to persist across page navigations.

const SESSION_KEY = 'admin_session';
const ADMIN_USERNAME = 'DeepakKumawat';
const ADMIN_PASSWORD = 'Deepak@123';

export interface AdminSession {
  username: string;
  timestamp: number;
}

export function getAdminCredentials(): { username: string; password: string } {
  return { username: ADMIN_USERNAME, password: ADMIN_PASSWORD };
}

export function createSession(username: string): void {
  const session: AdminSession = {
    username,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function validateSession(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const session: AdminSession = JSON.parse(raw);
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    return Date.now() - session.timestamp < SESSION_DURATION;
  } catch {
    return false;
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
