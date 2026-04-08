import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderRequest, PaymentDetails } from '../../shared/models/order';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:5001/api/payment';

  createOrder(userId: string, request: CreateOrderRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-order/${userId}`, request);
  }

  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`);
  }

  getUserOrders(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`);
  }

  processPayment(orderId: number, paymentDetails: PaymentDetails): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${orderId}/process-payment`, paymentDetails);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${orderId}/status`, { status });
  }

  calculateOrderTotal(items: any[], discount: number, shippingCost: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calculate-total`, {
      items,
      discount,
      shippingCost
    });
  }
}
