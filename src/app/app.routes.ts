import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './services/auth.guard';
import { EventsComponent } from './pages/events/events.component';
import { TeamComponent } from './pages/team/team.component';
import { PermissionsComponent } from './pages/permissions/permissions.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'events',
        component: EventsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'team',
        component: TeamComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'permissions',
        component: PermissionsComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
