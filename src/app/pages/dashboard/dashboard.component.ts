import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HeaderNavComponent } from '../../shared/header-nav/header-nav.component';
import { CommonModule } from '@angular/common';

interface DashboardModule {
  title: string;
  url: string;
  allowed: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, RouterLink, HeaderNavComponent],
})
export class DashboardComponent implements OnInit {
  modules: DashboardModule[] = [];
  isLoading: boolean = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserPermissions();
  }

  private loadUserPermissions(): void {
    this.isLoading = true;

    const permissionsStr = localStorage.getItem('permissions');

    if (permissionsStr) {
      try {
        const permissions = JSON.parse(permissionsStr);
        this.modules = this.mapPermissionsToModules(permissions.modules || []);
      } catch (error) {
        this.modules = [];
      }
    }

    this.isLoading = false;
  }

  private mapPermissionsToModules(permissionModules: any[]): DashboardModule[] {
    const moduleUrls: { [key: string]: string } = {
      Cricket: '/events',
    };

    return permissionModules
      .filter((module) => module.allowed)
      .map((module) => ({
        title: module.name,
        url: moduleUrls[module.name] || `/${module.name.toLowerCase()}`,
        allowed: true,
      }));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('permissions');
    this.router.navigateByUrl('/login');
  }
}
