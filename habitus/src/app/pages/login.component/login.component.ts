import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login.component',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';
  mensaje: string = '';
  cargando: boolean = false;
  mostrarPassword: boolean = false;

  constructor(private authService: AuthService) {}

  onLogin(): void {
    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response: AuthResponse) => {
        this.mensaje = response.message; // '¡Bienvenido!'
        this.cargando = false;
        console.log('✅ Login correcto:', response.data.user);
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || `Error ${err.status}`;
        this.cargando = false;
        console.error('❌ Error login:', err);
      },
    });
  }
}
