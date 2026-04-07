import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ValidateCouponResponse {
  valid: boolean;
  message: string;
  discountPercent: number;
}

@Injectable({ providedIn: 'root' })
export class CouponService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'https://localhost:5001/api/coupon';
  readonly appliedCoupon = signal('');
  readonly discountPercent = signal(0);

  setCoupon(code: string, discount: number) {
    this.appliedCoupon.set(code.toUpperCase());
    this.discountPercent.set(discount);
  }

  clearCoupon() {
    this.appliedCoupon.set('');
    this.discountPercent.set(0);
  }

  private headers(): HttpHeaders {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  validate(code: string): Observable<ValidateCouponResponse> {
    return this.http.post<ValidateCouponResponse>(
      `${this.apiUrl}/validate`,
      { code },
      { headers: this.headers() }
    );
  }

  redeem(code: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/redeem`,
      { code },
      { headers: this.headers() }
    );
  }
}
