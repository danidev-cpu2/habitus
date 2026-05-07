import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-psychologist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './psychologist.component.html',
})
export class PsychologistComponent {

  constructor(private router: Router) {}

  

  
}