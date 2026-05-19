import { Injectable } from '@angular/core';

const KEYS = {
  AUTH_TOKEN: 'pe.authToken',
  CURRENT_USER: 'pe.currentUser',
} as const;

@Injectable({ providedIn: 'root' })
export class StorageService {
  setToken(token: string): void {
    localStorage.setItem(KEYS.AUTH_TOKEN, token);
  }

  getToken(): string | null {
    return localStorage.getItem(KEYS.AUTH_TOKEN);
  }

  setUser(user: unknown): void {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  }

  getUser<T = unknown>(): T | null {
    const raw = localStorage.getItem(KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(KEYS.AUTH_TOKEN);
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
}
