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
      const fullName = `${user.name} ${user.surname}`.toLowerCase();
      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        user.dni?.toLowerCase().includes(query);

      const matchesStatus = status === 'all' || user.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  activeCount = computed(
    () => this.allPatients().filter((u) => u.status === 'active').length
  );

  // Datos del psicólogo logueado
  psychologist = computed(() => this.authService.currentUser());

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  private loadPatients(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // getAll() ya filtra por psicólogo en el backend según el token Bearer
    // Filtramos en frontend para asegurarnos de mostrar solo pacientes
    this.userService.getAll().subscribe({
      next: (users) => {
        const patients = users.filter((u) => u.rol === 'patient');
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

  getInitials(name: string, surname: string): string {
    return `${name?.charAt(0) ?? ''}${surname?.charAt(0) ?? ''}`.toUpperCase();
  }

  getStatusLabel(status?: string): string {
    return status === 'active' ? 'Activo' : 'Inactivo';
  }

  getStatusClass(status?: string): string {
    return status === 'active'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-500';
  }

  getAvatarColor(name: string): string {
    const colors = [
      'bg-blue-200 text-blue-700',
      'bg-purple-200 text-purple-700',
      'bg-rose-200 text-rose-700',
      'bg-amber-200 text-amber-700',
      'bg-teal-200 text-teal-700',
      'bg-indigo-200 text-indigo-700',
    ];
    const index = (name?.charCodeAt(0) ?? 0) % colors.length;
    return colors[index];
  }

  retry(): void {
    this.loadPatients();
  }
}