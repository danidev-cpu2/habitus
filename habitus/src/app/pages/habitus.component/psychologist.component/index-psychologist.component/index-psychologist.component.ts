import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import type { Appointment } from '../../../../core/models/appointment.model';
import type { User } from '../../../../core/models/user.model';

type TaskItem = { title: string; dueLabel: string; tone: 'info' | 'warning' | 'success' };

@Component({
  selector: 'app-index-psychologist',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [DatePipe],
  templateUrl: './index-psychologist.component.html',
  styleUrl: './index-psychologist.component.css',
})
export class IndexPsychologistComponent {
  private readonly users = inject(UserService);
  private readonly appts = inject(AppointmentService);
  private readonly auth = inject(AuthService);
  private readonly datePipe = inject(DatePipe);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly patients = signal<User[]>([]);
  readonly appointments = signal<Appointment[]>([]);

  readonly now = signal(new Date());

  readonly currentUser = this.auth.currentUser;
  readonly greeting = computed(() => {
    const h = this.now().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  });

  readonly todayIso = computed(() => {
    const d = this.now();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  readonly appointmentsToday = computed(() =>
    this.appointments()
      .filter((a) => a.date === this.todayIso())
      .sort((a, b) => (a.hour ?? '').localeCompare(b.hour ?? ''))
  );

  readonly activePatientsCount = computed(() => {
    const pts = this.patients();
    const active = pts.filter((p) => (p.status ?? 'active') === 'active');
    return active.length || pts.length;
  });

  readonly pendingReportsCount = signal<number>(3); // placeholder hasta enlazar daily-logs

  readonly hoursThisWeek = computed(() => {
    // Aproximación simple: 1h por cita NO cancelada dentro de la semana actual
    const now = this.now();
    const day = now.getDay(); // 0 (dom) - 6 (sab)
    const mondayDiff = (day + 6) % 7; // lunes = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayDiff);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const inWeek = this.appointments().filter((a) => {
      if (!a.date) return false;
      const d = new Date(`${a.date}T00:00:00`);
      return d >= monday && d <= sunday && a.status !== 'canceled';
    });

    return inWeek.length;
  });

  readonly recentPatients = computed(() => {
    const pts = [...this.patients()];
    pts.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
    return pts.slice(0, 4);
  });

  readonly tasks = signal<TaskItem[]>([
    { title: 'Completar informe de María García', dueLabel: 'Vence: Hoy', tone: 'info' },
    { title: 'Revisar test de Carlos López', dueLabel: 'Vence: Mañana', tone: 'warning' },
    { title: 'Preparar sesión grupal', dueLabel: 'Vence: Hoy 14:00', tone: 'success' },
  ]);

  readonly aiSummary = signal(
    'Basado en el análisis de tus pacientes de hoy: revisa la evolución en los registros y considera ajustar la intervención en función del estado reportado esta semana.'
  );

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      patients: this.users.getAll(),
      appointments: this.appts.getAll(),
    }).subscribe({
      next: ({ patients, appointments }) => {
        this.patients.set(patients ?? []);
        this.appointments.set(appointments ?? []);
        this.loading.set(false);
      },
      error: (e) => {
        const message = typeof e?.message === 'string' ? e.message : 'No se pudieron cargar los datos.';
        this.error.set(message);
        this.loading.set(false);
      },
    });
  }

  formatTodayLong(): string {
    return (
      this.datePipe.transform(this.now(), "EEEE, d 'de' MMMM", undefined, 'es-ES') ??
      this.datePipe.transform(this.now(), 'fullDate') ??
      ''
    );
  }

  formatHour(hhmmss: string): string {
    if (!hhmmss) return '';
    return hhmmss.slice(0, 5);
  }

  initials(user: Pick<User, 'name' | 'surname'>): string {
    const n = (user.name ?? '').trim();
    const s = (user.surname ?? '').trim();
    return `${n.charAt(0) ?? ''}${s.charAt(0) ?? ''}`.toUpperCase();
  }

  fullName(user?: Pick<User, 'name' | 'surname'> | null): string {
    if (!user) return '';
    return `${user.name ?? ''} ${user.surname ?? ''}`.trim();
  }

  badgeForStatus(a: Appointment): { label: string; classes: string } {
    if (a.status === 'held') return { label: 'Completada', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
    if (a.status === 'canceled')
      return { label: 'Cancelada', classes: 'bg-rose-50 text-rose-700 border-rose-100' };
    return { label: 'Pendiente', classes: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
}

