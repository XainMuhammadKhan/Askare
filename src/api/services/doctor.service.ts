import { http } from '../client';
import {
  Appointment,
  AppointmentDetail,
  Consultation,
  DoctorDashboard,
  DoctorPatient,
  PrescriptionItem,
  Review,
} from '../types';

const base = '/api/doctors/me';

/** Doctor portal endpoints (doctor token). */
export const doctorService = {
  // ----- Overview -----
  dashboard: () => http.get<DoctorDashboard>(`${base}/dashboard`),
  profile: () => http.get<any>(`${base}/profile`),
  updateProfile: (data: Record<string, unknown>) => http.patch<any>(`${base}/profile`, data),
  earnings: () => http.get<any>(`${base}/earnings`),
  reviews: () => http.get<Review[]>(`${base}/reviews`),

  // ----- Requests & appointments -----
  requests: () => http.get<Appointment[]>(`${base}/requests`),
  accept: (id: number) => http.patch<unknown>(`${base}/appointments/${id}/accept`),
  reject: (id: number, reason?: string) => http.patch<unknown>(`${base}/appointments/${id}/reject`, { reason }),
  appointments: () => http.get<Appointment[]>(`${base}/appointments`),
  appointment: (id: number) => http.get<AppointmentDetail>(`${base}/appointments/${id}`),
  cancel: (id: number, reason?: string) => http.patch<unknown>(`/api/doctors/appointments/${id}/cancel`, { reason }),

  // ----- Consultation -----
  saveConsultation: (id: number, data: Consultation) => http.put<unknown>(`${base}/appointments/${id}/consultation`, data),
  savePrescription: (id: number, items: PrescriptionItem[], notes?: string, labTests?: string[]) =>
    http.put<unknown>(`${base}/appointments/${id}/prescription`, { items, notes, labTests }),
  complete: (id: number) => http.patch<unknown>(`${base}/appointments/${id}/complete`),
  noShow: (id: number) => http.patch<unknown>(`${base}/appointments/${id}/no-show`),

  // ----- Patients -----
  patients: (search?: string) => http.get<DoctorPatient[]>(`${base}/patients`, { search }),
  patient: (patientId: number) => http.get<any>(`${base}/patients/${patientId}`),

  // ----- Schedule -----
  availability: () => http.get<any[]>(`${base}/availability`),
  addAvailability: (data: { dayOfWeek: number; startTime: string; endTime: string; slotDuration?: number }) =>
    http.post<unknown>(`${base}/availability`, data),
  deleteAvailability: (id: number) => http.delete<unknown>(`${base}/availability/${id}`),
  generateSlots: (from: string, to: string) => http.post<unknown>(`${base}/slots/generate`, { from, to }),
  calendar: (from: string, to: string) => http.get<any[]>(`${base}/calendar`, { from, to }),

  // ----- Payouts -----
  payouts: () => http.get<any>(`${base}/payouts`),
  requestPayout: (amount: number, method?: string) => http.post<unknown>(`${base}/payouts`, { amount, method }),
};
