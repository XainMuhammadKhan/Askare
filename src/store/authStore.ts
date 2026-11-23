import { create } from 'zustand';
import { authService, tokenStorage, setUnauthorizedHandler, User, UserRole } from '../api';

export type { UserRole };

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: UserRole | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  /** Used after OTP verification, which also returns a token. */
  setSession: (user: User, accessToken: string) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => Promise<void>;
}

const signedOut = { isAuthenticated: false, user: null, role: null };

export const useAuthStore = create<AuthState>((set) => ({
  ...signedOut,

  setSession: (user, accessToken) => {
    tokenStorage.set(accessToken);
    set({ isAuthenticated: true, user, role: user.role });
  },

  login: async (email, password, role) => {
    const { user, token } = await authService.login(email.trim(), password, role);
    useAuthStore.getState().setSession({ ...user, role }, token.accessToken);
  },

  updateUser: (patch) => set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Token may already be invalid — sign out locally anyway.
    }
    tokenStorage.set(null);
    set(signedOut);
  },
}));

// Any 401 from the API (expired token) sends the user back to login.
setUnauthorizedHandler(() => {
  tokenStorage.set(null);
  useAuthStore.setState(signedOut);
});
