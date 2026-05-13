import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'appointment' | 'payment' | 'message' | 'reminder';
  priority?: boolean;
  read: boolean;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'approved' | 'cancelled' | 'completed' | 'new_request';
  avatar?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  experience: string;
  fee: string;
  rating: number;
  avatar?: string;
  nextAvailable?: string;
}

export interface PatientRecord {
  id: string;
  patientId: string;
  name: string;
  status: 'critical' | 'active' | 'stable';
  lastVisit: string;
  nextAction: string;
  avatar?: string;
}

interface AppState {
  notifications: Notification[];
  appointments: Appointment[];
  doctors: Doctor[];
  patientRecords: PatientRecord[];
  markAllNotificationsRead: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  notifications: [
    {
      id: '1',
      title: 'Appointment Approved',
      message: 'Your consultation with Dr. Arshad has been confirmed for tomorrow at 10:00 AM.',
      time: 'Just Now',
      type: 'appointment',
      priority: true,
      read: false,
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'Transaction for Invoice #ASK-9022 has been successfully processed.',
      time: '2H Ago',
      type: 'payment',
      read: false,
    },
    {
      id: '3',
      title: 'New Message',
      message: 'Care Coordinator sent a new attachment regarding your health plan.',
      time: '5H Ago',
      type: 'message',
      read: false,
    },
    {
      id: '4',
      title: 'Appointment Reminder',
      message: "Don't forget your follow-up checkup scheduled for later this week.",
      time: 'Yesterday',
      type: 'reminder',
      read: true,
    },
  ],

  appointments: [
    {
      id: '1',
      doctorName: 'Dr. Ayesha Khan',
      specialty: 'Cardiology Specialist',
      date: 'Oct 24, 2023',
      time: '10:00 AM',
      status: 'confirmed',
    },
    {
      id: '2',
      doctorName: 'Fatima Ali',
      specialty: 'General Practice',
      date: 'Oct 24, 2023',
      time: '16:00 PM',
      status: 'new_request',
    },
    {
      id: '3',
      doctorName: 'Ali Raza',
      specialty: 'Orthopedics',
      date: 'Oct 24, 2023',
      time: '17:30 PM',
      status: 'new_request',
    },
    {
      id: '4',
      doctorName: 'Dr. Sana Mirza',
      specialty: 'Dermatologist',
      date: 'Sep 15, 2023',
      time: '11:15 AM',
      status: 'completed',
    },
    {
      id: '5',
      doctorName: 'Dr. Ayesha Khan',
      specialty: 'Cardiologist',
      date: 'Oct 24, 2023',
      time: '10:30 AM',
      status: 'pending',
    },
    {
      id: '6',
      doctorName: 'Dr. Omar Farooq',
      specialty: 'Neurologist',
      date: 'Oct 25, 2023',
      time: '02:00 PM',
      status: 'approved',
    },
    {
      id: '7',
      doctorName: 'Dr. Sarah Malik',
      specialty: 'Dermatologist',
      date: 'Oct 22, 2023',
      time: '',
      status: 'cancelled',
    },
  ],

  doctors: [
    {
      id: '1',
      name: 'Dr. Sarah Jenkins',
      specialty: 'Cardiology',
      hospital: 'Mount Sinai Hospital',
      experience: '12 Years Exp.',
      fee: 'PKR 2,500',
      rating: 4.9,
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Neurology',
      hospital: 'Johns Hopkins Medicine',
      experience: '15 Years Exp.',
      fee: 'PKR 3,000',
      rating: 4.8,
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      hospital: "Children's National",
      experience: '8 Years Exp.',
      fee: 'PKR 2,000',
      rating: 5.0,
    },
    {
      id: '4',
      name: 'Dr. Ayesha Khan',
      specialty: 'Psychiatrist',
      hospital: 'Zenith Medical Complex',
      experience: '8 Years Exp.',
      fee: 'PKR 5,000',
      rating: 4.9,
      nextAvailable: '10:00 AM',
    },
    {
      id: '5',
      name: 'Dr. Omar Farooq',
      specialty: 'Pediatrician',
      hospital: 'South City Hospital',
      experience: '10 Years Exp.',
      fee: 'PKR 2,500',
      rating: 4.8,
      nextAvailable: '2:30 PM',
    },
  ],

  patientRecords: [
    {
      id: '1',
      patientId: 'P-8924',
      name: 'Arthur Pendelton',
      status: 'critical',
      lastVisit: 'Today, 09:30 AM',
      nextAction: 'Review Lab Results',
    },
    {
      id: '2',
      patientId: 'P-4412',
      name: 'Eleanor Vance',
      status: 'active',
      lastVisit: 'Oct 12, 2023',
      nextAction: 'Prescription Renewal',
    },
    {
      id: '3',
      patientId: 'P-1109',
      name: 'Marcus Chen',
      status: 'stable',
      lastVisit: 'Sep 05, 2023',
      nextAction: 'Routine Follow-up',
    },
    {
      id: '4',
      patientId: 'P-9011',
      name: 'Sarah Jenkins',
      status: 'stable',
      lastVisit: 'Aug 20, 2023',
      nextAction: 'Annual Checkup',
    },
  ],

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },
}));
