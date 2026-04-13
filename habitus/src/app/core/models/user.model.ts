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
