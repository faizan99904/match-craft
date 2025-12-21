import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for @if and @for
import { Router, RouterModule } from '@angular/router';
import { BackendService } from '../../services/backend.service';
import { FormsModule } from '@angular/forms';
import { HeaderNavComponent } from "../../shared/header-nav/header-nav.component";

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
  // Testing dummy data
  dummyEvents = [
    { id: 1, eventId: '34834217', eventName: 'Afghanistan v Bangladesh', teamA: 'Afghanistan', teamB: 'Bangladesh', isActive: true },
    { id: 2, eventId: '34833829', eventName: 'New Zealand W v Sri Lanka W', teamA: 'New Zealand W', teamB: 'Sri Lanka W', isActive: true },
    { id: 3, eventId: '34834217', eventName: 'India v Australia', teamA: 'India', teamB: 'Australia', isActive: false },
  ];

  constructor(
    private backend: BackendService,
    private router: Router
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
      next: (data) => {
       
        this.events = data && data.length > 0 ? data : this.dummyEvents;
      },
      error: (err) => {
        console.error('API Error, loading dummy data:', err);
        this.events = this.dummyEvents;
      }
    });
  }

  navigateToAdd() {
    this.router.navigate(['/events/add']);
  }
  onSearchChange(): void {
    this.loadEvents();
  }
  navigateToEdit(id: number) {
    this.router.navigate(['/events/edit', id]);
  }

  deleteEvent(id: number): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.backend.deleteEvent(id).subscribe(() => {
        this.events = this.events.filter(e => e.id !== id);
      });
    }
  }

  confirmDelete(id: number): void {
    this.eventToDeleteId = id;
    this.showDeleteModal = true;
  } 
  executeDelete(): void {
    if (this.eventToDeleteId !== null) {
      this.backend.deleteEvent(this.eventToDeleteId).subscribe({
        next: () => {
          this.events = this.events.filter(e => e.id !== this.eventToDeleteId);
          this.closeDeleteModal();
        },
        error: () => {
          alert("Error deleting event");
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