import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '../models/api.model';
import { Advert, AdvertStatus } from '../models/advert.model';

@Injectable({ providedIn: 'root' })
export class AdvertService {
  private readonly api = inject(ApiService);

  list(params?: { status?: AdvertStatus; page?: number; limit?: number }): Observable<PaginatedResponse<Advert>> {
    return this.api.get<PaginatedResponse<Advert>>('/adverts', params);
  }

  create(form: FormData): Observable<ApiResponse<Advert>> {
    return this.api.postForm<ApiResponse<Advert>>('/adverts', form);
  }

  update(id: string, form: FormData): Observable<ApiResponse<Advert>> {
    return this.api.putForm<ApiResponse<Advert>>(`/adverts/${id}`, form);
  }

  featured(limit = 5): Observable<ApiResponse<Advert[]>> {
    return this.api.get<ApiResponse<Advert[]>>('/adverts/featured', { limit });
  }

  userAdverts(userId: string, params?: { page?: number; limit?: number }): Observable<PaginatedResponse<Advert>> {
    return this.api.get<PaginatedResponse<Advert>>(`/adverts/user/${userId}`, params);
  }

  get(id: string): Observable<ApiResponse<Advert>> {
    return this.api.get<ApiResponse<Advert>>(`/adverts/${id}`);
  }

  setPriority(id: string, body: { priority?: number; priorityUntil?: string; durationDays?: number }): Observable<ApiResponse<Advert>> {
    return this.api.post<ApiResponse<Advert>>(`/adverts/${id}/priority`, body);
  }

  delete(id: string): Observable<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>(`/adverts/${id}`);
  }

  deleteAll(): Observable<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>('/adverts/all');
  }
}
