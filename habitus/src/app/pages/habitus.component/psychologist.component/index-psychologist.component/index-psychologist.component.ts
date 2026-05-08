import { Component, OnInit, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-index-psychologist',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './index-psychologist.component.html',
  styleUrl: './index-psychologist.component.css',
})
export class IndexPsychologistComponent implements OnInit {
  readonly activePatientsCount = signal<number | null>(null);

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getByRole('patient').subscribe({
      next: (data: User[]) => {
        this.activePatientsCount.set(
          (data ?? []).filter((p) => p.status === 'active').length
        );
      },
      error: () => {
        this.activePatientsCount.set(null);
      },
    });
  }
}

