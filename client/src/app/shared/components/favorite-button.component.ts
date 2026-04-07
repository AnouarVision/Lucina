import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <button
      (click)="toggleFavorite($event)"
      class="favorite-btn"
      [class.favorited]="isFavorited()"
      type="button"
      aria-label="Toggle favorite">
      <mat-icon [fontIcon]="isFavorited() ? 'favorite' : 'favorite_border'" />
    </button>
  `,
  styles: [`
    .favorite-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 200ms ease;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .favorite-btn:hover {
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: scale(1.1);
    }

    .favorite-btn mat-icon {
      color: #999;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .favorite-btn.favorited mat-icon {
      color: #e74c3c;
    }
  `]
})
export class FavoriteButtonComponent {
  product = input.required<{ id: number; name: string; price: number; imageUrl?: string }>();
  wishlistService = inject(WishlistService);

  isFavorited() {
    return this.wishlistService.isInWishlist(this.product().id);
  }

  toggleFavorite(event: MouseEvent) {
    event.stopPropagation();
    this.wishlistService.toggleWishlist(this.product());
  }
}
