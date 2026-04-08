import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

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
  userId = signal<number | null>(this.getFromStorage('user_id') ? parseInt(this.getFromStorage('user_id')!, 10) : null);
  userEmail = signal<string | null>(this.getFromStorage('user_email'));
  userName = signal<string | null>(this.getFromStorage('user_name'));
  isAuthenticated = signal<boolean>(!!this.getFromStorage('user_id'));

  constructor(private http: HttpClient, private router: Router) {
    if (this.isAuthenticated()) {
      this.validateSession();
    }
  }

  private getFromStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private saveUserToStorage(userId: number, email: string, name: string): void {
    try {
      localStorage.setItem('user_id', userId.toString());
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_name', name);
    } catch {}
  }

  private clearUserFromStorage(): void {
    try {
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
    } catch {}
  }

  private validateSession(): void {
    this.http.get<{ userId: number; email: string; name: string }>(
      `${this.apiUrl}/validate`, { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.userId.set(res.userId);
        this.userEmail.set(res.email);
        this.userName.set(res.name);
        this.isAuthenticated.set(true);
      },
      error: () => {
        // 401 handled by interceptor (tries refresh, then logout)
      }
    });
  }

  login(email: string, password: string): Observable<{ userId: number; email: string; name: string }> {
    return this.http.post<{ userId: number; email: string; name: string }>(
      `${this.apiUrl}/login`, { email, password }, { withCredentials: true }
    ).pipe(
      tap(response => {
        this.userId.set(response.userId);
        this.userEmail.set(response.email);
        this.userName.set(response.name);
        this.isAuthenticated.set(true);
        this.saveUserToStorage(response.userId, response.email, response.name);
      })
    );
  }

  signup(name: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, { name, email, password }, { withCredentials: true });
  }

  refresh(): Observable<{ userId: number; email: string; name: string }> {
    return this.http.post<{ userId: number; email: string; name: string }>(
      `${this.apiUrl}/refresh`, {}, { withCredentials: true }
    ).pipe(
      tap(response => {
        this.userId.set(response.userId);
        this.userEmail.set(response.email);
        this.userName.set(response.name);
        this.isAuthenticated.set(true);
        this.saveUserToStorage(response.userId, response.email, response.name);
      })
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`, { withCredentials: true });
  }

  updateProfile(updateData: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, updateData, { withCredentials: true });
  }

  getOrders(): Observable<OrderSummary[]> {
    return this.http.get<OrderSummary[]>(`${this.apiUrl}/orders`, { withCredentials: true });
  }

  getOrderById(id: number): Observable<OrderDetail> {
    return this.http.get<OrderDetail>(`${this.apiUrl}/orders/${id}`, { withCredentials: true });
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe();
    this.userId.set(null);
    this.userEmail.set(null);
    this.userName.set(null);
    this.isAuthenticated.set(false);
    this.clearUserFromStorage();
    this.router.navigate(['/profile']);
  }

  getUserId(): number | null {
    return this.userId();
  }

  getToken(): string | null { return null; }
  getAuthHeader(): Record<string, string> { return {}; }
}
