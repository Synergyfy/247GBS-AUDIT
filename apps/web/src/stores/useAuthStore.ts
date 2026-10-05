import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistSession, clearSession, SESSION_EXPIRED_EVENT } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isOnboarded?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

/**
 * Legacy Zustand store — now a thin adapter over the single session helpers
 * in `@/lib/auth` (AuthContext remains authoritative for `247gbs_user`).
 * Both write the same keys so sign-in/out in either store stays in sync.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        persistSession(user, token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        clearSession();
        set({ user: null, token: null, isAuthenticated: false });
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

// Initialize from localStorage on app load (primary 247gbs_token, legacy auth_token fallback)
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('247gbs_token') || localStorage.getItem('auth_token');
  let user: User | null = null;
  try {
    const raw = localStorage.getItem('247gbs_user');
    if (raw) user = JSON.parse(raw);
  } catch {
    user = null;
  }
  if (token) {
    useAuthStore.setState({ token, user, isAuthenticated: true });
  } else if (user) {
    useAuthStore.setState({ user, isAuthenticated: true });
  }

  // Cross-store sync: Context-driven sign-out (or another tab) clears this store too.
  const syncClear = () => useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  window.addEventListener(SESSION_EXPIRED_EVENT, syncClear);
  window.addEventListener('storage', (e) => {
    if (e.key === '247gbs_user' && e.newValue === null) syncClear();
    if ((e.key === '247gbs_token' || e.key === 'auth_token') && e.newValue) {
      useAuthStore.setState({ token: e.newValue, isAuthenticated: true });
    }
  });
}
