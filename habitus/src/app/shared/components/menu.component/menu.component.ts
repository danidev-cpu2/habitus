import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

import {
  LucideAngularModule,
  Brain, Menu, X, Bell, LogOut, Settings, User as UserIcon,
  Home, Calendar, BookOpen, CheckSquare, LayoutDashboard,
  Users, UserPlus, ArrowLeftRight, MessageSquare
} from 'lucide-angular';

@Component({
  selector: 'app-menu-component',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent implements OnInit {
  sidebarOpen = false;
  user: User | null = null;
  navItems: any[] = [];

  // Diccionario de iconos para usar en el HTML
  readonly icons = {
    Brain: 'brain',
    Menu: 'menu',
    X: 'x',
    Bell: 'bell',
    LogOut: 'log-out',
    Settings: 'settings',
    User: 'user',
    Home: 'home',
    CheckSquare: 'check-square',
    Calendar: 'calendar',
    BookOpen: 'book-open',
    LayoutDashboard: 'layout-dashboard',
    Users: 'users',
    UserPlus: 'user-plus',
    ArrowLeftRight: 'arrow-left-right',
    MessageSquare: 'message-square'
  };

  private readonly navigationConfig: Record<string, any[]> = {
    patient: [
      { href: '/paciente', label: 'Inicio', icon: this.icons.Home },
      { href: '/paciente/calendario', label: 'Calendario', icon: this.icons.Calendar },
      { href: '/paciente/autoregistro', label: 'Autoregistro', icon: this.icons.BookOpen },
      { href: '/paciente/tareas', label: 'Mis Tareas', icon: this.icons.CheckSquare },
    ],
    psychologist: [
      { href: '/psicologo', label: 'Mi Panel', icon: this.icons.LayoutDashboard },
      { href: '/psicologo/pacientes', label: 'Mis Pacientes', icon: this.icons.Users },
      { href: '/psicologo/calendario', label: 'Mi Calendario', icon: this.icons.Calendar },
    ],
    receptionist: [
      { href: '/recepcion', label: 'Calendario', icon: this.icons.Calendar },
      { href: '/recepcion/alta-paciente', label: 'Alta de Paciente', icon: this.icons.UserPlus },
      { href: '/recepcion/transferir', label: 'Transferir Paciente', icon: this.icons.ArrowLeftRight },
      { href: '/recepcion/mensajes', label: 'Mensajes', icon: this.icons.MessageSquare, badge: 3 },
    ],
    admin: [
      { href: '/admin', label: 'Dashboard', icon: this.icons.LayoutDashboard },
      { href: '/admin/usuarios', label: 'Usuarios', icon: this.icons.Users },
      { href: '/admin/calendario', label: 'Calendario', icon: this.icons.Calendar },
    ]
  };

  constructor(private authService: AuthService, private router: Router) {
    effect(() => {
      const userData = this.authService.currentUser();
      this.updateNavigation(userData);
    });
  }

  ngOnInit() {
    this.updateNavigation(this.authService.currentUser());
  }

  private updateNavigation(userData: User | null) {
    this.user = userData;
    if (userData && userData.rol) {
      this.navItems = this.navigationConfig[userData.rol] || [];
    } else {
      this.navItems = [];
    }
  }

  getUserName(): string {
    if (!this.user) return 'Usuario';
    return `${this.user.name} ${this.user.surname}`.trim();
  }

  getUserEmail(): string {
    return this.user?.email || '';
  }

  getUserRole(): string {
    return this.user?.rol || '';
  }

  getInitials(): string {
    if (!this.user || !this.user.name) return '??';
    const namePart = this.user.name[0] || '';
    const surnamePart = this.user.surname ? this.user.surname[0] : '';
    return (namePart + surnamePart).toUpperCase();
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar() { this.sidebarOpen = false; }

  logout() {
    this.authService.logoutLocal();
    this.router.navigate(['/login']);
  }
}
