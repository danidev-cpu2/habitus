import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-list-psychologist',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './user-list-psychologist.component.html',
  styleUrl: './user-list-psychologist.component.css',
})
export class UserListPsychologistComponent implements OnInit {
  isLoading = signal(true);
  error = signal<string | null>(null);

  private allPatients = signal<User[]>([]);

  searchQuery = signal('');
  selectedStatus = signal<'all' | 'active' | 'inactive'>('all');

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();

    return this.allPatients().filter((user) => {
      const fullName = `${user.name ?? ''} ${user.surname ?? ''}`.toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        user.dni?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query);

      const matchesStatus = status === 'all' || user.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  activeCount = computed(() => {
    return this.allPatients().filter((u) => u.status === 'active').length;
  });

  psychologist = computed(() => this.authService.currentUser());

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  private loadPatients(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const psychologistId = this.authService.currentUser()?.id;

    if (!psychologistId) {
      this.error.set('No se pudo identificar al psicólogo actual.');
      this.isLoading.set(false);
      return;
    }

    this.userService.getAll().subscribe({
      next: (users) => {
        const patients = users.filter((u) => {
          const userAny = u as any;

          const isPatient = u.rol === 'patient';

          const belongsToMe =
            userAny.patient_profile?.psychologist_id === psychologistId ||
            userAny.patientProfile?.psychologist_id === psychologistId;

          return isPatient && belongsToMe;
        });

        this.allPatients.set(patients);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar pacientes:', err);
        this.error.set('No se pudieron cargar los pacientes. Inténtalo de nuevo.');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onStatusChange(status: 'all' | 'active' | 'inactive'): void {
    this.selectedStatus.set(status);
  }

  navigateToPatient(user: User): void {
    this.router.navigate(['/psicologo/pacientes', user.id]);
  }

  getInitials(name?: string, surname?: string): string {
    return `${name?.charAt(0) ?? ''}${surname?.charAt(0) ?? ''}`.toUpperCase();
  }

  getStatusLabel(status?: string): string {
    return status === 'active' ? 'Activo' : 'Inactivo';
  }

  getStatusClass(status?: string): string {
    return status === 'active'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-slate-100 text-slate-600';
  }

  getAvatarColor(name?: string): string {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-rose-100 text-rose-700',
      'bg-amber-100 text-amber-700',
      'bg-teal-100 text-teal-700',
      'bg-indigo-100 text-indigo-700',
    ];

    const index = (name?.charCodeAt(0) ?? 0) % colors.length;

    return colors[index];
  }

  retry(): void {
    this.loadPatients();
  }

  /**
   * En la lista hay muchos pacientes.
   * Por eso se calcula la edad pasando el user actual.
   */
  getPatientBirthDate(user: User): string | undefined {
    const patient = user as any;

    return (
      patient?.patient_profile?.birth_date ||
      patient?.patientProfile?.birth_date ||
      patient?.patient_profile?.birthDate ||
      patient?.patientProfile?.birthDate ||
      patient?.patient_profile?.date_of_birth ||
      patient?.patientProfile?.date_of_birth
    );
  }

  getPatientAge(user: User): string {
    const birthDate = this.getPatientBirthDate(user);

    if (!birthDate) {
      return 'No especificada';
    }

    const age = this.getAge(birthDate);

    return age > 0 ? `${age} años` : 'No especificada';
  }

  getAge(birthDate?: string): number {
    if (!birthDate) return 0;

    const today = new Date();
    const birth = new Date(birthDate);

    if (Number.isNaN(birth.getTime())) return 0;

    let age = today.getFullYear() - birth.getFullYear();

    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }
}