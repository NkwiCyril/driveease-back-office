import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '../models/api.model';
import { Car, CarFacets, SetVerificationRequest } from '../models/car.model';

export interface CarSearchParams {
  q?: string;
  make?: string;
  model?: string;
  status?: string;
  forSale?: boolean;
  forRent?: boolean;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  sort?: 'recent' | 'priceAsc' | 'priceDesc' | 'yearAsc' | 'yearDesc';
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class CarService {
  private readonly api = inject(ApiService);

  search(params: CarSearchParams): Observable<PaginatedResponse<Car> & { facets?: CarFacets }> {
    return this.api.get<PaginatedResponse<Car> & { facets?: CarFacets }>('/cars/search', params as Record<string, unknown>);
  }

  available(params?: CarSearchParams): Observable<PaginatedResponse<Car>> {
    return this.api.get<PaginatedResponse<Car>>('/cars/available', params as Record<string, unknown>);
  }

  userSaleCars(userId: string, params?: CarSearchParams): Observable<PaginatedResponse<Car>> {
    return this.api.get<PaginatedResponse<Car>>(`/cars/user/${userId}/sale`, params as Record<string, unknown>);
  }

  userRentCars(userId: string, params?: CarSearchParams): Observable<PaginatedResponse<Car>> {
    return this.api.get<PaginatedResponse<Car>>(`/cars/user/${userId}/rent`, params as Record<string, unknown>);
  }

  marketplace(params?: CarSearchParams): Observable<PaginatedResponse<Car>> {
    return this.api.get<PaginatedResponse<Car>>('/cars/marketplace', params as Record<string, unknown>);
  }

  home(params?: CarSearchParams): Observable<PaginatedResponse<Car>> {
    return this.api.get<PaginatedResponse<Car>>('/cars/home', params as Record<string, unknown>);
  }

  create(form: FormData): Observable<ApiResponse<Car>> {
    return this.api.postForm<ApiResponse<Car>>('/cars', form);
  }

  update(id: string, form: FormData): Observable<ApiResponse<Car>> {
    return this.api.putForm<ApiResponse<Car>>(`/cars/${id}`, form);
  }

  park(form: FormData): Observable<ApiResponse<Car>> {
    return this.api.postForm<ApiResponse<Car>>('/cars/park', form);
  }

  collect(id: string): Observable<ApiResponse<Car>> {
    return this.api.post<ApiResponse<Car>>(`/cars/collect/${id}`);
  }

  listForSale(id: string, price: number): Observable<ApiResponse<Car>> {
    return this.api.post<ApiResponse<Car>>(`/cars/sell/${id}`, { price });
  }

  listForRent(id: string, rentalPrice: number): Observable<ApiResponse<Car>> {
    return this.api.post<ApiResponse<Car>>(`/cars/rent-list/${id}`, { rentalPrice });
  }

  setVerification(id: string, body: SetVerificationRequest): Observable<ApiResponse<Car>> {
    return this.api.post<ApiResponse<Car>>(`/cars/${id}/verify`, body);
  }

  // Dedicated premium-toggle endpoint — POSTing without a body flips the flag.
  // Pass `{ premiumVerified: true|false }` to set explicitly.
  setPremium(id: string, premiumVerified?: boolean): Observable<ApiResponse<Car>> {
    return this.api.post<ApiResponse<Car>>(`/cars/${id}/premium`, premiumVerified === undefined ? {} : { premiumVerified });
  }

  // One-off bulk operation exposed by the deployed backend: marks every car
  // owned by the user with this phone as premiumVerified=true. Idempotent.
  bulkPromotePhone(phone: string): Observable<ApiResponse<{ updated: number }>> {
    return this.api.post<ApiResponse<{ updated: number }>>(`/cars/promote-phone/${encodeURIComponent(phone)}`);
  }

  delete(id: string): Observable<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>(`/cars/${id}`);
  }
}
