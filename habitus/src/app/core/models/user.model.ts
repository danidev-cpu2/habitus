export type UserRole = 'admin' | 'psychologist' | 'receptionist' | 'patient';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  dni: string;
  telephone?: string;
  rol: UserRole;
  status?: UserStatus;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
  // Laravel devuelve en snake_case
  patient_profile?: {
    id?: number;
    user_id?: number;
    psychologist_id?: number;
    psychologist?: User;
    birth_date?: string;
    profession?: string;
    marital_status?: string;
    emergency_phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    consultation_reason?: string;
    created_at?: string;
    updated_at?: string;
  };
  // Alias para compatibilidad (opcional)
  patientProfile?: {
    psychologist_id?: number;
    psychologist?: User;
  };
}

export interface CreateUserDto {
  name: string;
  surname: string;
  email: string;
  dni: string;
  telephone?: string;
  rol?: UserRole;
  status?: UserStatus;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  surname?: string;
  email?: string;
  dni?: string;
  telephone?: string;
  rol?: UserRole;
  status?: UserStatus;
  password?: string;
}
