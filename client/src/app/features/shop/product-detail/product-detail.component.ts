import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { interval, Subscription } from 'rxjs';
import { Product } from '../../../shared/models/product';
import { ShopService } from '../../../core/services/shop.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartItem } from '../../../shared/models/cart-item';

@Component({
  selector: 'app-product-detail',
  imports: [
    CommonModule,
    MatCard,
    MatIconButton,
    MatIcon,
    CurrencyPipe
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private shopService = inject(ShopService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  readonly MAX_QUANTITY = 99;
  product: Product | null = null;
  availableStock = 0;
  isLoading = true;
  imageHovered = false;
  quantity = 1;
  addedToCart = false;
  private stockPollSub: Subscription | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(parseInt(id));
      }
    });
  }

  ngOnDestroy() {
    this.stockPollSub?.unsubscribe();
  }

  loadProduct(id: number) {
    this.shopService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
        this.availableStock = product.quantityInStock;
        this.refreshAvailableStock();
        this.startStockPolling();
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.isLoading = false;
      }
    });
  }

  private refreshAvailableStock() {
    if (!this.product) return;
    const userId = this.authService.userId();
    this.shopService.getAvailableStock(this.product.id, userId ?? undefined).subscribe({
      next: (n) => {
        this.availableStock = n;

        if (this.quantity > this.effectiveMax) {
          this.quantity = Math.max(1, this.effectiveMax);
        }
      }
    });
  }

  private startStockPolling() {
    this.stockPollSub?.unsubscribe();
    this.stockPollSub = interval(30_000).subscribe(() => this.refreshAvailableStock());
  }

  get effectiveMax(): number {
    return Math.min(this.availableStock, this.MAX_QUANTITY);
  }

  goBack() {
    this.router.navigate(['/shop']);
  }

  decreaseQuantity() {
    if (this.quantity > 1) this.quantity--;
  }

  increaseQuantity() {
    if (this.quantity < this.effectiveMax) this.quantity++;
  }

  addToCart() {
    if (!this.product || this.availableStock <= 0) return;
    if (this.quantity < 1 || this.quantity > this.effectiveMax) return;

    const item: CartItem = {
      productId: this.product.id,
      name: this.product.name,
      price: this.product.price,
      quantity: this.quantity,
      imageUrl: this.product.pictureUrl
    };

    this.cartService.addItem(item);
    this.addedToCart = true;

    this.refreshAvailableStock();

    setTimeout(() => {
      this.addedToCart = false;
    }, 2000);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}
