import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderRequest, PaymentDetails } from '../../shared/models/order';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'https://localhost:5001/api/payment';

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  createOrder(userId: string, request: CreateOrderRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-order/${userId}`, request, { headers: this.getAuthHeaders() });
  }

  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`, { headers: this.getAuthHeaders() });
  }

  getUserOrders(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getAuthHeaders() });
  }

  processPayment(orderId: number, paymentDetails: PaymentDetails): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${orderId}/process-payment`, paymentDetails, { headers: this.getAuthHeaders() });
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}/status`, { status }, { headers: this.getAuthHeaders() });
  }

  calculateOrderTotal(items: any[], discount: number, shippingCost: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calculate-total`, {
      items,
      discount,
      shippingCost
    }, { headers: this.getAuthHeaders() });
  }
}
