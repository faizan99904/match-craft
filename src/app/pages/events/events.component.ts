import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BackendService } from '../../services/backend.service';
import { FormsModule } from '@angular/forms';
import { HeaderNavComponent } from "../../shared/header-nav/header-nav.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderNavComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit {
  events: any[] = [];
  showDeleteModal: boolean = false;
  eventToDeleteId: any = null;
  searchTerm: string = '';

  // Pagination Variables
  pageSize: number = 25;
  currentPage: number = 1;
  totalRecords: number = 0;
  totalPages: number = 0;
  pagesArray: number[] = [];

  constructor(
    private backend: BackendService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  /**
   * Fetches events using the DataTable payload structure
   */
  loadEvents(): void {
    const payload = {
      draw: 1,
      start: (this.currentPage - 1) * this.pageSize,
      length: Number(this.pageSize),
      columns: [],
      order: [],
      search: {
        value: this.searchTerm,
        regex: false
      }
    };

    this.backend.getEvents(payload).subscribe({
      next: (res: any) => {
        // Mapping based on your backend structure: res.data.data
        this.events = res?.data?.data || [];
        this.totalRecords = res?.data?.recordsTotal || 0;
        this.calculatePagination();
      },
      error: (err) => {
        this.toastr.error(err?.error?.meta?.message || 'Failed to load events');
        this.events = [];
        this.totalRecords = 0;
        this.calculatePagination();
      }
    });
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadEvents();
    }
  }

  onSearchChange(): void {
    this.currentPage = 1; // Reset to first page on new search
    this.loadEvents();
  }

  navigateToAdd() {
    this.router.navigate(['/events/add']);
  }

  navigateToEdit(id: any) {
    this.router.navigate(['/events/edit', id]);
  }

  confirmDelete(id: any): void {
    this.eventToDeleteId = id;
    this.showDeleteModal = true;
  }

  executeDelete(): void {
    if (this.eventToDeleteId !== null) {
      this.backend.deleteEvent(this.eventToDeleteId).subscribe({
        next: (res: any) => {
          this.toastr.success(res?.meta?.message || 'Event deleted successfully');
          this.loadEvents(); // Refresh list and pagination
          this.closeDeleteModal();
        },
        error: (err) => {
          this.toastr.error(err?.error?.meta?.message || 'Could not delete event');
          this.closeDeleteModal();
        }
      });
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.eventToDeleteId = null;
  }
}