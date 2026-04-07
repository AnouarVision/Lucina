import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CartItem } from '../../../shared/models/cart-item';
import { DecimalPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-item',
  imports: [
    CommonModule,
    MatIcon,
    DecimalPipe
  ],
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss'],
  standalone: true
})
export class CartItemComponent {
  @Input() item!: CartItem;
  @Output() remove = new EventEmitter<number>();
  @Output() quantityChange = new EventEmitter<number>();

  isRemoving = signal(false);

  increaseQuantity() {
    this.item.quantity++;
    this.quantityChange.emit(this.item.quantity);
  }

  decreaseQuantity() {
    if (this.item.quantity > 1) {
      this.item.quantity--;
      this.quantityChange.emit(this.item.quantity);
    }
  }

  removeItem() {
    this.isRemoving.set(true);
    setTimeout(() => {
      this.remove.emit(this.item.productId);
    }, 300);
  }

  get itemTotal(): number {
    return this.item.price * this.item.quantity;
  }
}
