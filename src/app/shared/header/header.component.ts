import { Component, HostListener, OnInit } from '@angular/core';
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
export class HeaderComponent implements OnInit {
  constructor(private router: Router, private backend: BackendService) {}

  isDropdownOpen = false;
  logoUrl = '/dummy.png';
  username = '';
  role = '';
  greeting = '';

  ngOnInit(): void {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = this.formatUsername(storedUsername);
    }

    this.greeting = this.getGreeting();
  }

  formatUsername(name: string): string {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  getGreeting(): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  }

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

  goToPermissions() {
    this.router.navigateByUrl('/permissions');
    this.closeDropdown();
  }
}