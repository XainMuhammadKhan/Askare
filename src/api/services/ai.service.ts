import { http } from '../client';
import { ChatConversation, ChatReply, PrescriptionItem, SymptomAnalysis } from '../types';

/** AI endpoints — symptom checker, patient chat, doctor helpers. */
export const aiService = {
  health: () => http.get<any>('/api/ai/health'),

  analyzeSymptoms: (message: string) => http.post<SymptomAnalysis>('/api/ai/symptom-analysis', { message }),

  // ----- Patient chat -----
  conversations: () => http.get<ChatConversation[]>('/api/ai/chat/conversations'),
  createConversation: (title?: string) => http.post<ChatConversation>('/api/ai/chat/conversations', { title }),
  conversation: (id: number) => http.get<ChatConversation>(`/api/ai/chat/conversations/${id}`),
  deleteConversation: (id: number) => http.delete<unknown>(`/api/ai/chat/conversations/${id}`),
  sendMessage: (id: number, message: string) =>
    http.post<ChatReply>(`/api/ai/chat/conversations/${id}/messages`, { message }),

  // ----- Doctor helpers -----
  patientBrief: (appointmentId: number) => http.get<any>(`/api/ai/doctor/appointments/${appointmentId}/summary`),
  prescriptionCheck: (appointmentId: number, items: Pick<PrescriptionItem, 'medicine' | 'dosage' | 'frequency'>[]) =>
    http.post<any>('/api/ai/doctor/prescription-check', { appointmentId, items }),
  soapNotes: (appointmentId: number, rawNotes: string) =>
    http.post<any>(`/api/ai/doctor/appointments/${appointmentId}/soap`, { rawNotes }),
};
