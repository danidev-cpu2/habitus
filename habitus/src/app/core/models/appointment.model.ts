export type AppointmentType   = 'individual' | 'grupal' | 'evaluacion';
export type AppointmentStatus = 'pending' | 'confirmed' | 'canceled' | 'held';

/** Mapea la tabla `appointments` de la BD habitus */
export interface Appointment {
  id: number;
  patient_id: number;
  psychologist_id: number;
  /** ISO date YYYY-MM-DD */
  date: string;
  /** Hora inicio en formato HH:MM (24 h) */
  start_time: string;
  /** Hora fin en formato HH:MM (24 h) */
  end_time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  /** Relaciones populadas por el backend */
  patient?: { id: number; name: string; surname: string };
  psychologist?: { id: number; name: string; surname: string };
}

/** DTO para POST /appointments */
export interface CreateAppointmentDto {
  patient_id: number;
  psychologist_id: number;
  date: string;
  start_time: string;
  end_time: string;
  type: AppointmentType;
  notes?: string;
}

/** DTO para PUT /appointments/:id */
export interface UpdateAppointmentDto {
  patient_id?: number;
  psychologist_id?: number;
  date?: string;
  start_time?: string;
  end_time?: string;
  type?: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
}

// ─── Datos de ejemplo ──────────────────────────────────────────────────────────
// Generados en runtime para que las fechas sean siempre la semana actual.

function getThisMonday(): Date {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoDate(base: Date, offsetDays: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function getMockAppointments(): Appointment[] {
  const mon = getThisMonday();
  return [
    {
      id: 1, patient_id: 10, psychologist_id: 1,
      date: isoDate(mon, 1), start_time: '09:00', end_time: '10:00',
      type: 'individual', status: 'pending',
      patient:      { id: 10, name: 'Juan',    surname: 'Pérez'    },
      psychologist: { id: 1,  name: 'María',   surname: 'García'   },
    },
    {
      id: 2, patient_id: 11, psychologist_id: 1,
      date: isoDate(mon, 1), start_time: '11:00', end_time: '12:00',
      type: 'evaluacion', status: 'pending',
      patient:      { id: 11, name: 'Laura',   surname: 'Gómez'    },
      psychologist: { id: 1,  name: 'María',   surname: 'García'   },
    },
    {
      id: 3, patient_id: 12, psychologist_id: 2,
      date: isoDate(mon, 2), start_time: '10:00', end_time: '11:00',
      type: 'individual', status: 'pending',
      patient:      { id: 12, name: 'Roberto', surname: 'Silva'    },
      psychologist: { id: 2,  name: 'Ana',     surname: 'Martínez' },
    },
    {
      // Misma hora y día que cita 3 → dos psicólogos a las 10:00 del miércoles
      id: 7, patient_id: 20, psychologist_id: 3,
      date: isoDate(mon, 2), start_time: '10:00', end_time: '11:00',
      type: 'individual', status: 'confirmed',
      patient:      { id: 20, name: 'Marta',   surname: 'Ruiz'     },
      psychologist: { id: 3,  name: 'Carlos',  surname: 'López'    },
    },
    {
      id: 4, patient_id: 13, psychologist_id: 3,
      date: isoDate(mon, 2), start_time: '16:00', end_time: '17:30',
      type: 'grupal', status: 'pending',
      patient:      { id: 13, name: 'Grupo',   surname: 'Adolescentes' },
      psychologist: { id: 3,  name: 'Carlos',  surname: 'López'        },
    },
    {
      id: 5, patient_id: 14, psychologist_id: 3,
      date: isoDate(mon, 4), start_time: '09:00', end_time: '10:00',
      type: 'individual', status: 'pending',
      patient:      { id: 14, name: 'Carmen',  surname: 'Ruiz'     },
      psychologist: { id: 3,  name: 'Carlos',  surname: 'López'    },
    },
    {
      id: 6, patient_id: 15, psychologist_id: 4,
      date: isoDate(mon, 5), start_time: '14:00', end_time: '15:00',
      type: 'evaluacion', status: 'held',
      patient:      { id: 15, name: 'Diego',   surname: 'Fernández' },
      psychologist: { id: 4,  name: 'Pedro',   surname: 'Sánchez'   },
    },
  ];
}
