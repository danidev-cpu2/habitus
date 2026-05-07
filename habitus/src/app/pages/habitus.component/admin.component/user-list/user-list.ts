import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { User, UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {
  readonly users = signal<User[]>([]);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly searchTerm = signal<string>('');
  readonly selectedRole = signal<UserRole | 'all'>('all');

  readonly totalUsers = computed(() => this.users().length);
  readonly totalPatients = computed(() => this.users().filter((u) => u.rol === 'patient').length);
  readonly totalPsychologists = computed(() => this.users().filter((u) => u.rol === 'psychologist').length);
  readonly totalReceptionists = computed(() => this.users().filter((u) => u.rol === 'receptionist').length);

  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const role = this.selectedRole();

    return this.users()
      .filter((u) => (role === 'all' ? true : u.rol === role))
      .filter((u) => {
        if (!term) return true;
        const fullName = `${u.name ?? ''} ${u.surname ?? ''}`.trim().toLowerCase();
        const dni = (u.dni ?? '').toLowerCase();
        return fullName.includes(term) || dni.includes(term);
      });
  });

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.userService.getAll().subscribe({
      next: (data: User[]) => {
        this.users.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los usuarios.');
        this.loading.set(false);
      },
    });
  }

  trackById(index: number, user: User): number {
    return user?.id ?? index;
  }

  initials(user: User): string {
    const n = (user.name || '').trim();
    const s = (user.surname || '').trim();
    const first = n ? n[0] : 'U';
    const second = s ? s[0] : '';
    return `${first}${second}`.toUpperCase();
  }

  roleLabel(role: UserRole): string {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'patient':
        return 'Paciente';
      case 'psychologist':
        return 'Psicólogo';
      case 'receptionist':
        return 'Recepcionista';
      default:
        return role;
    }
  }
}
