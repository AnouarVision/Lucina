import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Product } from '../../../shared/models/product';
import { ShopService } from '../../../core/services/shop.service';
import { CartService } from '../../../core/services/cart.service';
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
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private shopService = inject(ShopService);
  private cartService = inject(CartService);

  product: Product | null = null;
  isLoading = true;
  imageHovered = false;
  quantity = 1;
  addedToCart = false;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(parseInt(id));
      }
    });
  }

  loadProduct(id: number) {
    this.shopService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/shop']);
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity() {
    if (this.product && this.quantity < this.product.quantityInStock) {
      this.quantity++;
    }
  }

  addToCart() {
    if (!this.product) return;

    const item: CartItem = {
      productId: this.product.id,
      name: this.product.name,
      price: this.product.price,
      quantity: this.quantity,
      imageUrl: this.product.pictureUrl
    };

    this.cartService.addItem(item);
    this.addedToCart = true;

    setTimeout(() => {
      this.addedToCart = false;
    }, 2000);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}
