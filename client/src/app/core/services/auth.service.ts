import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
  expiresAt: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
}

interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
}

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  productImageUrl?: string;
}

interface OrderSummary {
  id: number;
  orderDate: string;
  orderStatus: string;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  items: OrderItem[];
}

interface OrderDetail {
  id: number;
  orderDate: string;
  orderStatus: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discount: number;
  couponCode?: string;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  phoneNumber: string;
  shippingMethod: string;
  estimatedDeliveryDays: number;
  paymentStatus: string;
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
  items: OrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:5001/api/auth';
  token = signal<string | null>(this.getTokenFromStorage());
  userId = signal<number | null>(this.getUserIdFromStorage());
  isAuthenticated = signal(!!this.token());

  constructor(private http: HttpClient, private router: Router) {
    this.checkTokenValidity();
  }

  private getTokenFromStorage(): string | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) return token;
      }
      if (typeof sessionStorage !== 'undefined') {
        const token = sessionStorage.getItem('auth_token');
        if (token) return token;
      }
    } catch (e) {
      console.error('Error reading token from storage', e);
    }
    return null;
  }

  private getUserIdFromStorage(): number | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const userId = localStorage.getItem('user_id');
        if (userId) return parseInt(userId, 10);
      }
      if (typeof sessionStorage !== 'undefined') {
        const userId = sessionStorage.getItem('user_id');
        if (userId) return parseInt(userId, 10);
      }
    } catch (e) {
      console.error('Error reading user_id from storage', e);
    }
    return null;
  }

  private checkTokenValidity() {
    const token = this.token();
    if (token && this.isTokenExpired(token)) {
      this.logout();
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password } as LoginRequest)
      .pipe(
        tap(response => {
          this.token.set(response.token);
          this.userId.set(response.userId);
          this.isAuthenticated.set(true);
          try {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user_id', response.userId.toString());
            sessionStorage.setItem('auth_token', response.token);
            sessionStorage.setItem('user_id', response.userId.toString());
          } catch (e) {
            console.error('Error saving to storage', e);
            sessionStorage.setItem('auth_token', response.token);
            sessionStorage.setItem('user_id', response.userId.toString());
          }
        })
      );
  }

  signup(name: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, { name, email, password } as SignupRequest);
  }

  getProfile(): Observable<UserProfile> {
    const token = this.token();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`, { headers });
  }

  updateProfile(updateData: UpdateProfileRequest): Observable<UserProfile> {
    const token = this.token();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, updateData, { headers });
  }

  getOrders(): Observable<OrderSummary[]> {
    const token = this.token();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<OrderSummary[]>(`${this.apiUrl}/orders`, { headers });
  }

  getOrderById(id: number): Observable<OrderDetail> {
    const token = this.token();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get<OrderDetail>(`${this.apiUrl}/orders/${id}`, { headers });
  }

  logout() {
    this.token.set(null);
    this.userId.set(null);
    this.isAuthenticated.set(false);
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
    } catch (e) {
      console.error('Error removing from localStorage', e);
    }
    try {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_id');
    } catch (e) {
      console.error('Error removing from sessionStorage', e);
    }
    this.router.navigate(['/profile']);
  }

  getToken(): string | null {
    const token = this.token();
    if (!token) {
      const stored = this.getTokenFromStorage();
      if (stored) {
        this.token.set(stored);
        return stored;
      }
    }
    return token;
  }

  getUserId(): number | null {
    const userId = this.userId();
    if (userId === null || userId === undefined) {
      const stored = this.getUserIdFromStorage();
      if (stored) {
        this.userId.set(stored);
        return stored;
      }
    }
    return userId;
  }

  getAuthHeader() {
    const token = this.token();
    if (token) {
      return {
        'Authorization': `Bearer ${token}`
      };
    }
    return {};
  }
}
