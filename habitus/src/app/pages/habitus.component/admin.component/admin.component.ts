import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-admin.component',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
    /** Colores Tailwind para avatares; se repiten con el índice de la tarjeta. */
    private static readonly avatarPalette = [
        'bg-blue-500',
        'bg-violet-500',
        'bg-teal-500',
        'bg-rose-500',
    ] as const;

    /** Total de psicólogos activos (null = error al cargar, el template puede mostrar "—"). */
    readonly activePsychologistsCount = signal<number | null>(null);
    /** Lista ya filtrada: solo rol psychologist y status active (datos del backend vía API). */
    readonly activePsychologists = signal<User[]>([]);
    /** true hasta que termine la petición de psicólogos. */
    readonly psychologistsLoading = signal(true);

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        this.psychologistsLoading.set(true);
        // Los usuarios reales vienen del API; aquí se refuerza el filtro de activos en cliente.
        this.userService.getByRole('psychologist').subscribe({
            next: (data: User[]) => {
                const list = (data ?? []).filter(
                    (p) =>
                        p.rol === 'psychologist' &&
                        // toLowerCase: por si el backend envía el estado con distinta capitalización
                        String(p.status ?? '').toLowerCase() === 'active',
                );
                this.activePsychologists.set(list);
                this.activePsychologistsCount.set(list.length);
                this.psychologistsLoading.set(false);
            },
            error: () => {
                // Sin datos útiles: lista vacía y contador null para distinguir de "cero activos".
                this.activePsychologists.set([]);
                this.activePsychologistsCount.set(null);
                this.psychologistsLoading.set(false);
            },
        });
    }

    /** Clase de fondo del avatar según posición en la lista. */
    avatarBgClass(index: number): string {
        return AdminComponent.avatarPalette[index % AdminComponent.avatarPalette.length];
    }

    /** Todas las clases del cuadrado avatar (Tailwind); una sola cadena para el binding [class]. */
    psychologistAvatarBoxClass(index: number): string {
        return `${this.avatarBgClass(index)} w-[30px] h-[30px] rounded-[7px] text-white flex items-center justify-center text-[11px] font-bold shrink-0`;
    }

    /** Iniciales para el avatar: primera letra de nombre y apellido. */
    psychologistInitials(p: User): string {
        const n = (p.name || '').trim();
        const s = (p.surname || '').trim();
        const first = n ? n[0] : '';
        const second = s ? s[0] : '';
        const pair = `${first}${second}`.toUpperCase();
        return pair || 'P';
    }

    /** Texto principal de la tarjeta: nombre completo o respaldo por email. */
    psychologistDisplayName(p: User): string {
        const full = `${p.name ?? ''} ${p.surname ?? ''}`.trim();
        return full || p.email || 'Sin nombre';
    }
}

