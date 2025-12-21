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
  eventToDeleteId: number | null = null;
  searchTerm: string = '';
  pageSize: number = 25;

  dummyEvents = [
    { id: 1, eventId: '34834217', matchId: 'M-101', eventName: 'Afghanistan v Bangladesh', teamA: 'Afghanistan', teamB: 'Bangladesh' },
    { id: 2, eventId: '34833829', matchId: 'M-102', eventName: 'New Zealand W v Sri Lanka W', teamA: 'New Zealand W', teamB: 'Sri Lanka W' },
    { id: 3, eventId: '34834217', matchId: 'M-103', eventName: 'India v Australia', teamA: 'India', teamB: 'Australia' },
  ];

  constructor(
    private backend: BackendService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    const payload = {
      draw: 1,
      start: 0,
      length: this.pageSize,
      columns: [],
      order: [],
      search: {
        value: this.searchTerm,
        regex: false
      }
    };

    this.backend.getEvents(payload).subscribe({
      next: (res: any) => {

        this.events = res?.data?.data?.length > 0 ? res.data.data : (res?.length > 0 ? res : this.dummyEvents);
      },
      error: (err) => {
        this.toastr.error(err?.error?.meta?.message || 'Failed to load events');
        this.events = this.dummyEvents; 
      }
    });
  }

  onSearchChange(): void {
    this.loadEvents();
  }

  navigateToAdd() {
    this.router.navigate(['/events/add']);
  }

  navigateToEdit(id: number) {
    this.router.navigate(['/events/edit', id]);
  }

  confirmDelete(id: number): void {
    this.eventToDeleteId = id;
    this.showDeleteModal = true;
  }

  executeDelete(): void {
    if (this.eventToDeleteId !== null) {
      this.backend.deleteEvent(this.eventToDeleteId).subscribe({
        next: (res: any) => {
          this.toastr.success(res?.meta?.message || 'Event deleted successfully');
          this.events = this.events.filter(e => e.id !== this.eventToDeleteId);
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