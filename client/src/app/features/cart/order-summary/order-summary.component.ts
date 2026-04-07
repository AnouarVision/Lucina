import { Component, inject, signal } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { CouponService } from '../../../core/services/coupon.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  days: number;
}

const FREE_SHIPPING_THRESHOLD = 65;

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss'],
  imports: [CommonModule, DecimalPipe, FormsModule, MatIconModule],
  standalone: true
})
export class OrderSummaryComponent {
  private cartService = inject(CartService);
  private couponService = inject(CouponService);
  private router = inject(Router);

  cart = this.cartService.cart;

  readonly FREE_SHIPPING_THRESHOLD = FREE_SHIPPING_THRESHOLD;

  couponInput = signal('');
  couponError = signal('');
  couponLoading = signal(false);
  selectedShippingId = signal('standard');
  appliedCoupon = this.couponService.appliedCoupon;
  discountPercent = this.couponService.discountPercent;

  shippingOptions: ShippingOption[] = [
    { id: 'standard', name: 'Spedizione Standard (5-7 gg)', price: 5, days: 7 },
    { id: 'express', name: 'Spedizione Express (1-2 gg)', price: 15, days: 2 },
    { id: 'overnight', name: 'Spedizione Notturna (24h)', price: 25, days: 1 },
  ];

  get subtotal() {
    return this.cart().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  get isFreeShipping(): boolean {
    return this.subtotal >= FREE_SHIPPING_THRESHOLD;
  }

  get amountToFreeShipping(): number {
    return Math.max(0, FREE_SHIPPING_THRESHOLD - this.subtotal);
  }

  get shippingCost(): number {
    if (this.cart().items.length === 0) return 0;
    const selected = this.shippingOptions.find(o => o.id === this.selectedShippingId());
    const base = selected?.price ?? 5;
    return (this.isFreeShipping && this.selectedShippingId() === 'standard') ? 0 : base;
  }

  get discountAmount() {
    return this.subtotal * (this.discountPercent() / 100);
  }

  get taxableAmount() {
    return this.subtotal - this.discountAmount + this.shippingCost;
  }

  get tax() {
    return this.taxableAmount * 0.1;
  }

  get total() {
    return this.taxableAmount + this.tax;
  }

  get isEmpty(): boolean {
    return this.cart().items.length === 0;
  }

  applyCoupon() {
    const code = this.couponInput().trim();
    if (!code) return;

    this.couponLoading.set(true);
    this.couponError.set('');

    this.couponService.validate(code).subscribe({
      next: res => {
        this.couponLoading.set(false);
        if (res.valid) {
          this.couponService.setCoupon(code, res.discountPercent);
          this.couponError.set('');
        } else {
          this.couponError.set(res.message);
        }
      },
      error: () => {
        this.couponLoading.set(false);
        this.couponError.set('Errore nella verifica del codice.');
      }
    });
  }

  removeCoupon() {
    this.couponInput.set('');
    this.couponService.clearCoupon();
    this.couponError.set('');
  }

  proceedToCheckout() {
    if (this.isEmpty) return;
    this.router.navigate(['/checkout']);
  }
}

