export type AppointmentStatus = 'pending' | 'held' | 'canceled';

export interface Appointment {
  id: number;
  patient_id: number;
  psychologist_id: number;
  status: AppointmentStatus;
  date: string;
  hour: string;
  patient?: {
    id: number;
    name: string;
    surname: string;
    email?: string;
    telephone?: string;
    patient_profile?: {
      psychologist_id?: number;
    };
  };
  psychologist?: {
    id: number;
    name: string;
    surname: string;
    email?: string;
    telephone?: string;
  };
}

export interface CreateAppointmentDto {
  patient_id: number;
  psychologist_id: number;
  status: AppointmentStatus;
  date: string;
  hour: string;
}

export interface UpdateAppointmentDto {
  patient_id?: number;
  psychologist_id?: number;
  status?: AppointmentStatus;
  date?: string;
  hour?: string;
}
