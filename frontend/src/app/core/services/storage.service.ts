import { Injectable } from '@angular/core';
import { User } from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'smartsure_token';
  private readonly REFRESH_TOKEN_KEY = 'smartsure_refresh_token';
  private readonly USER_KEY = 'smartsure_user';

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(`smartsure_${key}`, value);
  }

  getItem(key: string): string | null {
    return localStorage.getItem(`smartsure_${key}`);
  }

  removeItem(key: string): void {
    localStorage.removeItem(`smartsure_${key}`);
  }

  clear(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('smartsure_loginRole');
  }
}
