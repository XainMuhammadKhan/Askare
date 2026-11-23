import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Appointment, PaymentStatus, patientService } from '../../api';

interface UsePaymentPollingOptions {
  appointmentId?: number;
  intervalMs?: number;
  maxDurationMs?: number;
}

export function usePaymentPolling({
  appointmentId,
  intervalMs = 3000,
  maxDurationMs = 30000,
}: UsePaymentPollingOptions) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [timedOut, setTimedOut] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const fetchOnce = useCallback(async (): Promise<Appointment | null> => {
    try {
      const list = await patientService.myAppointments();
      if (!mountedRef.current) return null;

      const target = appointmentId
        ? list.find((a) => Number(a.id) === Number(appointmentId)) ?? null
        : list[0] ?? null;

      if (target) {
        setAppointment(target);
      }
      setError(null);
      return target;
    } catch (e: any) {
      if (mountedRef.current) {
        setError(e?.message || 'Could not verify payment status.');
      }
      return null;
    }
  }, [appointmentId]);

  const scheduleNext = useCallback(async () => {
    clearTimer();
    const appt = await fetchOnce();
    if (!mountedRef.current) return;

    if (appt && appt.paymentStatus !== 'PENDING') {
      setIsPolling(false);
      setTimedOut(false);
      return;
    }

    const elapsed = Date.now() - startTimeRef.current;
    if (elapsed >= maxDurationMs) {
      setIsPolling(false);
      setTimedOut(true);
      return;
    }

    setIsPolling(true);
    timerRef.current = setTimeout(scheduleNext, intervalMs);
  }, [fetchOnce, intervalMs, maxDurationMs]);

  const checkNow = useCallback(async () => {
    startTimeRef.current = Date.now();
    setTimedOut(false);
    setIsPolling(true);
    await scheduleNext();
  }, [scheduleNext]);

  useEffect(() => {
    mountedRef.current = true;
    startTimeRef.current = Date.now();
    scheduleNext();

    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        checkNow();
      }
    });

    return () => {
      mountedRef.current = false;
      clearTimer();
      sub.remove();
    };
  }, [scheduleNext, checkNow]);

  const paymentStatus: PaymentStatus = appointment?.paymentStatus ?? 'PENDING';

  return {
    appointment,
    paymentStatus,
    isPolling,
    timedOut,
    error,
    checkNow,
  };
}
