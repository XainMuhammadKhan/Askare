import { create } from 'zustand';

export type UserRole = 'patient' | 'doctor';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: UserRole | null;
  login: (email: string, password: string, role?: UserRole) => void;
  signup: (name: string, email: string, password: string, role: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  role: null,

  login: (email: string, _password: string, role?: UserRole) => {
    const userRole = role || 'patient';
    set({
      isAuthenticated: true,
      role: userRole,
      user: {
        id: userRole === 'patient' ? 'AC-98234-L' : 'DOC-44221',
        name: userRole === 'patient' ? 'Sarah Jenkins' : 'Dr. Khan',
        email,
        role: userRole,
        phone: '+1 (555) 123-4567',
      },
    });
  },

  signup: (name: string, email: string, _password: string, role: UserRole) => {
    set({
      isAuthenticated: true,
      role,
      user: {
        id: role === 'patient' ? 'AC-98234-L' : 'DOC-44221',
        name,
        email,
        role,
        phone: '',
      },
    });
  },

  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      role: null,
    });
  },

  setRole: (role: UserRole) => {
    set({ role });
  },
}));
