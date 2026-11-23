import { http } from '../client';

type Query = Record<string, string | number | undefined>;
type Status = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

/** Hospital admin portal — /api/hospital (HOSPITAL_ADMIN token). */
export const hospitalAdminService = {
  dashboard: () => http.get<any>('/api/hospital/dashboard'),
  profile: () => http.get<any>('/api/hospital/profile'),
  updateProfile: (data: Record<string, unknown>) => http.patch<any>('/api/hospital/profile', data),
  insights: () => http.get<any>('/api/hospital/insights'),
  revenue: () => http.get<any>('/api/hospital/revenue'),
  patients: (search?: string) => http.get<any[]>('/api/hospital/patients', { search }),

  // ----- Doctors -----
  doctors: (query: Query = {}) => http.get<any[]>('/api/hospital/doctors', query),
  doctor: (id: number) => http.get<any>(`/api/hospital/doctors/${id}`),
  createDoctor: (data: Record<string, unknown>) => http.post<any>('/api/hospital/doctors', data),
  approveDoctor: (id: number) => http.patch<unknown>(`/api/hospital/doctors/${id}/approve`),
  rejectDoctor: (id: number, reason?: string) => http.patch<unknown>(`/api/hospital/doctors/${id}/reject`, { reason }),
  setDoctorStatus: (id: number, status: Status) => http.patch<unknown>(`/api/hospital/doctors/${id}/status`, { status }),
  setDoctorFee: (id: number, consultationFee: number) => http.patch<unknown>(`/api/hospital/doctors/${id}/fee`, { consultationFee }),
  assignDepartment: (id: number, departmentId: number | null) =>
    http.patch<unknown>(`/api/hospital/doctors/${id}/department`, { departmentId }),
  doctorFreeSlots: (id: number) => http.get<any[]>(`/api/hospital/doctors/${id}/free-slots`),

  // ----- Appointments -----
  appointments: (query: Query = {}) => http.getPaginated<any[]>('/api/hospital/appointments', query),
  cancelAppointment: (id: number, reason?: string) => http.patch<unknown>(`/api/hospital/appointments/${id}/cancel`, { reason }),
  reassign: (id: number, doctorId: number, slotId: number) =>
    http.post<unknown>(`/api/hospital/appointments/${id}/reassign`, { doctorId, slotId }),

  // ----- Departments -----
  departments: () => http.get<any[]>('/api/hospital/departments'),
  createDepartment: (name: string, description?: string) => http.post<any>('/api/hospital/departments', { name, description }),
  renameDepartment: (id: number, name: string) => http.patch<unknown>(`/api/hospital/departments/${id}`, { name }),
  deleteDepartment: (id: number) => http.delete<unknown>(`/api/hospital/departments/${id}`),
};

/** Super admin portal — /api/super-admin (SUPER_ADMIN token). */
const sa = '/api/super-admin';
export const superAdminService = {
  dashboard: () => http.get<any>(`${sa}/dashboard`),
  systemHealth: () => http.get<any>(`${sa}/system-health`),
  aiUsage: () => http.get<any>(`${sa}/ai-usage`),
  auditLogs: (page = 1) => http.getPaginated<any[]>(`${sa}/audit-logs`, { page }),

  // ----- Hospitals -----
  hospitals: (query: Query = {}) => http.getPaginated<any[]>(`${sa}/hospitals`, query),
  hospital: (id: number) => http.get<any>(`${sa}/hospitals/${id}`),
  createHospital: (hospital: Record<string, unknown>, admin: Record<string, unknown>) =>
    http.post<any>(`${sa}/create-hospital-and-admin`, { hospital, admin }),
  updateHospital: (id: number, data: Record<string, unknown>) => http.patch<unknown>(`${sa}/hospitals/${id}`, data),
  setHospitalStatus: (id: number, status: Status) => http.patch<unknown>(`${sa}/hospitals/${id}/status`, { status }),
  resetHospitalAdminPassword: (id: number) => http.post<unknown>(`${sa}/hospitals/${id}/reset-admin-password`),

  // ----- Doctors & patients -----
  doctors: (query: Query = {}) => http.getPaginated<any[]>(`${sa}/doctors`, query),
  doctor: (id: number) => http.get<any>(`${sa}/doctors/${id}`),
  approveDoctor: (id: number) => http.patch<unknown>(`${sa}/doctors/${id}/approve`),
  rejectDoctor: (id: number, reason?: string) => http.patch<unknown>(`${sa}/doctors/${id}/reject`, { reason }),
  setDoctorStatus: (id: number, status: Status) => http.patch<unknown>(`${sa}/doctors/${id}/status`, { status }),
  patients: (query: Query = {}) => http.getPaginated<any[]>(`${sa}/patients`, query),
  setPatientStatus: (id: number, status: Status) => http.patch<unknown>(`${sa}/patients/${id}/status`, { status }),

  // ----- Money -----
  appointments: (query: Query = {}) => http.getPaginated<any[]>(`${sa}/appointments`, query),
  refund: (id: number, reason?: string) => http.post<unknown>(`${sa}/appointments/${id}/refund`, { reason }),
  payouts: (query: Query = {}) => http.getPaginated<any[]>(`${sa}/payouts`, query),
  processPayout: (id: number, status: 'PAID' | 'REJECTED', note?: string) => http.patch<unknown>(`${sa}/payouts/${id}`, { status, note }),

  // ----- Settings & content -----
  settings: () => http.get<any>(`${sa}/settings`),
  updateSettings: (data: Record<string, unknown>) => http.put<any>(`${sa}/settings`, data),
  commission: () => http.get<any>(`${sa}/settings/commission`),
  setCommission: (commissionPercent: number) => http.put<unknown>(`${sa}/settings/commission`, { commissionPercent }),
  specializations: () => http.get<any[]>(`${sa}/specializations`),
  addSpecialization: (name: string) => http.post<unknown>(`${sa}/specializations`, { name }),
  renameSpecialization: (id: number, name: string) => http.patch<unknown>(`${sa}/specializations/${id}`, { name }),
  deleteSpecialization: (id: number) => http.delete<unknown>(`${sa}/specializations/${id}`),
  reviews: (page = 1) => http.getPaginated<any[]>(`${sa}/reviews`, { page }),
  setReviewVisibility: (id: number, isHidden: boolean) => http.patch<unknown>(`${sa}/reviews/${id}/visibility`, { isHidden }),
};
