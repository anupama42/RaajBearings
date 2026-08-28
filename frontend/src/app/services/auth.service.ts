import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthResponse, UserProfile } from '../models/auth.models';
import { WishlistService } from './wishlist.service';

const TOKEN_KEY = 'raaj-token';
const USER_KEY = 'raaj-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user = signal<UserProfile | null>(this.readUser());
  readonly currentUser = this.user.asReadonly();
  readonly isLoggedIn = computed(() => !!this.user());

  constructor(
    private http: HttpClient,
    private router: Router,
    private wishlist: WishlistService
  ) {}

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  register(payload: {
    loginId: string;
    password: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    company?: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', payload).pipe(
      tap((response) => this.store(response))
    );
  }

  login(loginId: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', { loginId, password }).pipe(
      tap((response) => this.store(response))
    );
  }

  profile(): Observable<UserProfile> {
    return this.http.get<UserProfile>('/api/auth/me').pipe(
      tap((user) => {
        this.user.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      })
    );
  }

  updateProfile(payload: Partial<UserProfile> & { currentPassword?: string; newPassword?: string }): Observable<UserProfile> {
    return this.http.put<UserProfile>('/api/auth/profile', payload).pipe(
      tap((user) => {
        this.user.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      })
    );
  }

  logout(): void {
    this.wishlist.clearOnLogout();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  private store(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.user.set(response.user);
    this.wishlist.syncAfterLogin();
  }

  private readUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) as UserProfile : null;
    } catch {
      return null;
    }
  }
}
