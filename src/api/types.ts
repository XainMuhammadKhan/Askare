/**
 * Data models returned by the AskCare backend.
 * Only fields used by the app are typed; see docs/api/API.md for the full spec.
 */

export type UserRole = 'patient' | 'doctor' | 'admin';
/** Only set for admin users. */
export type AdminType = 'SUPER_ADMIN' | 'HOSPITAL_ADMIN';
export type ID = number;

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type ConsultationType = 'VIDEO' | 'IN_PERSON';
export type Urgency = 'ROUTINE' | 'SOON' | 'URGENT' | 'EMERGENCY';

// ---------- Auth ----------
export interface User {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  address?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  bloodGroup?: string | null;
  profileImage?: string | null;
  status?: string;
  type?: AdminType;
  hospital?: { id: ID; name: string } | null;
}

export interface LoginResponse {
  user: User;
  token: { accessToken: string; refreshToken: string };
}

export interface RegisterPayload {
  userType: Exclude<UserRole, 'admin'>;
  name: string;
  email: string;
  password: string;
  phone?: string;
  specializationIds?: number[];
}

// ---------- Public ----------
export interface Specialization {
  id: ID;
  name: string;
}

export interface Rating {
  average: number;
  count: number;
}

export interface Doctor {
  id: ID;
  name: string;
  bio?: string | null;
  qualification?: string | null;
  city?: string | null;
  experience?: number | null;
  consultationFee: number | string;
  profileImage?: string | null;
  hospital?: { id: ID; name: string; city?: string } | null;
  specializations: Specialization[];
  rating?: Rating;
}

export interface Review {
  id: ID;
  rating: number;
  comment?: string | null;
  createdAt: string;
  patient?: { name: string };
}

export interface DoctorDetail extends Doctor {
  reviews?: Review[];
}

export interface Slot {
  id: ID;
  startAt: string;
  endAt: string;
}

export interface DoctorSearchParams {
  search?: string;
  specializationId?: number;
  availability?: 'today' | 'tomorrow' | 'week';
  page?: number;
  limit?: number;
}

// ---------- Appointments ----------
export interface Appointment {
  id: ID;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  consultationType: ConsultationType;
  consultationFee: string | number;
  reason?: string | null;
  slot: Slot;
  doctor?: { id: ID; name: string; profileImage?: string | null; specializations?: any[]; hospital?: { name: string } };
  patient?: { id: ID; name: string; profileImage?: string | null };
  review?: Review | null;
}

export interface Consultation {
  symptoms?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  advice?: string | null;
  followUpDate?: string | null;
}

export interface PrescriptionItem {
  medicine: string;
  dosage: string;
  frequency: string;
  durationDays?: number;
  instructions?: string;
}

export interface Prescription {
  id: ID;
  items: PrescriptionItem[];
  notes?: string | null;
  labTests?: string[];
  createdAt?: string;
}

export interface AppointmentDetail extends Appointment {
  consultation?: Consultation | null;
  prescription?: Prescription | null;
}

export interface ReserveResponse {
  appointment?: Appointment;
  checkoutUrl: string;
}

// ---------- Patient ----------
export interface PatientDashboard {
  patient: { id: ID; name: string; profileImage?: string | null };
  nextAppointment: Appointment | null;
  pendingRequests: Appointment[];
  activeMedicines: any[];
  latestPrescription: Prescription | null;
  stats: Record<string, number>;
  unreadNotifications: number;
}

export interface MedicalProfile {
  heightCm?: number | null;
  weightKg?: number | null;
  conditions?: string[];
  allergies?: string[];
  currentMedications?: string[];
  pastSurgeries?: string[];
  familyHistory?: string | null;
  lifestyleNotes?: string | null;
  emergencyContact?: string | null;
}

export interface PatientDocument {
  id: ID;
  title: string;
  fileUrl: string;
  type?: string;
  notes?: string | null;
  aiSummary?: string | null;
  recordedAt?: string | null;
  createdAt: string;
}

export interface MedicalRecords {
  profile: MedicalProfile | null;
  consultations: any[];
  prescriptions: Prescription[];
  documents: PatientDocument[];
  timeline: any[];
}

export interface PaymentsSummary {
  totals: { paid: number; held: number; refunded: number; count: number };
  items: any[];
}

// ---------- Doctor portal ----------
export interface DoctorDashboard {
  stats: {
    pendingRequests: number;
    todaysConsultations: number;
    upcomingConfirmed: number;
    earningsThisMonth: number;
    totalEarnings: number;
    totalPatients: number;
    rating: number;
    reviewCount: number;
  };
  today: Appointment[];
  monthly: { month: string; appointments: number; earnings: number }[];
}

export interface DoctorPatient {
  patient: { id: ID; name: string; gender?: string; dateOfBirth?: string; profileImage?: string | null };
  visits: number;
  lastVisit: string;
}

// ---------- Notifications ----------
export interface AppNotification {
  id: ID;
  title: string;
  body: string;
  type: 'APPOINTMENT' | 'PAYMENT' | 'PRESCRIPTION' | 'CALL' | 'APPROVAL' | 'REVIEW' | 'ACCOUNT';
  link?: string | null;
  readAt: string | null;
  createdAt: string;
}

// ---------- AI ----------
export interface SymptomAnalysis {
  detectedSymptoms: string[];
  explanation: string;
  urgency: Urgency;
  matchStatus: string;
  suggestedSpecialization?: Specialization | null;
  followUpQuestions: string[];
  emergencyMessage?: string | null;
  disclaimer: string;
}

export interface ChatMessage {
  id: ID;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatConversation {
  id: ID;
  title?: string | null;
  messages?: ChatMessage[];
  updatedAt?: string;
}

export interface ChatReply {
  answer: string;
  urgency?: Urgency;
  followUpQuestions?: string[];
  suggestBooking?: boolean;
  disclaimer?: string;
}
