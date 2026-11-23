import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, tokenStorage, setUnauthorizedHandler, User, UserRole } from '../api';

export type { UserRole };

const AUTH_STORAGE_KEY = '@askcare/auth_session_v1';

interface StoredSession {
  user: User;
  role: UserRole;
  accessToken: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  user: User | null;
  role: UserRole | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  /** Used after OTP verification, which also returns a token. */
  setSession: (user: User, accessToken: string) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => Promise<void>;
}

const signedOut = { isAuthenticated: false, user: null, role: null };

const persistSession = async (session: StoredSession | null) => {
  try {
    if (!session) {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }
  } catch {
    // Ignore storage write errors
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...signedOut,
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed: StoredSession = JSON.parse(raw);
        if (parsed?.accessToken && parsed?.user && parsed?.role) {
          tokenStorage.set(parsed.accessToken);
          set({
            isAuthenticated: true,
            user: parsed.user,
            role: parsed.role,
            isHydrated: true,
          });
          return;
        }
      }
    } catch {
      // Fall back to signed-out state if storage is corrupt
    }
    set({ isHydrated: true });
  },

  setSession: (user, accessToken) => {
    const role = user.role;
    tokenStorage.set(accessToken);
    set({ isAuthenticated: true, user, role, isHydrated: true });
    persistSession({ user, role, accessToken });
  },

  login: async (email, password, role) => {
    const { user, token } = await authService.login(email.trim(), password, role);
    const fullUser = { ...user, role };
    get().setSession(fullUser, token.accessToken);
  },

  updateUser: (patch) => {
    set((s) => {
      if (!s.user) return { user: null };
      const updated = { ...s.user, ...patch };
      const currentToken = tokenStorage.get();
      if (currentToken && s.role) {
        persistSession({ user: updated, role: s.role, accessToken: currentToken });
      }
      return { user: updated };
    });
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Token may already be invalid — sign out locally anyway.
    }
    tokenStorage.set(null);
    await persistSession(null);
    set({ ...signedOut, isHydrated: true });
  },
}));

// Any 401 from the API (expired token) clears storage and sends the user back to login.
setUnauthorizedHandler(() => {
  tokenStorage.set(null);
  persistSession(null);
  useAuthStore.setState({ ...signedOut, isHydrated: true });
});
