import { http } from '../client';
import {
  Appointment,
  AppointmentDetail,
  ConsultationType,
  MedicalProfile,
  MedicalRecords,
  PatientDashboard,
  PatientDocument,
  PaymentsSummary,
  ReserveResponse,
  User,
} from '../types';

/** Patient portal + booking endpoints (patient token). */
export const patientService = {
  // ----- Home / profile -----
  dashboard: () => http.get<PatientDashboard>('/api/patients/me/dashboard'),

  updateProfile: (data: Partial<User>) => http.patch<User>('/api/patients/me/profile', data),

  getMedicalProfile: () => http.get<MedicalProfile>('/api/patients/me/medical-profile'),

  saveMedicalProfile: (data: MedicalProfile) =>
    http.put<MedicalProfile>('/api/patients/me/medical-profile', data),

  medicalRecords: () => http.get<MedicalRecords>('/api/patients/me/medical-records'),

  healthTip: () => http.get<{ tip: string; aiGenerated: boolean; date: string }>('/api/patients/me/health-tip'),

  healthReport: (month?: string) => http.get<any>('/api/patients/me/health-report', { month }),

  // ----- Documents -----
  documents: () => http.get<PatientDocument[]>('/api/patients/me/documents'),

  addDocument: (data: { title: string; fileUrl: string; type?: string; notes?: string }) =>
    http.post<PatientDocument>('/api/patients/me/documents', data),

  explainDocument: (id: number) => http.post<PatientDocument>(`/api/patients/me/documents/${id}/explain`),

  deleteDocument: (id: number) => http.delete<unknown>(`/api/patients/me/documents/${id}`),

  // ----- Payments -----
  payments: () => http.get<PaymentsSummary>('/api/patients/me/payments'),

  receiptUrl: (appointmentId: number) => http.url(`/api/patients/me/payments/${appointmentId}/receipt`),

  prescriptionPdfUrl: (prescriptionId: number) => http.url(`/api/patients/me/prescriptions/${prescriptionId}/pdf`),

  // ----- Appointments -----
  /** Holds a slot for 35 minutes and returns a Stripe checkoutUrl. */
  reserve: (slotId: number, consultationType: ConsultationType = 'VIDEO', reason?: string) =>
    http.post<ReserveResponse>('/api/doctors/appointments/reserve', { slotId, consultationType, reason }),

  myAppointments: () => http.get<Appointment[]>('/api/doctors/appointments/mine'),

  appointment: (id: number) => http.get<AppointmentDetail>(`/api/patients/me/appointments/${id}`),

  cancelAppointment: (id: number, reason?: string) =>
    http.patch<unknown>(`/api/doctors/appointments/${id}/cancel`, { reason }),

  reviewDoctor: (id: number, rating: number, comment?: string) =>
    http.post<unknown>(`/api/patients/me/appointments/${id}/review`, { rating, comment }),
};
