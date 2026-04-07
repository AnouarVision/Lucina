import { Component, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, DecimalPipe, MatIconModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent {
  wishlistService = inject(WishlistService);
  cartService = inject(CartService);
  router = inject(Router);

  wishlist = this.wishlistService.wishlist;

  pageIndex = 1;
  readonly pageSize = 8;

  get pagedItems() {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.wishlist().slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.wishlist().length / this.pageSize);
  }

  get hasPrevPage(): boolean { return this.pageIndex > 1; }
  get hasNextPage(): boolean { return this.pageIndex < this.totalPages; }

  nextPage() { if (this.hasNextPage) this.pageIndex++; }
  prevPage() { if (this.hasPrevPage) this.pageIndex--; }

  addToCart(item: any) {
    this.cartService.addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl || '',
      quantity: 1
    });
  }

  removeFromWishlist(productId: number) {
    this.wishlistService.removeFromWishlist(productId);
  }

  goToShop() {
    this.router.navigate(['/shop']);
  }
}
