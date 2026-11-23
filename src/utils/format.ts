import { ENV } from '../config/env';
import { Appointment, AppointmentStatus, PaymentStatus } from '../api/types';

/** Display helpers. All dates are shown in Pakistan time. */

const tz = { timeZone: ENV.TIMEZONE } as const;

export const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { ...tz, month: 'short', day: 'numeric', year: 'numeric' }) : '';

export const formatTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-US', { ...tz, hour: '2-digit', minute: '2-digit' }) : '';

export const formatDateTime = (iso?: string | null) => (iso ? `${formatDate(iso)}, ${formatTime(iso)}` : '');

/** "Just now", "5m ago", "3h ago", "2d ago", else a date. */
export const timeAgo = (iso: string) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  if (mins < 10080) return `${Math.floor(mins / 1440)}d ago`;
  return formatDate(iso);
};

export const formatMoney = (amount?: number | string | null) =>
  `${ENV.CURRENCY} ${Number(amount ?? 0).toLocaleString('en-US')}`;

/** YYYY-MM-DD for a date `daysFromToday` days away (used in slot queries). */
export const isoDay = (daysFromToday = 0) => {
  const d = new Date(Date.now() + daysFromToday * 86400000);
  return d.toLocaleDateString('en-CA', tz);
};

export const initials = (name?: string) =>
  (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

export const doctorName = (name?: string) => (name ? (name.startsWith('Dr') ? name : `Dr. ${name}`) : '');

/** First specialization name from either API shape. */
export const specializationOf = (doctor?: { specializations?: any[] }) => {
  const s = doctor?.specializations?.[0];
  return s?.name ?? s?.specialization?.name ?? 'General';
};

/**
 * Status shown to users, per the backend's mobile notes:
 * PENDING + AUTHORIZED = awaiting doctor, PENDING + PENDING = unfinished checkout.
 */
export type DisplayStatus = 'awaiting_payment' | 'awaiting_doctor' | 'upcoming' | 'completed' | 'cancelled' | 'no_show';

export const displayStatus = (a: Pick<Appointment, 'status' | 'paymentStatus'>): DisplayStatus => {
  const map: Record<AppointmentStatus, DisplayStatus> = {
    PENDING: a.paymentStatus === 'PENDING' ? 'awaiting_payment' : 'awaiting_doctor',
    CONFIRMED: 'upcoming',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
  };
  return map[a.status];
};

export const STATUS_LABEL: Record<DisplayStatus, string> = {
  awaiting_payment: 'Complete payment',
  awaiting_doctor: 'Awaiting doctor',
  upcoming: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No-show',
};

export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  AUTHORIZED: 'On hold',
  PAID: 'Paid',
  FAILED: 'Failed',
  CANCELLED: 'Released',
  REFUNDED: 'Refunded',
};
