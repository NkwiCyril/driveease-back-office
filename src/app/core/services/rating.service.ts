import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '../models/api.model';
import { Rating, RatingSummary } from '../models/rating.model';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly api = inject(ApiService);

  summary(sellerId: string): Observable<ApiResponse<RatingSummary>> {
    return this.api.get<ApiResponse<RatingSummary>>(`/ratings/${sellerId}/summary`);
  }

  list(sellerId: string, params?: { page?: number; limit?: number }): Observable<PaginatedResponse<Rating>> {
    return this.api.get<PaginatedResponse<Rating>>(`/ratings/${sellerId}`, params);
  }
}
