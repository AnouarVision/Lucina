import { Component, inject, signal } from '@angular/core';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItemComponent } from './cart-item/cart-item.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItem } from '../../shared/models/cart-item';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CartItemComponent, OrderSummaryComponent, MatIconModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  authService = inject(AuthService);
  router = inject(Router);

  cart = this.cartService.cart;
  isLoading = signal(false);
  errorMessage = signal('');

  pageIndex = 1;
  readonly pageSize = 8;

  get pagedItems() {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.cart().items.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.cart().items.length / this.pageSize);
  }

  get hasPrevPage(): boolean { return this.pageIndex > 1; }
  get hasNextPage(): boolean { return this.pageIndex < this.totalPages; }

  nextPage() { if (this.hasNextPage) this.pageIndex++; }
  prevPage() { if (this.hasPrevPage) this.pageIndex--; }

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    const userId = this.authService.getUserId();
    if (!userId) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.cartService.loadCartFromApi(userId.toString()).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.errorMessage.set('Errore nel caricamento del carrello');
        this.isLoading.set(false);
      }
    });
  }

  addItem(item: CartItem) {
    this.cartService.addItem(item);
  }

  removeItem(productId: number) {
    this.cartService.removeItem(productId);
  }

  updateQuantity(productId: number, quantity: number) {
    this.cartService.updateQuantity(productId, quantity);
  }

  clearCart() {
    if (confirm('Sei sicuro di voler svuotare il carrello?')) {
      this.cartService.clearCart();
    }
  }

  continueShopping() {
    this.router.navigate(['/shop']);
  }

  get total() {
    return this.cart().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get itemCount() {
    return this.cart().items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
