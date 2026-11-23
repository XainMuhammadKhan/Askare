import { http } from '../client';
import { LoginResponse, RegisterPayload, Specialization, User, UserRole } from '../types';

/** Authentication endpoints — /api/auth */
export const authService = {
  login: (email: string, password: string, userType: UserRole) =>
    http.post<LoginResponse>('/api/auth/login', { email, password, userType }),

  register: (payload: RegisterPayload) => http.post<unknown>('/api/auth/register', payload),

  verifyOtp: (email: string, userType: UserRole, otp: string) =>
    http.post<LoginResponse>('/api/auth/verify-otp', { email, userType, otp }),

  resendOtp: (email: string, userType: UserRole) =>
    http.post<unknown>('/api/auth/resend-otp', { email, userType }),

  forgotPassword: (email: string, userType: UserRole) =>
    http.post<unknown>('/api/auth/forgot-password', { email, userType }),

  resetPassword: (email: string, userType: UserRole, otp: string, newPassword: string) =>
    http.post<unknown>('/api/auth/reset-password', { email, userType, otp, newPassword }),

  profile: () => http.get<User>('/api/auth/profile'),

  logout: () => http.post<unknown>('/api/auth/logout'),

  specializations: () => http.get<Specialization[]>('/api/auth/specializations'),
};
