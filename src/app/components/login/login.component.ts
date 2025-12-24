import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BackendService } from '../../services/backend.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private backend: BackendService,
    private router: Router,
    private toastr: ToastrService,
    private permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    if (localStorage.getItem('token')) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const payload = {
      userName: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };

    this.loading = true;

    this.backend.login(payload).subscribe({
      next: (res: any) => {
        if (res?.data?.token) {
          const details = res.data.details;
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('username', details.username);
          localStorage.setItem('role', details.role);
          this.permissionService.loadPermissions();

          // localStorage.setItem(
          //   'permissions',
          //   JSON.stringify(details.permissions)
          // );

          this.router.navigate(['/dashboard']);
          this.loginForm.reset();
        }
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error(err?.error?.meta?.message || 'Login failed');
        this.loading = false;
      },
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
