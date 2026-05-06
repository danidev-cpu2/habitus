import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { LucideAngularModule } from "lucide-angular";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-transfer-pax',
  standalone: true,
  imports: [LucideAngularModule, CommonModule, FormsModule],
  templateUrl: './transfer-pax.component.html',
  styleUrls: ['./transfer-pax.component.css'],
})
export class TransferPaxComponent implements OnInit, AfterViewInit {
  patients: User[] = [];
  psychologists: User[] = [];
  psychologistViews: any[] = [];
  filteredPatients: User[] = [];
  searchTerm: string = '';
  selectedPatient: User | null = null;
  newPsychologist: User | null = null;
  transferReason: string = '';

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log('TransferPaxComponent - ngOnInit ejecutado');
    this.loadData();
  }

  ngAfterViewInit() {
    console.log('TransferPaxComponent - ngAfterViewInit ejecutado');
    // Asegurar que los datos se carguen después de la vista
    setTimeout(() => {
      if (this.patients.length === 0 || this.psychologists.length === 0) {
        console.log('Recargando datos porque no se cargaron inicialmente');
        this.loadData();
      }
    }, 100);
  }

  loadData() {
    this.loadPatients();
    this.loadPsychologists();
  }

  loadPatients() {
    console.log('Iniciando carga de pacientes...');
    this.userService.getByRole('patient').subscribe({
      next: (data: any[]) => {
        console.log('Pacientes recibidos del servidor (RAW):', data);

        // Verificar si vienen los datos del psicólogo
        if (data.length > 0) {
          console.log('Ejemplo de paciente[0] COMPLETO:', JSON.stringify(data[0], null, 2));
          console.log('Tiene patient_profile (snake_case)?', data[0].patient_profile);
          console.log('Tiene patientProfile (camelCase)?', data[0].patientProfile);
          console.log('Keys del objeto:', Object.keys(data[0]));
        }

        this.patients = data.filter(p => p.status === 'active');
        this.filteredPatients = [...this.patients];
        console.log(`Pacientes activos: ${this.patients.length}`);

        // Recalcular vistas de psicólogos cuando cambien los pacientes
        if (this.psychologists.length > 0) {
          this.calculatePsychologistViews();
        }

        // Forzar detección de cambios
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando pacientes:', err);
      }
    });
  }

  loadPsychologists() {
    console.log('Iniciando carga de psicólogos...');
    this.userService.getByRole('psychologist').subscribe({
      next: (data: User[]) => {
        console.log('Psicólogos recibidos del servidor:', data);
        this.psychologists = data.filter(p => p.status === 'active');
        console.log(`Psicólogos activos: ${this.psychologists.length}`);
        this.calculatePsychologistViews();

        // Forzar detección de cambios
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando psicólogos:', err);
      }
    });
  }

  calculatePsychologistViews() {
    // Calcular el número real de pacientes por psicólogo
    this.psychologistViews = this.psychologists.map(psychologist => {
      const patientCount = this.patients.filter(
        p => p.patient_profile?.psychologist_id === psychologist.id
      ).length;

      return {
        user: psychologist,
        patientCount: patientCount,
        maxPatients: 40 // Máximo establecido en 40 para todos
      };
    });
  }

  onSearch() {
    this.filteredPatients = this.patients.filter(p =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.surname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.dni.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectPatient(patient: User) {
    this.selectedPatient = patient;
    this.newPsychologist = null;
    this.transferReason = '';
  }

  trackByDni(index: number, patient: User): string {
    return patient.dni;
  }

  trackById(index: number, item: any): number {
    return item?.id ?? index;
  }

  trackByUserId(index: number, item: any): number {
    return item?.user?.id ?? index;
  }

  transferPatient() {
    if (!this.selectedPatient || !this.newPsychologist || !this.transferReason) return;

    console.log('Transferiendo paciente:', this.selectedPatient.id);
    console.log('Nuevo psicólogo:', this.newPsychologist.id);
    console.log('Motivo:', this.transferReason);

    const body = {
      psychologist_id: this.newPsychologist.id,
      status: this.selectedPatient.status || 'active'
    };

    console.log('Body enviado:', body);

    this.http.put(`${environment.apiUrl}/users/${this.selectedPatient.id}`, body).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);
        console.log('Paciente actualizado:', response.data);
        alert('Paciente transferido correctamente');
        this.selectedPatient = null;
        this.newPsychologist = null;
        this.transferReason = '';
        // Recargar todos los datos
        this.loadData();
      },
      error: (err) => {
        console.error('Error completo al transferir paciente:', err);
        console.error('Detalles del error:', err.error);
        const errorMessage = err.error?.message || 'Error al transferir el paciente. Por favor, intenta de nuevo.';
        alert(errorMessage);
      }
    });
  }
}
