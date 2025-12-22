import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { CONFIG } from '../../config';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  isResetPasswordModalOpen = signal(false);
  constructor(private http: HttpClient) { }

  login(payload: any): Observable<any> {
    return this.http.post(CONFIG.login, payload);
  }
  getEvents(payload: any): Observable<any> {
    return this.http.post(CONFIG.getEvents, payload);
  }
  addEvent(payload: any): Observable<any> {
    return this.http.post(CONFIG.addEvent, payload);
  }
  deleteEvent(id: any): Observable<any> {
    return this.http.delete(`${CONFIG.deleteEvent}/${id}`);
  }

  addPlayerEvent(payload: any): Observable<any> {
    return this.http.post(CONFIG.addTeamEvent, payload);
  }
  resetPassword(payload: any): Observable<any> {
    return this.http.post(CONFIG.resetPassword, payload);
  }

}
