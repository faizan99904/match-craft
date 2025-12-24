import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BackendService } from './backend.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {

  private permissionsSubject = new BehaviorSubject<any | null>(null);
  permissions$ = this.permissionsSubject.asObservable();

  constructor(private backend: BackendService) {}

  // call this after login OR when dashboard loads
  loadPermissions(): void {
    const role = localStorage.getItem('role');
    if (!role) return;

    this.backend.getAllPermissions().subscribe({
      next: (res: any) => {
        const matchedRole = res?.data?.find(
          (item: any) => item.role === role
        );

        if (matchedRole) {
          localStorage.setItem(
            'permissions',
            JSON.stringify(matchedRole)
          );
          this.permissionsSubject.next(matchedRole);
        }
      },
      error: () => {
        console.error('Permission fetch failed');
      },
    });
  }

  // refresh 
  loadFromStorage(): void {
    const stored = localStorage.getItem('permissions');
    if (stored) {
      this.permissionsSubject.next(JSON.parse(stored));
    }
  }

  clear(): void {
    localStorage.removeItem('permissions');
    this.permissionsSubject.next(null);
  }
}
