import { http } from '../../../api';

export const doctorExtrasApi = {
  listExceptions: () => http.get<any[]>('/api/doctors/me/exceptions'),

  addException: (data: {
    date: string;
    type: 'UNAVAILABLE' | 'EXTRA_AVAILABILITY';
    startTime?: string;
    endTime?: string;
    reason?: string;
  }) => http.post<any>('/api/doctors/me/exceptions', data),

  deleteException: (id: number) => http.delete<unknown>(`/api/doctors/me/exceptions/${id}`),

  blockSlot: (slotId: number) => http.patch<unknown>(`/api/doctors/me/slots/${slotId}/block`),

  unblockSlot: (slotId: number) => http.patch<unknown>(`/api/doctors/me/slots/${slotId}/unblock`),

  listDocuments: () => http.get<any[]>('/api/doctors/me/documents'),

  addDocument: (data: {
    title: string;
    type: 'LICENSE' | 'DEGREE' | 'CERTIFICATE' | 'OTHER';
    fileUrl: string;
  }) => http.post<any>('/api/doctors/me/documents', data),

  deleteDocument: (id: number) => http.delete<unknown>(`/api/doctors/me/documents/${id}`),

  addClinic: (data: {
    name: string;
    address: string;
    city?: string;
    latitude: number;
    longitude: number;
    phone?: string;
  }) => http.post<any>('/api/doctors/me/clinic', data),
};

export const {
  listExceptions,
  addException,
  deleteException,
  blockSlot,
  unblockSlot,
  listDocuments,
  addDocument,
  deleteDocument,
  addClinic,
} = doctorExtrasApi;
