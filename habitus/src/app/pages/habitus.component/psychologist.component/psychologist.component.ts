import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Cita {
  start: string;
  end: string;
  patient: string;
  description: string;
  type: 'Individual' | 'Grupal' | 'Evaluación';
  status: 'completada' | 'en_curso' | 'pendiente';
}

interface Patient {
  initials: string;
  name: string;
  color: string;
  sessions: number;
  condition: string;
  status: 'Activo' | 'En pausa';
  nextSession: string;
}

@Component({
  selector: 'app-psychologist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './psychologist.component.html',
})
export class PsychologistComponent {

  constructor(private router: Router) {}

  // ── Modal visibility ──────────────────────────────────────────
  showCitasModal = false;
  showPacientesModal = false;

  openCitasModal(): void    { this.showCitasModal = true; }
  closeCitasModal(): void   { this.showCitasModal = false; }
  openPacientesModal(): void  { this.showPacientesModal = true; }
  closePacientesModal(): void { this.showPacientesModal = false; }

  // ── Patient search ────────────────────────────────────────────
  patientSearch = '';

  get filteredPatients(): Patient[] {
    const q = this.patientSearch.toLowerCase();
    return this.allPatients.filter(p => p.name.toLowerCase().includes(q));
  }

  // ── Today's appointments ─────────────────────────────────────
  todayCitas: Cita[] = [
    { start: '09:00', end: '09:50', patient: 'María García',   description: 'Sesión de seguimiento',          type: 'Individual', status: 'completada' },
    { start: '10:00', end: '11:00', patient: 'Carlos López',   description: 'Primera evaluación psicológica',  type: 'Evaluación', status: 'en_curso'   },
    { start: '11:30', end: '12:20', patient: 'Ana Martínez',   description: 'Terapia cognitivo-conductual',    type: 'Individual', status: 'pendiente'  },
    { start: '14:00', end: '15:30', patient: 'Grupo Ansiedad', description: 'Sesión grupal - Manejo de ansiedad', type: 'Grupal',  status: 'pendiente'  },
    { start: '16:00', end: '16:50', patient: 'Pedro Sánchez',  description: 'Seguimiento tratamiento',         type: 'Individual', status: 'pendiente'  },
  ];

  // ── Recent patients (sidebar) ─────────────────────────────────
  recentPatients: Pick<Patient, 'initials' | 'name' | 'color' | 'sessions'>[] = [
    { initials: 'MG', name: 'María García',  color: '#3b82f6', sessions: 12 },
    { initials: 'CL', name: 'Carlos López',  color: '#10b981', sessions: 1  },
    { initials: 'LD', name: 'Laura Díaz',    color: '#8b5cf6', sessions: 8  },
    { initials: 'PS', name: 'Pedro Sánchez', color: '#f59e0b', sessions: 5  },
  ];

  // ── All active patients ───────────────────────────────────────
  allPatients: Patient[] = [
    { initials: 'MG', name: 'María García',    color: '#3b82f6', sessions: 12, condition: 'Ansiedad generalizada',   status: 'Activo',    nextSession: 'Hoy 09:00'  },
    { initials: 'CL', name: 'Carlos López',    color: '#10b981', sessions: 1,  condition: 'Evaluación inicial',      status: 'Activo',    nextSession: 'Hoy 10:00'  },
    { initials: 'AM', name: 'Ana Martínez',    color: '#ec4899', sessions: 7,  condition: 'Depresión moderada',       status: 'Activo',    nextSession: 'Hoy 11:30'  },
    { initials: 'GA', name: 'Grupo Ansiedad',  color: '#6366f1', sessions: 5,  condition: 'Terapia grupal',           status: 'Activo',    nextSession: 'Hoy 14:00'  },
    { initials: 'PS', name: 'Pedro Sánchez',   color: '#f59e0b', sessions: 5,  condition: 'TOC',                      status: 'Activo',    nextSession: 'Hoy 16:00'  },
    { initials: 'LD', name: 'Laura Díaz',      color: '#8b5cf6', sessions: 8,  condition: 'Trastorno adaptativo',     status: 'Activo',    nextSession: 'Vie 10:00'  },
    { initials: 'RT', name: 'Roberto Torres',  color: '#14b8a6', sessions: 3,  condition: 'Fobia social',             status: 'Activo',    nextSession: 'Lun 09:30'  },
    { initials: 'SL', name: 'Sara Llorente',   color: '#f43f5e', sessions: 15, condition: 'TEPT',                     status: 'Activo',    nextSession: 'Lun 11:00'  },
    { initials: 'JR', name: 'Javier Ruiz',     color: '#0ea5e9', sessions: 2,  condition: 'Duelo',                    status: 'En pausa',  nextSession: 'Pendiente'  },
    { initials: 'NM', name: 'Nuria Moreno',    color: '#a3e635', sessions: 9,  condition: 'Ansiedad social',          status: 'Activo',    nextSession: 'Mar 16:00'  },
    { initials: 'DG', name: 'Diego García',    color: '#fb923c', sessions: 6,  condition: 'TDAH adulto',              status: 'Activo',    nextSession: 'Mié 09:00'  },
    { initials: 'MV', name: 'Marta Vidal',     color: '#c084fc', sessions: 11, condition: 'Trastorno bipolar',        status: 'Activo',    nextSession: 'Jue 10:30'  },
  ];
}