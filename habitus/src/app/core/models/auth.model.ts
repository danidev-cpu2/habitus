import { User } from './user.model';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LogoutResponse {
  message: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
}

export interface ApiErrorResponse {
  message: string;
}
