import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth';
import { AppLogo } from 'src/app/components/app-logo';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  imports: [
    AppLogo,
    Menubar,
    CommonModule
  ],
  template: `
    <p-menubar [model]="items" styleClass="w-full">
      <ng-template #start>
        <app-logo [logoMaxWidth]="55" link="/admin/"></app-logo>
      </ng-template>
    </p-menubar>
  `,
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  items: MenuItem[] = [];

  ngOnInit(): void {
    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-line',
        styleClass: this.isActive('/admin/') ? 'active-menu-item' : '',
        command: () => {
          this.router.navigate(['/admin/']);
        }
      },
      {
        label: 'Usuarios',
        icon: 'pi pi-users',
        styleClass: this.isActive('/admin/usuarios') ? 'active-menu-item' : '',
        command: () => {
          this.router.navigate(['/admin/usuarios']);
        }
      },
      {
        label: 'Cerrar sesión',
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        }
      }
    ];
    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateMenuItems();
      });
  }

  private isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  private updateMenuItems(): void {
    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-line',
        styleClass: this.isActive('/admin/') ? 'active-menu-item' : '',
        command: () => {
          this.router.navigate(['/admin/']);
        }
      },
      {
        label: 'Usuarios',
        icon: 'pi pi-users',
        styleClass: this.isActive('/admin/usuarios') ? 'active-menu-item' : '',
        command: () => {
          this.router.navigate(['/admin/usuarios']);
        }
      },
      {
        label: 'Cerrar sesión',
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        }
      }
    ];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

}
