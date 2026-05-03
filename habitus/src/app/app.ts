import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
<<<<<<< HEAD
import { Login } from './login/login';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Login],
=======

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,],
>>>>>>> 40a5434fb1b393f48c12c14d775387909f8fb393
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('habitus');
}
