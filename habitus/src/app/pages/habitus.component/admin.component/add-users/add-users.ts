import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { User, UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-add-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-users.html',
  styleUrl: './add-users.css',
})
export class AddUsers implements OnInit {
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly psychologists = signal<User[]>([]);
  readonly psychologistsLoading = signal(false);

  readonly editingUserId = signal<number | null>(null);
  readonly isEdit = computed(() => this.editingUserId() !== null);
  readonly title = computed(() => (this.isEdit() ? 'Editar Usuario' : 'Nuevo Usuario'));
  readonly submitLabel = computed(() => (this.isEdit() ? 'Guardar cambios' : 'Crear usuario'));

  readonly form;
  readonly isPatient;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.maxLength(100)]],
        surname: ['', [Validators.required, Validators.maxLength(100)]],
        dni: [
          '',
          [
            Validators.required,
            // DNI/NIE básico (suficiente para UI; el backend valida unicidad)
            Validators.pattern(/^[0-9XYZxyz][0-9]{7}[A-Za-z]$/),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        telephone: [
          '',
          [
            Validators.required,
            // Formato internacional simple (E.164 aproximado)
            Validators.pattern(/^\+?[1-9]\d{7,14}$/),
          ],
        ],
        rol: ['patient' as UserRole, [Validators.required]],
        status: [true], // true=active, false=inactive (default: activo)
        psychologist_id: [null as number | null],
        password: ['', [Validators.required, Validators.minLength(8)]],
        password_confirmation: ['', [Validators.required, Validators.minLength(8)]],
      },
      { validators: [this.passwordsMatchValidator] }
    );

    const rolSignal = signal(this.form.controls.rol.value);
    this.form.controls.rol.valueChanges.subscribe(val => rolSignal.set(val));
    this.isPatient = computed(() => rolSignal() === 'patient');
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam !== null) {
      const id = Number(idParam);
      if (!Number.isNaN(id)) {
        this.editingUserId.set(id);
        this.setEditPasswordValidators();
        this.loadUser(id);
      } else {
        // Si el ID no es un número válido, tratar como creación
        this.setCreatePasswordValidators();
        this.loadPsychologistsIfNeeded();
      }
    } else {
      this.setCreatePasswordValidators();
      this.loadPsychologistsIfNeeded();
    }

    this.form.controls.rol.valueChanges.subscribe(() => {
      this.loadPsychologistsIfNeeded();
      if (this.form.controls.rol.value !== 'patient') {
        this.form.controls.psychologist_id.setValue(null);
      }
    });
  }

  private setCreatePasswordValidators(): void {
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.controls.password_confirmation.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.controls.password.updateValueAndValidity();
    this.form.controls.password_confirmation.updateValueAndValidity();
  }

  private setEditPasswordValidators(): void {
    this.form.controls.password.setValidators([Validators.minLength(8)]);
    this.form.controls.password_confirmation.setValidators([Validators.minLength(8)]);
    this.form.controls.password.updateValueAndValidity();
    this.form.controls.password_confirmation.updateValueAndValidity();
  }

  private loadUser(id: number): void {
    this.errorMessage.set(null);
    this.loading.set(true);

    this.userService.getById(id).subscribe({
      next: (user: User) => {
        this.form.patchValue({
          name: user.name ?? '',
          surname: user.surname ?? '',
          dni: user.dni ?? '',
          email: user.email ?? '',
          telephone: user.telephone ?? '',
          rol: user.rol ?? 'patient',
          status: user.status !== 'inactive',
          psychologist_id: user.patientProfile?.psychologist_id ?? user.patient_profile?.psychologist_id ?? null,
          password: '',
          password_confirmation: '',
        });

        this.loading.set(false);
        this.loadPsychologistsIfNeeded();
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el usuario.');
        this.loading.set(false);
      },
    });
  }

  private loadPsychologistsIfNeeded(): void {
    if (this.form.controls.rol.value !== 'patient') return;

    // Cargar lista de psicólogos para asignación (solo cuando rol=patient)
    this.psychologistsLoading.set(true);
    this.userService.getByRole('psychologist').subscribe({
      next: (data: User[]) => {
        const users = Array.isArray(data) ? data : [];
        this.psychologists.set(users.filter((u) => u.rol === 'psychologist' && u.status === 'active'));
        this.psychologistsLoading.set(false);
      },
      error: () => {
        this.psychologists.set([]);
        this.psychologistsLoading.set(false);
      },
    });
  }

  submit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.controls.rol.value === 'patient' && !this.form.controls.psychologist_id.value) {
      this.form.controls.psychologist_id.setErrors({ required: true });
      return;
    }

    if (this.form.controls.password.value && !this.form.controls.password_confirmation.value) {
      this.form.controls.password_confirmation.setErrors({ required: true });
      return;
    }

    this.loading.set(true);

    const v = this.form.getRawValue();
    const payload: any = {
      name: v.name,
      surname: v.surname,
      dni: v.dni,
      email: v.email,
      telephone: v.telephone,
      rol: v.rol,
      status: v.status ? 'active' : 'inactive',
    };

    if (v.rol === 'patient') {
      payload.psychologist_id = v.psychologist_id;
    }

    if (v.password) {
      payload.password = v.password;
      payload.password_confirmation = v.password_confirmation;
    }

    const request = this.isEdit() && this.editingUserId() !== null
      ? this.userService.update(this.editingUserId() as number, payload)
      : this.userService.create(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set(this.isEdit() ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
        setTimeout(() => this.router.navigate(['/admin/usuarios']), 800);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Error al crear el usuario');
      },
    });
  }

  private passwordsMatchValidator(group: any) {
    const pass = group?.get('password')?.value;
    const conf = group?.get('password_confirmation')?.value;
    return pass && conf && pass !== conf ? { passwordMismatch: true } : null;
  }

  hasError(controlName: keyof AddUsers['form']['controls'], errorKey: string): boolean {
    const c = (this.form.controls as any)[controlName];
    return !!(c && c.touched && c.errors && c.errors[errorKey]);
  }

  trackByUserId(index: number, user: User): number {
    return user?.id ?? index;
  }
}
