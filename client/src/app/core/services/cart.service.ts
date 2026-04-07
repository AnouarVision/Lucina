import { Injectable, signal } from '@angular/core';
import { Cart } from '../../shared/models/cart';
import { CartItem } from '../../shared/models/cart-item';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  public cart = signal<Cart>({ userId: '', items: [] });
  private apiUrl = 'https://localhost:5001/api/cart';

  constructor(private http: HttpClient) {
    this.loadCartFromLocalStorage();
  }

  private loadCartFromLocalStorage() {
    const data = localStorage.getItem('cart');
    if (data) {
      this.cart.set(JSON.parse(data));
    }

    localStorage.removeItem('cart');
  }

  private saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cart()));
  }

  private syncCartToApi() {
    const userId = this.cart().userId;
    if (!userId) return;

    const items = this.cart().items.map(i => ({
      ProductId: i.productId,
      Name: i.name,
      Price: i.price,
      Quantity: i.quantity,
      ImageUrl: i.imageUrl
    }));

    this.http.post(`${this.apiUrl}/${userId}/set`, items)
      .subscribe({
        next: () => console.log('Cart synced successfully'),
        error: err => console.error('Error syncing cart:', err)
      });
  }

  addItem(item: CartItem) {
    const currentCart = { ...this.cart(), items: [...this.cart().items] };
    const existing = currentCart.items.find(i => i.productId === item.productId);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      currentCart.items.push({ ...item });
    }

    this.cart.set(currentCart);
    this.saveCartToLocalStorage();
    this.syncCartToApi();
  }

  removeItem(productId: number) {
    const currentCart = { ...this.cart() };
    currentCart.items = currentCart.items.filter(i => i.productId !== productId);
    this.cart.set(currentCart);
    this.saveCartToLocalStorage();
    this.syncCartToApi();
  }

  updateQuantity(productId: number, quantity: number) {
    const currentCart = { ...this.cart() };
    const item = currentCart.items.find(i => i.productId === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        currentCart.items = currentCart.items.filter(i => i.productId !== productId);
      }
      this.cart.set(currentCart);
      this.saveCartToLocalStorage();
      this.syncCartToApi();
    }
  }

  clearCart() {
    this.cart.set({ userId: this.cart().userId, items: [] });
    this.saveCartToLocalStorage();
    this.syncCartToApi();
  }

  loadCartFromApi(userId: string) {
    return this.http.get<Cart>(`${this.apiUrl}/${userId}`).pipe(
      tap(cart => {
        this.cart.set(cart);
        this.saveCartToLocalStorage();
      })
    );
  }
}
