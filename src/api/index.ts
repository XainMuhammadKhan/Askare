/**
 * Single entry point for everything API related.
 *   import { patientService, Appointment } from '../../api';
 */
export { http, ApiError, tokenStorage, setUnauthorizedHandler } from './client';
export * from './types';
export { authService } from './services/auth.service';
export { publicService } from './services/public.service';
export { patientService } from './services/patient.service';
export { doctorService } from './services/doctor.service';
export { aiService } from './services/ai.service';
export { notificationService, videoService } from './services/notification.service';
export { hospitalAdminService, superAdminService } from './services/admin.service';
