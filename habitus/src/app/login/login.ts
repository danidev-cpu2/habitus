import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
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

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.mensaje = response.message; // '¡Bienvenido!'
        this.authService.guardarToken(response.data.token);
        this.cargando = false;
        console.log('✅ Login correcto:', response.data.user);
      },
      error: (err) => {
        this.error = err.error?.message || `Error ${err.status}`;
        this.cargando = false;
        console.error('❌ Error login:', err);
      },
    });
  }
}
