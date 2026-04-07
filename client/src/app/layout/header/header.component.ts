import {Component, inject, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ShopService} from '../../core/services/shop.service';
import {CartService} from '../../core/services/cart.service';
import {WishlistService} from '../../core/services/wishlist.service';
import {AuthService} from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    MatIcon,
    RouterLink,
    FormsModule,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private cartService = inject(CartService);
  cart = this.cartService.cart;

  private wishlistService = inject(WishlistService);
  wishlist = this.wishlistService.wishlist;

  private authService = inject(AuthService);
  isAuthenticated = this.authService.isAuthenticated;

  private shopService = inject(ShopService);
  private router = inject(Router);

  searchTerm: string = '';
  mobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  onSearch() {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) return;

    this.router.navigate(['/shop'], {queryParams: {search: this.searchTerm}});
  }

  get itemCount() {
    return this.cart().items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get wishlistCount() {
    return this.wishlist().length;
  }

  getProfileRoute() {
    return this.isAuthenticated() ? '/my-profile' : '/profile';
  }
}
