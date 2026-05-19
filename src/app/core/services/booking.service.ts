import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '../models/api.model';
import { Booking, BookingStats, BookingStatus } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly api = inject(ApiService);

  // Note: the backend currently scopes /api/bookings to the authenticated user
  // (the admin). A platform-wide listing endpoint isn't exposed yet; this
  // method returns the admin's own bookings until that is added.
  list(params?: { status?: BookingStatus; page?: number; limit?: number }): Observable<PaginatedResponse<Booking>> {
    return this.api.get<PaginatedResponse<Booking>>('/bookings', params);
  }

  create(body: { carId: string; startDate: string; endDate: string; notes?: string }): Observable<ApiResponse<Booking>> {
    return this.api.post<ApiResponse<Booking>>('/bookings', body);
  }

  update(id: string, body: { startDate?: string; endDate?: string; notes?: string }): Observable<ApiResponse<Booking>> {
    return this.api.put<ApiResponse<Booking>>(`/bookings/${id}`, body);
  }

  stats(): Observable<ApiResponse<BookingStats>> {
    return this.api.get<ApiResponse<BookingStats>>('/bookings/stats');
  }

  get(id: string): Observable<ApiResponse<Booking>> {
    return this.api.get<ApiResponse<Booking>>(`/bookings/${id}`);
  }

  cancel(id: string, reason?: string): Observable<ApiResponse<Booking>> {
    return this.api.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
  }

  delete(id: string): Observable<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>(`/bookings/${id}`);
  }
}
