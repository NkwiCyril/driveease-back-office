import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse } from '../models/api.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  list(): Observable<ApiResponse<User[]>> {
    return this.api.get<ApiResponse<User[]>>('/users');
  }

  // The backend's register endpoint creates the user and issues an OTP — there
  // is no separate "admin creates user" path. In dev mode the OTP comes back
  // inline; in prod the SMS would be sent to the new user.
  create(body: { name: string; phone: string; password: string; repeatPassword: string }): Observable<{ success: boolean; message?: string; phone?: string; otp?: string; expiresInSeconds?: number }> {
    return this.api.post('/users/register', body);
  }

  search(params: { name?: string; id?: string; page?: number; limit?: number }): Observable<PaginatedResponse<User>> {
    return this.api.get<PaginatedResponse<User>>('/users/search', params);
  }

  get(id: string): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>(`/users/${id}`);
  }

  update(id: string, body: Partial<User> & { password?: string; repeatPassword?: string }): Observable<ApiResponse<User>> {
    return this.api.put<ApiResponse<User>>(`/users/${id}`, body);
  }

  delete(id: string): Observable<{ success: boolean }> {
    return this.api.delete<{ success: boolean }>(`/users/${id}`);
  }

  // The deployed backend exposes a one-off, phone-based admin promoter
  // (`POST /api/users/promote-admin/:phone`) instead of a generic PUT-by-id
  // role endpoint. Promotion is one-way — there is no demote path in the API,
  // so demotions have to be done directly in the database.
  promoteToAdmin(phone: string): Observable<ApiResponse<User>> {
    return this.api.post<ApiResponse<User>>(`/users/promote-admin/${encodeURIComponent(phone)}`);
  }

  // Multipart upload of the authenticated user's own profile picture / ID
  // cards. Backend only updates fields actually present in the FormData.
  updateMyDetails(form: FormData): Observable<ApiResponse<User>> {
    return this.api.putForm<ApiResponse<User>>('/users/me/details', form);
  }

  // OTP is verified on the frontend (per the API doc), so this endpoint
  // accepts the new password directly. The backend clears `activeToken` so
  // any signed-in device is forced to log in again.
  resetPassword(body: { phone: string; password: string; repeatPassword: string }): Observable<{ success: boolean; message?: string }> {
    return this.api.post('/users/reset-password', body);
  }
}
