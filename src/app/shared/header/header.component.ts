import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BackendService } from '../../services/backend.service';
@Component({
  selector: 'app-header',
  imports: [FormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(private router: Router, private backend: BackendService) {}

  isDropdownOpen = false;
  logoUrl = '/dummy.png';

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isDropdownOpen = false;
    }
  }

  changePassword(): void {
  
      this.backend.isResetPasswordModalOpen.set(true);
    
    this.closeDropdown();
    console.log('Change password clicked');
  }

  logout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/login');
    this.closeDropdown();
  }
}
