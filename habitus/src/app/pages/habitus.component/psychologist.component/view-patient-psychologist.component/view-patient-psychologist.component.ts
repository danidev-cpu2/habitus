import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-view-patient-psychologist',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './view-patient-psychologist.component.html',
  styleUrls: ['./view-patient-psychologist.component.css'],
})
export class ViewPatientPsychologistComponent implements OnInit {
  isLoading = signal(true);
  error = signal<string | null>(null);

  private patientData = signal<User | null>(null);

  selectedTab = signal<'historial' | 'notas' | 'controlConductual' | 'resumenIA'>('historial');

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.error.set('Paciente no especificado');
      this.isLoading.set(false);
      return;
    }

    const id = Number(idParam);
    this.loadPatient(id);
  }

  private loadPatient(id: number) {
    this.isLoading.set(true);
    this.error.set(null);

    this.userService.getById(id).subscribe({
      next: (user) => {
        this.patientData.set(user);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudo cargar la información del paciente');
        this.isLoading.set(false);
      },
    });
  }

  patient = computed(() => this.patientData());

  fullName = computed(() => {
    const p = this.patient();
    return p ? `${p.name} ${p.surname}` : '';
  });

  isActive = computed(() => this.patient()?.status === 'active');

  diagnosis = computed(() => this.patient()?.patient_profile?.consultation_reason || '');

  age = computed(() => {
    const birth = this.patient()?.patient_profile?.birth_date;
    if (!birth) return 'No especificada';
    const diff = Date.now() - new Date(birth).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + ' años';
  });

  editarFicha() {
    const id = this.patient()?.id;
    if (id) {
      this.router.navigate(['/editar-ficha', id]);
    }
  }

  selectTab(tab: 'historial' | 'notas' | 'controlConductual' | 'resumenIA') {
    this.selectedTab.set(tab);
  }
}
