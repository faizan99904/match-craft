import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BackendService } from '../../../services/backend.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  loading = signal(false);

  // Independent signals for each password field
  showOld = signal(false);
  showNew = signal(false);
  showConfirm = signal(false);

  constructor(
    private fb: FormBuilder,
    public backend: BackendService,
    private toastr: ToastrService
  ) {
    this.resetForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPass = control.get('newPassword');
    const confirmPass = control.get('confirmPassword');
    return newPass && confirmPass && newPass.value !== confirmPass.value
      ? { passwordMismatch: true }
      : null;
  }

  toggleOld() { this.showOld.update(v => !v); }
  toggleNew() { this.showNew.update(v => !v); }
  toggleConfirm() { this.showConfirm.update(v => !v); }

  closeModal() {
    this.resetForm.reset();
    this.showOld.set(false);
    this.showNew.set(false);
    this.showConfirm.set(false);
    this.backend.isResetPasswordModalOpen.set(false);
  }

  onSubmit() {
    if (this.resetForm.invalid) return;
    this.loading.set(true);

    const payload = {
      oldPassword: this.resetForm.value.oldPassword,
      newPassword: this.resetForm.value.newPassword
    };

    this.backend.resetPassword(payload).subscribe({
      next: (res: any) => {
        this.toastr.success(res?.meta?.message || 'Password updated successfully');
        this.closeModal();
        this.loading.set(false);
      },
      error: (err) => {
        this.toastr.error(err?.error?.meta?.message || 'Failed to update password');
        this.loading.set(false);
      }
    });
  }
}