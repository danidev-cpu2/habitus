import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-admin.component',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
    readonly activePsychologistsCount = signal<number | null>(null);

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        this.userService.getByRole('psychologist').subscribe({
            next: (data: User[]) => {
                this.activePsychologistsCount.set(
                    (data ?? []).filter((p) => p.status === 'active').length
                );
            },
            error: () => {
                this.activePsychologistsCount.set(null);
            },
        });
    }
}

