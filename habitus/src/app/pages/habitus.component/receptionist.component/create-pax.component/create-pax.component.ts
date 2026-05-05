import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';

interface Psychologist {
  id: number;
  name: string;
  surname: string;
}

@Component({
  selector: 'app-create-pax',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-pax.component.html',
  styleUrls: ['./create-pax.component.css'],
})
export class CreatePaxComponent implements OnInit {
  patientForm!: FormGroup;
  psychologists: Psychologist[] = [];
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  ngOnInit(): void {
    this.initializeForm();
    this.loadPsychologists();
  }

  private initializeForm(): void {
    this.patientForm = this.fb.group({
      // Datos personales
      name: ['', [Validators.required, Validators.maxLength(100)]],
      surname: ['', [Validators.required, Validators.maxLength(100)]],
      dni: ['', [Validators.required]],
      birthDate: [''],
      profession: [''],
      maritalStatus: [''],

      // Contacto
      telephone: ['', [Validators.required]],
      emergencyPhone: [''],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      city: [''],
      postalCode: [''],

      // Clínica
      psychologistId: ['', [Validators.required]],
      consultationReason: [''],

      // Password
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
    });
  }

  private loadPsychologists(): void {
    this.userService.getPsychologists().subscribe({
      next: (psychologists: Psychologist[]) => {
        this.psychologists = psychologists;
      },
      error: (err: any) => {
        console.error('Error loading psychologists:', err);
        this.errorMessage = 'No se pudieron cargar los psicólogos';
      },
    });
  }

  onSubmit(): void {
    if (!this.patientForm.valid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos correctamente';
      return;
    }

    if (this.patientForm.get('password')?.value !== this.patientForm.get('password_confirmation')?.value) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = this.prepareFormData();

    this.userService.createPatient(formData).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.successMessage = 'Paciente creado correctamente';
        setTimeout(() => {
          this.router.navigate(['/recepcion']);
        }, 1500);
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error creating patient:', err);
        this.errorMessage = err.error?.message || 'Error al crear el paciente';
      },
    });
  }

  private prepareFormData(): any {
    const formValue = this.patientForm.value;
    return {
      name: formValue.name,
      surname: formValue.surname,
      email: formValue.email,
      dni: formValue.dni,
      telephone: formValue.telephone,
      password: formValue.password,
      password_confirmation: formValue.password_confirmation,
      rol: 'patient',
      status: 'active',
      // Datos del perfil
      birth_date: formValue.birthDate,
      profession: formValue.profession,
      marital_status: formValue.maritalStatus,
      emergency_phone: formValue.emergencyPhone,
      address: formValue.address,
      city: formValue.city,
      postal_code: formValue.postalCode,
      consultation_reason: formValue.consultationReason,
      psychologist_id: formValue.psychologistId,
    };
  }
}

