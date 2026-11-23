import { http } from '../client';
import { Doctor, DoctorDetail, DoctorSearchParams, Slot, Specialization } from '../types';

/** Public data & doctor search — no token required. */
export const publicService = {
  specializations: () => http.get<Specialization[]>('/api/public/specializations'),

  hospitals: () => http.get<any[]>('/api/public/hospitals'),

  hospital: (id: number) => http.get<any>(`/api/public/hospitals/${id}`),

  findDoctors: (params: DoctorSearchParams = {}) =>
    http.getPaginated<Doctor[]>('/api/doctors', { ...params }),

  doctor: (doctorId: number) => http.get<DoctorDetail>(`/api/doctors/${doctorId}`),

  /** Free slots between two dates (YYYY-MM-DD), max 60 days. */
  doctorSlots: (doctorId: number, from: string, to: string) =>
    http.get<Slot[]>(`/api/doctors/${doctorId}/slots`, { from, to }),

  /** Upload an image file; returns a hosted URL. */
  uploadImage: (file: { uri: string; name: string; type: string }) => {
    const form = new FormData();
    form.append('file', file as any);
    return http.post<{ url: string }>('/upload/image', form);
  },
};
