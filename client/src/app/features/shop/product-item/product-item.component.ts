import {Component, inject, Input} from '@angular/core';
import {Router} from '@angular/router';
import {Product} from '../../../shared/models/product';
import {CurrencyPipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {CartService} from '../../../core/services/cart.service';
import {FavoriteButtonComponent} from '../../../shared/components/favorite-button.component';
import {CartItem} from '../../../shared/models/cart-item';

@Component({
  selector: 'app-product-item',
  imports: [
    CurrencyPipe,
    MatIconModule,
    FavoriteButtonComponent
  ],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss'
})
export class ProductItemComponent {
  @Input() product!: Product;

  private cartService = inject(CartService);
  private router = inject(Router);

  viewDetails() {
    this.router.navigate(['/shop', this.product.id]);
  }

  addToCart() {
    const item: CartItem = {
      productId: this.product.id,
      name: this.product.name,
      price: this.product.price,
      quantity: 1,
      imageUrl: this.product.pictureUrl
    };

    // Aggiorna il carrello locale
    this.cartService.addItem(item);
  }
}
