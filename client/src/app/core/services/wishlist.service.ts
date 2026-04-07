import { Injectable, signal } from '@angular/core';

export interface WishlistItem {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string;
  addedDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private storageKey = 'wishlist_items';
  wishlist = signal<WishlistItem[]>(this.loadWishlistFromStorage());

  constructor() {}

  private loadWishlistFromStorage(): WishlistItem[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
      }
    } catch (e) {
      console.error('Error loading wishlist from storage', e);
    }
    return [];
  }

  private saveWishlistToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.wishlist()));
      }
    } catch (e) {
      console.error('Error saving wishlist to storage', e);
    }
  }

  addToWishlist(product: { id: number; name: string; price: number; imageUrl?: string }) {
    const existing = this.wishlist().find(item => item.productId === product.id);
    if (!existing) {
      const newItem: WishlistItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        addedDate: new Date()
      };
      this.wishlist.set([...this.wishlist(), newItem]);
      this.saveWishlistToStorage();
    }
  }

  removeFromWishlist(productId: number) {
    const updated = this.wishlist().filter(item => item.productId !== productId);
    this.wishlist.set(updated);
    this.saveWishlistToStorage();
  }

  isInWishlist(productId: number): boolean {
    return this.wishlist().some(item => item.productId === productId);
  }

  toggleWishlist(product: { id: number; name: string; price: number; imageUrl?: string }) {
    if (this.isInWishlist(product.id)) {
      this.removeFromWishlist(product.id);
    } else {
      this.addToWishlist(product);
    }
  }

  getWishlist(): WishlistItem[] {
    return this.wishlist();
  }

  clearWishlist() {
    this.wishlist.set([]);
    this.saveWishlistToStorage();
  }
}
