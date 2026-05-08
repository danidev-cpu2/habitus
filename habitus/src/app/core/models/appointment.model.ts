import type { User } from './user.model';

export type AppointmentStatus = 'pending' | 'canceled' | 'held';

export interface Appointment {
  id: number;
  patient_id: number;
  psychologist_id: number;
  status: AppointmentStatus;
  date: string; // yyyy-mm-dd
  hour: string; // HH:mm:ss
  created_at?: string;
  updated_at?: string;
  patient?: User;
  psychologist?: User;
}

